import { Radio, Video } from 'lucide-react'

function InvitePanel({ roomCode, peerConnected, roomInput, onRoomInputChange, onJoin }) {
  return <section className="panel-section invite-section"><div className="panel-title-row"><div><p className="eyebrow">مع بعض أحلى</p><h2>{peerConnected ? 'في حد معاك' : 'ادعُ حد للبث'}</h2></div><span className={`guest-icon ${peerConnected ? 'guest-online' : ''}`}><Radio size={18} /></span></div>
    {roomCode ? <div className="invite-active"><span className={`guest-status-dot ${peerConnected ? 'guest-status-online' : ''}`} /><div><strong>{peerConnected ? 'متصل بالبث' : 'بانتظار الضيف'}</strong><small>{peerConnected ? 'الصوت والصورة يعملان' : `كود الغرفة ${roomCode}`}</small></div></div> : <><p className="invite-copy">ابدأ بثك وشارك الرابط، أو انضم لغرفة صديقك.</p><form className="join-form" onSubmit={onJoin}><input aria-label="كود الغرفة" placeholder="كود الغرفة" value={roomInput} onChange={(event) => onRoomInputChange(event.target.value.toUpperCase())} maxLength={8} /><button type="submit" title="انضمام للغرفة" aria-label="انضمام للغرفة"><Video size={17} /></button></form></>}
  </section>
}

export default InvitePanel