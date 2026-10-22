import { Glasses, Sparkles, Video } from 'lucide-react'

export const filters = [
  { id: 'none', label: 'بدون فلتر', icon: Video, tone: 'plain' },
  { id: 'glasses', label: 'نظارة', icon: Glasses, tone: 'blue' },
  { id: 'mustache', label: 'شنب', icon: null, tone: 'amber' },
  { id: 'sparkles', label: 'لمعة', icon: Sparkles, tone: 'pink' },
]

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const VISION_WASM_URL = import.meta.env.DEV
  ? '/node_modules/@mediapipe/tasks-vision/wasm'
  : 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'

export async function createFaceLandmarker() {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks(VISION_WASM_URL)
  const options = { runningMode: 'VIDEO', numFaces: 1 }
  try {
    return await FaceLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' } })
  } catch {
    return FaceLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' } })
  }
}

export function drawFaceFilter(context, landmarks, width, height, filter) {
  const point = (index) => ({ x: landmarks[index].x * width, y: landmarks[index].y * height })
  if (filter === 'glasses') {
    const left = point(33)
    const leftInner = point(133)
    const rightInner = point(362)
    const right = point(263)
    const eyeDistance = Math.hypot(right.x - left.x, right.y - left.y)
    const lensWidth = eyeDistance * 0.39
    const lensHeight = lensWidth * 0.72
    const centers = [
      { x: (left.x + leftInner.x) / 2, y: (left.y + leftInner.y) / 2 },
      { x: (right.x + rightInner.x) / 2, y: (right.y + rightInner.y) / 2 },
    ]
    context.save()
    context.strokeStyle = '#f2e8cb'
    context.lineWidth = Math.max(3, eyeDistance * 0.035)
    context.shadowColor = 'rgba(13, 22, 24, .45)'
    context.shadowBlur = 8
    for (const center of centers) {
      context.beginPath()
      context.ellipse(center.x, center.y, lensWidth / 2, lensHeight / 2, 0, 0, Math.PI * 2)
      context.stroke()
    }
    context.beginPath()
    context.moveTo(centers[0].x + lensWidth / 2, centers[0].y)
    context.lineTo(centers[1].x - lensWidth / 2, centers[1].y)
    context.stroke()
    context.restore()
    return
  }
  if (filter === 'mustache') {
    const center = point(0)
    const left = point(61)
    const right = point(291)
    const halfWidth = Math.hypot(right.x - left.x, right.y - left.y) * 0.31
    const heightOffset = Math.max(7, halfWidth * 0.08)
    context.save()
    context.fillStyle = '#30241e'
    context.shadowColor = 'rgba(13, 22, 24, .45)'
    context.shadowBlur = 7
    context.beginPath()
    context.moveTo(center.x, center.y + heightOffset)
    context.bezierCurveTo(center.x - halfWidth * 0.35, center.y - heightOffset, center.x - halfWidth * 0.92, center.y - heightOffset * 0.6, center.x - halfWidth, center.y + heightOffset * 1.1)
    context.bezierCurveTo(center.x - halfWidth * 0.55, center.y + heightOffset * 0.7, center.x - halfWidth * 0.2, center.y + heightOffset * 1.8, center.x, center.y + heightOffset)
    context.bezierCurveTo(center.x + halfWidth * 0.2, center.y + heightOffset * 1.8, center.x + halfWidth * 0.55, center.y + heightOffset * 0.7, center.x + halfWidth, center.y + heightOffset * 1.1)
    context.bezierCurveTo(center.x + halfWidth * 0.92, center.y - heightOffset * 0.6, center.x + halfWidth * 0.35, center.y - heightOffset, center.x, center.y + heightOffset)
    context.fill()
    context.restore()
    return
  }
  if (filter === 'sparkles') {
    const sparklePoints = [point(10), point(234), point(454)]
    const size = Math.max(12, Math.hypot(point(33).x - point(263).x, point(33).y - point(263).y) * 0.09)
    context.save()
    context.fillStyle = '#ffe58a'
    context.shadowColor = '#ffcf5b'
    context.shadowBlur = 14
    for (const [index, sparkle] of sparklePoints.entries()) {
      const radius = index === 0 ? size * 0.72 : size
      context.beginPath()
      context.moveTo(sparkle.x, sparkle.y - radius)
      context.quadraticCurveTo(sparkle.x + radius * 0.16, sparkle.y - radius * 0.16, sparkle.x + radius, sparkle.y)
      context.quadraticCurveTo(sparkle.x + radius * 0.16, sparkle.y + radius * 0.16, sparkle.x, sparkle.y + radius)
      context.quadraticCurveTo(sparkle.x - radius * 0.16, sparkle.y + radius * 0.16, sparkle.x - radius, sparkle.y)
      context.quadraticCurveTo(sparkle.x - radius * 0.16, sparkle.y - radius * 0.16, sparkle.x, sparkle.y - radius)
      context.fill()
    }
    context.restore()
  }
}