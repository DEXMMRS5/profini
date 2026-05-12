'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import { PrimaryButton } from '@/components/Buttons'
import ProFiniLogo from '@/components/ProFiniLogo'
import { IconUser, IconPhone, IconMail, IconLogOut, IconChevronRight, IconCheck } from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const,
      color: '#6B7280', padding: '0 16px', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function SettingRow({ icon: Ico, label, value, onPress, last }: {
  icon: React.ComponentType<{ size?: number; sw?: number }>
  label: string; value?: string; onPress?: () => void; last?: boolean
}) {
  return (
    <button onClick={onPress} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', background: '#fff',
      borderBottom: last ? 'none' : '1px solid #F3F4F6',
      border: 'none', cursor: onPress ? 'pointer' : 'default', textAlign: 'left',
      fontFamily: 'inherit',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${PRIMARY}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, flexShrink: 0 }}>
        <Ico size={18} sw={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{label}</div>
        {value && <div style={{ fontSize: 13, color: '#6B7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>}
      </div>
      {onPress && <IconChevronRight size={16} sw={2} color="#D1D5DB" />}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [artisan, setArtisan] = useState<{ nom: string; email: string; tel?: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState('')
  const [tel, setTel] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/artisan').then(r => r.json()).then(d => {
      setArtisan(d)
      setNom(d.nom ?? '')
      setTel(d.tel ?? '')
    })
  }, [])

  useGSAP(() => {
    gsap.fromTo('.settings-section',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    )
  }, { scope: containerRef })

  async function handleSave() {
    setLoading(true)
    const res = await fetch('/api/artisan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, tel }),
    })
    const data = await res.json()
    setArtisan(data)
    setLoading(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inputSt: React.CSSProperties = {
    width: '100%', height: 48, padding: '0 14px', fontSize: 16,
    fontFamily: 'inherit', color: '#111827', background: '#F9FAFB',
    border: `1px solid ${PRIMARY}`, borderRadius: 12, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB',
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <StatusBar />

        {/* Header */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: '#fff', borderBottom: '0.5px solid #E5E7EB', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Réglages</span>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
              color: ACCENT, fontWeight: 600, animation: 'fadeIn .3s ease-out' }}>
              <IconCheck size={16} sw={2.5} />Sauvegardé
            </span>
          )}
        </div>

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 0 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Profile card */}
          <div className="settings-section" style={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px',
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #0A2240 100%)`, margin: '0 16px',
              borderRadius: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100,
                borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}40, transparent 70%)` }} />
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ProFiniLogo color="#fff" accent={ACCENT} size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{artisan?.nom ?? '…'}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{artisan?.email}</div>
                {artisan?.tel && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>{artisan.tel}</div>}
              </div>
            </div>
          </div>

          {/* Profile edition */}
          <div className="settings-section" style={{ opacity: 0 }}>
            <SectionTitle>Mon profil</SectionTitle>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', margin: '0 16px' }}>
              {!editing ? (
                <>
                  <SettingRow icon={IconUser} label="Nom" value={artisan?.nom} onPress={() => setEditing(true)} />
                  <SettingRow icon={IconPhone} label="Téléphone" value={artisan?.tel ?? 'Non renseigné'} onPress={() => setEditing(true)} />
                  <SettingRow icon={IconMail} label="Email" value={artisan?.email} last />
                </>
              ) : (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nom</span>
                    <input value={nom} onChange={e => setNom(e.target.value)} style={inputSt} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Téléphone</span>
                    <input value={tel} onChange={e => setTel(e.target.value)} type="tel" style={inputSt} />
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setEditing(false)} style={{ flex: 1, height: 44, background: '#F3F4F6',
                      border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                      Annuler
                    </button>
                    <button onClick={handleSave} disabled={loading} style={{ flex: 2, height: 44, background: PRIMARY,
                      border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}>
                      {loading ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* App info */}
          <div className="settings-section" style={{ opacity: 0 }}>
            <SectionTitle>Application</SectionTitle>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', margin: '0 16px' }}>
              <SettingRow icon={IconMail} label="Version" value="1.0.0" />
              <SettingRow icon={IconUser} label="Développé avec ProFini" value="profini.vercel.app" last />
            </div>
          </div>

          {/* Logout */}
          <div className="settings-section" style={{ opacity: 0, padding: '0 16px' }}>
            <button onClick={handleLogout} style={{
              width: '100%', height: 52, background: '#FEF2F2',
              border: '1px solid #FECACA', borderRadius: 14,
              fontSize: 15, fontWeight: 600, color: '#DC2626',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <IconLogOut size={18} sw={2} />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <BottomNav active="settings" />
      </div>
    </MobileShell>
  )
}

function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  const PRIMARY = '#15355B'
  const items = [
    { id: 'home', label: 'Dashboard', path: '/' },
    { id: 'chantiers', label: 'Chantiers', path: '/chantiers-list' },
    { id: 'settings', label: 'Réglages', path: '/settings' },
  ]
  return (
    <div style={{ position: 'sticky', bottom: 0, height: 72, background: '#fff',
      borderTop: '0.5px solid #E5E7EB', display: 'flex', alignItems: 'center',
      justifyContent: 'space-around', paddingBottom: 8, zIndex: 5, flexShrink: 0 }}>
      {items.map(n => (
        <button key={n.id} onClick={() => router.push(n.path)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '8px 20px', color: n.id === active ? PRIMARY : '#9CA3AF', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 11, fontWeight: n.id === active ? 600 : 500 }}>{n.label}</span>
        </button>
      ))}
    </div>
  )
}
