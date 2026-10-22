import { Radio } from 'lucide-react'
import CameraPreview from '../components/CameraPreview.jsx'
import FilterPicker from '../components/FilterPicker.jsx'
import InvitePanel from '../components/InvitePanel.jsx'
import StudioControls from '../components/StudioControls.jsx'
import StudioHeader from '../components/StudioHeader.jsx'
import { useLiveStudio } from '../hooks/useLiveStudio.js'
import './StudioPage.css'

function StudioPage() {
  const studio = useLiveStudio()
  return <main className="studio" dir="rtl">
    <StudioHeader />
    <section className="workspace"><div className="section-heading"><div><p className="eyebrow">مساحة البث</p><h1>خليك على طبيعتك، أو لأ.</h1></div><span className="studio-tag"><span className="status-dot" /> {studio.roomCode ? 'الغرفة مفتوحة' : 'جاهز للبدء'}</span></div>
      <div className="studio-grid"><section className="preview-column" aria-label="معاينة الكاميرا">
        <CameraPreview videoRef={studio.videoRef} canvasRef={studio.canvasRef} remoteVideoRef={studio.remoteVideoRef} cameraStream={studio.cameraStream} cameraOn={studio.cameraOn} micOn={studio.micOn} roomCode={studio.roomCode} roomRole={studio.roomRole} peerConnected={studio.peerConnected} onStartCamera={studio.startCamera} />
        <StudioControls cameraOn={studio.cameraOn} micOn={studio.micOn} roomCode={studio.roomCode} copied={studio.copied} busy={studio.busy} onToggleCamera={studio.toggleCamera} onToggleMic={studio.toggleMic} onStartBroadcast={studio.startBroadcast} onCopyInvite={studio.copyInvite} onEndBroadcast={studio.endBroadcast} />
        {studio.cameraError && <p className="error-message" role="alert">{studio.cameraError}</p>}
      </section><aside className="side-panel">
        <FilterPicker activeFilter={studio.activeFilter} onChange={studio.setActiveFilter} status={studio.filterStatus} />
        <InvitePanel roomCode={studio.roomCode} peerConnected={studio.peerConnected} roomInput={studio.roomInput} onRoomInputChange={studio.setRoomInput} onJoin={studio.joinBroadcast} />
        <div className="privacy-note"><span className="privacy-lock">✳</span><p>بثك خاص ومباشر<br /><strong>الصورة لا تُحفظ على الخادم</strong></p></div>
      </aside></div>
    </section>
    <footer className="footer"><span>luma live</span><span>صُنِع للحظات الحلوة</span><span>اتصال مباشر من طرف لطرف <Radio size={14} /></span></footer>
  </main>
}

export default StudioPage