import { Check, Sparkles } from 'lucide-react'
import { filters } from '../services/faceFilters.js'

function FilterPicker({ activeFilter, onChange, status }) {
  return <section className="panel-section filter-section"><div className="panel-title-row"><div><p className="eyebrow">عدسة اليوم</p><h2>اختار فلترك</h2></div><Sparkles className="title-sparkle" size={19} /></div><div className="filter-grid">
    {filters.map((filter) => {
      const Icon = filter.icon
      return <button key={filter.id} className={`filter-option ${activeFilter === filter.id ? 'filter-selected' : ''}`} onClick={() => onChange(filter.id)} aria-pressed={activeFilter === filter.id}><span className={`filter-art filter-${filter.tone}`}>{Icon ? <Icon size={22} strokeWidth={1.8} /> : <span className="mustache-mark">〰</span>}</span><span>{filter.label}</span>{activeFilter === filter.id && <Check className="filter-check" size={14} />}</button>
    })}
  </div><p className="filter-status"><span className={status === 'الفلاتر جاهزة' ? 'status-ready' : ''} />{status}</p></section>
}

export default FilterPicker