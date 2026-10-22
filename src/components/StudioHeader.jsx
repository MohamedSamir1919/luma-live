import { Radio, Wifi } from 'lucide-react'

function StudioHeader() {
  return <header className="topbar"><a className="brand" href="/" aria-label="لوما لايف"><span className="brand-mark"><Radio size={19} strokeWidth={2.4} /></span><span>luma<span className="brand-light">live</span></span></a><div className="topbar-center"><span className="live-dot" /> استوديو البث المباشر</div><div className="topbar-right"><span className="connection"><Wifi size={15} /> اتصال مباشر</span><span className="avatar">م</span></div></header>
}

export default StudioHeader