import { Check, Copy, Mic, MicOff, Radio, Video, VideoOff, X } from 'lucide-react'

function StudioControls({ cameraOn, micOn, roomCode, copied, busy, onToggleCamera, onToggleMic, onStartBroadcast, onCopyInvite, onEndBroadcast }) {
  return <div className="control-bar"><div className="device-controls">
    <button className={`round-control ${!cameraOn ? 'control-off' : ''}`} onClick={onToggleCamera} title={cameraOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'} aria-label={cameraOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}>{cameraOn ? <Video size={19} /> : <VideoOff size={19} />}</button>
    <button className={`round-control ${!micOn ? 'control-off' : ''}`} onClick={onToggleMic} title={micOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'} aria-label={micOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}>{micOn ? <Mic size={19} /> : <MicOff size={19} />}</button><span className="control-divider" /><span className="device-label">الكاميرا والميكروفون</span>
  </div>{roomCode ? <div className="live-actions"><button className="button button-copy" onClick={onCopyInvite}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'تم النسخ' : 'نسخ رابط الدعوة'}</button><button className="button button-end" onClick={onEndBroadcast}><X size={16} /> إنهاء</button></div> : <button className="button button-live" onClick={onStartBroadcast} disabled={busy}><Radio size={17} /> {busy ? 'جارٍ التجهيز...' : 'ابدأ البث'}</button>}</div>
}

export default StudioControls