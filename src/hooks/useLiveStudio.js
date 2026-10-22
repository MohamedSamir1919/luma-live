import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { createFaceLandmarker, drawFaceFilter } from '../services/faceFilters.js'

export function useLiveStudio() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const socketRef = useRef(null)
  const peerRef = useRef(null)
  const landmarkerRef = useRef(null)
  const filterRef = useRef('none')
  const pendingCandidatesRef = useRef([])
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [activeFilter, setActiveFilter] = useState('none')
  const [roomCode, setRoomCode] = useState(new URLSearchParams(window.location.search).get('room') || '')
  const [roomInput, setRoomInput] = useState(new URLSearchParams(window.location.search).get('room') || '')
  const [roomRole, setRoomRole] = useState('')
  const [peerConnected, setPeerConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [filterStatus, setFilterStatus] = useState('جاري تجهيز فلاتر الوجه')
  const [busy, setBusy] = useState(false)

  useEffect(() => { filterRef.current = activeFilter }, [activeFilter])

  useEffect(() => {
    let cancelled = false
    createFaceLandmarker().then((landmarker) => {
      if (cancelled) { landmarker.close(); return }
      landmarkerRef.current = landmarker
      setFilterStatus('الفلاتر جاهزة')
    }).catch(() => setFilterStatus('تعذر تحميل الفلاتر'))
    return () => {
      cancelled = true
      landmarkerRef.current?.close()
      landmarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!cameraStream) return undefined
    let animationFrame = 0
    let lastDetection = 0
    let faceLandmarks = null
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!video || !canvas || !context) return undefined
    video.srcObject = cameraStream
    video.play().catch(() => {})
    const render = (timestamp) => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        context.save()
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const filter = filterRef.current
        const landmarker = landmarkerRef.current
        if (filter === 'none') faceLandmarks = null
        else if (landmarker && timestamp - lastDetection > 50) {
          faceLandmarks = landmarker.detectForVideo(video, timestamp).faceLandmarks[0] || null
          lastDetection = timestamp
        }
        if (filter !== 'none' && faceLandmarks) drawFaceFilter(context, faceLandmarks, canvas.width, canvas.height, filter)
        context.restore()
      }
      animationFrame = requestAnimationFrame(render)
    }
    animationFrame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrame)
  }, [cameraStream])

  useEffect(() => () => {
    socketRef.current?.disconnect()
    peerRef.current?.close()
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true })
      cameraStreamRef.current = stream
      setCameraStream(stream)
      setCameraOn(true)
      setMicOn(true)
    } catch {
      setCameraError('اسمح باستخدام الكاميرا والميكروفون من إعدادات المتصفح.')
    }
  }

  function createPeerConnection() {
    if (peerRef.current) return peerRef.current
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    const canvasStream = canvasRef.current.captureStream(30)
    const audioTrack = cameraStreamRef.current?.getAudioTracks()[0]
    if (audioTrack) canvasStream.addTrack(audioTrack)
    canvasStream.getTracks().forEach((track) => peer.addTrack(track, canvasStream))
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]
      setPeerConnected(true)
    }
    peer.onicecandidate = (event) => { if (event.candidate) socketRef.current?.emit('rtc:ice', event.candidate) }
    peer.onconnectionstatechange = () => {
      setPeerConnected(peer.connectionState === 'connected')
      if (peer.connectionState === 'failed') peer.restartIce()
    }
    peerRef.current = peer
    return peer
  }

  async function flushCandidates(peer) {
    const candidates = pendingCandidatesRef.current.splice(0)
    await Promise.all(candidates.map((candidate) => peer.addIceCandidate(candidate).catch(() => {})))
  }

  function joinSocketRoom(code, hostToken = '') {
    const socket = io(window.location.origin, { autoConnect: false })
    socketRef.current = socket
    setRoomCode(code)
    socket.on('connect', () => socket.emit('room:join', { roomCode: code, hostToken, name: 'ضيف' }, (response) => {
      if (!response?.ok) { setCameraError(response?.error || 'تعذر الانضمام إلى الغرفة.'); return }
      setRoomRole(response.role)
      if (response.role === 'guest') createPeerConnection()
    }))
    socket.on('peer:joined', async () => {
      const peer = createPeerConnection()
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      socket.emit('rtc:offer', offer)
    })
    socket.on('rtc:offer', async (offer) => {
      const peer = createPeerConnection()
      await peer.setRemoteDescription(offer)
      await flushCandidates(peer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('rtc:answer', answer)
    })
    socket.on('rtc:answer', async (answer) => {
      const peer = peerRef.current
      if (!peer) return
      await peer.setRemoteDescription(answer)
      await flushCandidates(peer)
    })
    socket.on('rtc:ice', async (candidate) => {
      const peer = peerRef.current
      if (!peer || !peer.remoteDescription) { pendingCandidatesRef.current.push(candidate); return }
      await peer.addIceCandidate(candidate).catch(() => {})
    })
    socket.on('peer:left', () => {
      setPeerConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      peerRef.current?.close()
      peerRef.current = null
    })
    socket.on('connect_error', () => setCameraError('تعذر الاتصال بالخادم. تأكد من تشغيل backend.'))
    socket.connect()
  }

  async function startBroadcast() {
    if (!cameraStream) { setCameraError('شغّل الكاميرا أولًا قبل بدء البث.'); return }
    setBusy(true)
    try {
      const response = await fetch('https://backend-for-live-meet.vercel.app/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'بث مباشر' }) })
      if (!response.ok) throw new Error('backend unavailable')
      const room = await response.json()
      setRoomRole('host')
      joinSocketRoom(room.roomCode, room.hostToken)
      window.history.replaceState({}, '', `?room=${room.roomCode}`)
      setRoomInput(room.roomCode)
    } catch {
      setCameraError('الخادم غير متصل. شغّل تطبيق backend ثم حاول مرة أخرى.')
    } finally { setBusy(false) }
  }

  function joinBroadcast(event) {
    event.preventDefault()
    const code = roomInput.trim().toUpperCase()
    if (!cameraStream) { setCameraError('شغّل الكاميرا أولًا قبل الانضمام.'); return }
    if (code.length < 4) { setCameraError('اكتب كود غرفة صحيحًا.'); return }
    setCameraError('')
    setRoomRole('guest')
    joinSocketRoom(code)
    window.history.replaceState({}, '', `?room=${code}`)
  }

  function toggleCamera() {
    const track = cameraStreamRef.current?.getVideoTracks()[0]
    if (!track) { startCamera(); return }
    track.enabled = !track.enabled
    setCameraOn(track.enabled)
  }

  function toggleMic() {
    const track = cameraStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMicOn(track.enabled)
  }

  async function copyInvite() {
    const invite = `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    try {
      await navigator.clipboard.writeText(invite)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { setCameraError('تعذر نسخ الرابط من المتصفح.') }
  }

  function endBroadcast() {
    socketRef.current?.disconnect()
    peerRef.current?.close()
    socketRef.current = null
    peerRef.current = null
    setPeerConnected(false)
    setRoomCode('')
    setRoomRole('')
    window.history.replaceState({}, '', window.location.pathname)
  }

  return {
    videoRef, canvasRef, remoteVideoRef, cameraStream, cameraOn, micOn,
    activeFilter, setActiveFilter, roomCode, roomInput, setRoomInput,
    roomRole, peerConnected, copied, cameraError, filterStatus, busy,
    startCamera, startBroadcast, joinBroadcast, toggleCamera, toggleMic,
    copyInvite, endBroadcast,
  }
}