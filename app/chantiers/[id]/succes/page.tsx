'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import { PrimaryButton } from '@/components/Buttons'
import { IconCheckCircle, IconCheck, IconDownload } from '@/components/icons'

const ACCENT = '#2BA464'

export default function SuccesPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { theme: T } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const id = params.id
  const [step, setStep] = useState(0)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/chantiers/${id}`).then(r => r.json()).then(d => { if (d.pdf_url) setPdfUrl(d.pdf_url) })
  }, [id])

  useEffect(() => {
    const timers = [600, 1100, 1600].map((d, i) => setTimeout(() => setStep(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  useGSAP(() => {
    const tl = gsap.timeline()
    tl.fromTo(iconRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.2)
    tl.fromTo('.success-title', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.55)
    tl.fromTo('.success-sub',   { opacity: 0, y: 8  }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.7)
  }, { scope: containerRef })

  const items = ['PDF généré et signé', 'Client notifié par email', 'Demande d\'avis envoyée']

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.card,
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <StatusBar dark={T.dark} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px', textAlign: 'center', gap: 32 }}>

          <div ref={iconRef} style={{ opacity: 0, position: 'relative' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: T.dark ? '#1A3A1A' : '#EAF3DE',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${ACCENT}33` }} />
              <div style={{ color: ACCENT }}><IconCheckCircle size={68} sw={1.5} /></div>
            </div>
          </div>

          <div>
            <h1 className="success-title" style={{ fontSize: 28, fontWeight: 700, color: T.dark ? '#4ADE80' : '#27500A',
              margin: 0, letterSpacing: -0.4, opacity: 0 }}>
              Chantier clôturé !
            </h1>
            <p className="success-sub" style={{ fontSize: 15, color: T.subtle, margin: '8px 0 0', opacity: 0 }}>
              Tout est en ordre. Le procès-verbal a été généré.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 280 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                opacity: step > i ? 1 : 0.2, transform: step > i ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all .35s ease-out', fontSize: 15, color: T.text, textAlign: 'left' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%',
                  background: step > i ? ACCENT : T.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, transition: 'background .2s' }}>
                  {step > i && <IconCheck size={13} sw={3} />}
                </div>
                {it}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 52, background: T.dark ? '#1A3A1A' : '#F0FDF4',
              border: `1px solid ${T.dark ? '#2A6A2A' : '#BBF7D0'}`,
              borderRadius: 12, color: '#15803D', fontWeight: 600, fontSize: 15,
              textDecoration: 'none', fontFamily: 'inherit',
            }}>
              <IconDownload size={18} sw={2} />Télécharger le procès-verbal
            </a>
          )}
          <PrimaryButton onClick={() => router.push('/')}>Retour au dashboard</PrimaryButton>
        </div>
      </div>
    </MobileShell>
  )
}
