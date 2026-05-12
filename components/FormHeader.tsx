'use client'
import { useRouter } from 'next/navigation'
import { IconChevronLeft } from './icons'

interface Props {
  title: string
  onBack?: () => void
  backHref?: string
  cancelLabel?: string
}

export default function FormHeader({ title, onBack, backHref, cancelLabel = 'Annuler' }: Props) {
  const router = useRouter()
  const handleBack = onBack ?? (() => backHref ? router.push(backHref) : router.back())

  return (
    <div style={{
      height: 56, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 4px',
      background: '#fff',
      borderBottom: '0.5px solid #E5E7EB',
      position: 'relative', zIndex: 2,
    }}>
      <button onClick={handleBack} style={{
        width: 48, height: 48, background: 'none', border: 'none',
        cursor: 'pointer', color: '#6B7280',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconChevronLeft size={24} sw={2.25} />
      </button>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}>{title}</div>
      <button onClick={handleBack} style={{
        height: 48, padding: '0 16px', background: 'none', border: 'none',
        cursor: 'pointer', color: '#6B7280', fontSize: 15, fontWeight: 500,
      }}>{cancelLabel}</button>
    </div>
  )
}
