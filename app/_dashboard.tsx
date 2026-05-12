'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import ProFiniLogo from '@/components/ProFiniLogo'
import Badge from '@/components/Badge'
import { Chantier, Artisan, ChantierStatus, formatEur } from '@/lib/types'
import {
  IconSearch, IconTrendingUp, IconClock, IconCheck,
  IconCalendar, IconEuro, IconChevronRight, IconPlus,
  IconHome, IconBriefcase, IconSettings, IconX,
} from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

export default function DashboardClient({ artisan, chantiers }: { artisan: Artisan | null; chantiers: Chantier[] }) {
  const router  = useRouter()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const ca = chantiers
    .filter(c => c.status === 'encours' || c.status === 'impaye')
    .reduce((sum, c) => sum + c.montant_ttc, 0)
  const enAttente = chantiers.filter(c => c.status === 'encours' || c.status === 'impaye').length
  const clotures  = chantiers.filter(c => c.status === 'cloture').length

  const actifs = chantiers
    .filter(c => c.status !== 'cloture')
    .filter(c => !searchQuery ||
      c.nom_client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type_travaux.toLowerCase().includes(searchQuery.toLowerCase()))

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.dash-welcome', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.1)
    tl.fromTo(heroRef.current, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.2)
    tl.fromTo('.stat-card', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 }, 0.35)
    tl.fromTo('.chantier-card', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, 0.5)
  }, { scope: containerRef })

  const T = theme

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg,
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />

        {/* Header */}
        <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px', background: T.nav,
          borderBottom: `0.5px solid ${T.border}`, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProFiniLogo color={PRIMARY} accent={ACCENT} size={28} />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: PRIMARY }}>ProFini</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setSearchOpen(o => !o)} style={{
              width: 40, height: 40, borderRadius: 12,
              background: searchOpen ? `${PRIMARY}18` : 'transparent',
              border: 'none', cursor: 'pointer', color: searchOpen ? PRIMARY : T.subtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
            }}>
              {searchOpen ? <IconX size={20} sw={2} /> : <IconSearch size={20} sw={2} />}
            </button>
            <button onClick={() => router.push('/settings')} style={{
              width: 40, height: 40, borderRadius: 12, background: 'transparent',
              border: 'none', cursor: 'pointer', color: T.subtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSettings size={20} sw={2} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ padding: '10px 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`,
            animation: 'slideUp .2s ease-out' }}>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client, un chantier…"
              style={{ width: '100%', height: 40, padding: '0 14px', fontSize: 15,
                fontFamily: 'inherit', color: T.text, background: T.bgAlt,
                border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Scroll content */}
        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px',
          display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Welcome */}
          <div className="dash-welcome" style={{ opacity: 0 }}>
            <div style={{ fontSize: 13, color: T.subtle, fontWeight: 500 }}>Bonjour 👋</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
              {artisan?.photo_url && (
                <img src={artisan.photo_url} alt="profil" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.border}` }} />
              )}
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{artisan?.nom ?? 'Artisan'}</div>
            </div>
          </div>

          {/* Hero card */}
          <div ref={heroRef} style={{ opacity: 0, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)',
            borderRadius: 16, padding: 24, color: '#fff', boxShadow: '0 8px 28px rgba(21,53,91,0.4)',
            cursor: 'pointer',
          }} onClick={() => router.push('/chantiers-list')}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160,
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,164,100,0.55), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.75, fontWeight: 500 }}>
                <IconTrendingUp size={14} sw={2} />Chiffre d&apos;affaires en attente
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginTop: 8, letterSpacing: -0.5 }}>
                {formatEur(ca)}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.85 }}>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.18)', borderRadius: 6, fontWeight: 600 }}>
                  {enAttente} chantier{enAttente !== 1 ? 's' : ''}
                </span>
                en attente de règlement
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'En attente', value: String(enAttente), accent: '#EF9F27', icon: <IconClock size={20} />, path: '/chantiers-list' },
              { label: 'Clôturés',   value: String(clotures),  accent: '#639922', icon: <IconCheck size={20} />,  path: '/chantiers-list' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ opacity: 0, flex: 1 }}
                onClick={() => router.push(s.path)}>
                <div style={{ minHeight: 88, padding: 16, borderRadius: 16, background: T.card,
                  border: `1px solid ${T.border}`, boxShadow: T.dark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8,
                  cursor: 'pointer', transition: 'transform .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.accent}1A`,
                    color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, margin: 0, letterSpacing: -0.2 }}>Chantiers actifs</h2>
            <button onClick={() => router.push('/chantiers/nouveau')} style={{
              background: 'none', border: 'none', color: PRIMARY, fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 4px',
            }}>
              <IconPlus size={16} sw={2.5} />Nouveau
            </button>
          </div>

          {/* Chantier cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {actifs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: T.subtle, fontSize: 14,
                background: T.card, borderRadius: 16, border: `1px solid ${T.border}` }}>
                {searchQuery ? 'Aucun résultat.' : 'Aucun chantier actif.'}
                {!searchQuery && <div>
                  <button onClick={() => router.push('/chantiers/nouveau')} style={{
                    marginTop: 12, background: 'none', border: 'none', color: PRIMARY,
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  }}>+ Créer un chantier</button>
                </div>}
              </div>
            )}
            {actifs.map(c => (
              <div key={c.id} className="chantier-card" style={{ opacity: 0 }}>
                <div onClick={() => router.push(`/chantiers/${c.id}`)} style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16,
                  boxShadow: T.dark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'transform .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>{c.nom_client}</div>
                      <div style={{ fontSize: 14, color: T.subtle, marginTop: 2 }}>{c.type_travaux}</div>
                    </div>
                    <Badge status={c.status as ChantierStatus} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 10,
                    borderTop: `1px solid ${T.divider}`, fontSize: 13, color: T.subtle }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconCalendar size={14} sw={2} />{fmtDate(c.created_at)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: T.text }}>
                      <IconEuro size={14} sw={2} />{formatEur(c.montant_ttc)}
                    </span>
                    <span style={{ marginLeft: 'auto' }}><IconChevronRight size={16} sw={2} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAB */}
        <button onClick={() => router.push('/chantiers/nouveau')} style={{
          position: 'fixed', right: 'max(16px, calc(50vw - 215px + 16px))', bottom: 88,
          width: 60, height: 60, background: PRIMARY, color: '#fff', border: 'none', borderRadius: '50%',
          boxShadow: '0 6px 20px rgba(21,53,91,0.55)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'transform .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}>
          <IconPlus size={26} sw={2.5} />
        </button>

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 72, background: T.nav,
          borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-around', paddingBottom: 8, zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',      label: 'Dashboard', icon: IconHome,      path: '/',               active: true },
            { id: 'chantiers', label: 'Chantiers',  icon: IconBriefcase, path: '/chantiers-list', active: false },
            { id: 'settings',  label: 'Réglages',   icon: IconSettings,  path: '/settings',       active: false },
          ].map(n => (
            <button key={n.id} onClick={() => router.push(n.path)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 12px', minWidth: 56, minHeight: 48,
              color: n.active ? PRIMARY : T.muted, fontFamily: 'inherit', transition: 'color .2s',
            }}>
              <n.icon size={22} sw={n.active ? 2 : 1.75} />
              <span style={{ fontSize: 11, fontWeight: n.active ? 600 : 500 }}>{n.label}</span>
            </button>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, borderRadius: 100,
          background: T.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
          zIndex: 20, pointerEvents: 'none' }} />
      </div>
    </MobileShell>
  )
}
