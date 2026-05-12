import { ChantierStatus } from '@/lib/types'

const MAP: Record<ChantierStatus, { bg: string; fg: string; dot: string; label: string }> = {
  encours: { bg: '#FAEEDA', fg: '#633806', dot: '#EF9F27', label: 'En cours' },
  impaye:  { bg: '#FCEBEB', fg: '#791F1F', dot: '#E24B4A', label: 'Impayé' },
  paye:    { bg: '#EAF3DE', fg: '#27500A', dot: '#639922', label: 'Payé' },
  cloture: { bg: '#EAF3DE', fg: '#27500A', dot: '#639922', label: 'Clôturé' },
}

export default function Badge({ status }: { status: ChantierStatus }) {
  const m = MAP[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 26, padding: '0 10px',
      fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
      background: m.bg, color: m.fg, borderRadius: 999,
    }}>
      <i style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {m.label}
    </span>
  )
}
