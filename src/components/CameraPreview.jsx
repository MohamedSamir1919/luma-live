import { Camera, CameraOff, Mic, MicOff } from 'lucide-react'

function CameraPreview({ videoRef, canvasRef, remoteVideoRef, cameraStream, cameraOn, micOn, roomCode, roomRole, peerConnected, onStartCamera }) {
  return <div className="preview-frame">
    <video ref={videoRef} className="source-video" playsInline muted />
    <canvas ref={canvasRef} className={`preview-canvas ${cameraStream ? 'is-visible' : ''}`} />
    {!cameraStream && <div className="camera-placeholder"><div className="placeholder-icon"><Camera size={27} /></div><h2>مساحتك جاهزة</h2><p>افتح الكاميرا وابدأ تجهيز البث</p><button className="button button-primary" onClick={onStartCamera}><Camera size={17} /> تشغيل الكاميرا</button></div>}
    {cameraStream && !cameraOn && <div className="camera-paused"><CameraOff size={25} /><span>الكاميرا متوقفة</span></div>}
    <video ref={remoteVideoRef} className={`remote-video ${peerConnected ? 'remote-visible' : ''}`} autoPlay playsInline />
    <div className="preview-topline"><span className={`preview-state ${roomCode ? 'preview-live' : ''}`}><span /> {roomCode ? 'مباشر' : 'معاينة خاصة'}</span>{roomCode && <span className="room-id">غرفة {roomCode}</span>}</div>
    <div className="preview-caption"><span className="caption-avatar">م</span><span>{roomRole === 'guest' ? 'أنت ضيف' : 'أنت'}</span><span className="caption-mic">{micOn ? <Mic size={14} /> : <MicOff size={14} />}</span></div>
    {peerConnected && <div className="remote-label">الضيف متصل</div>}
  </div>
}

export default CameraPreview