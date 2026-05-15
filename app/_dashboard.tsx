'use client'
import { useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import ProFiniLogo from '@/components/ProFiniLogo'
import Badge from '@/components/Badge'
import { Chantier, Artisan, ChantierStatus, formatEur, randomGreeting, randomTip } from '@/lib/types'
import {
  IconSearch, IconTrendingUp, IconClock, IconCheck, IconAlertCircle,
  IconCalendar, IconEuro, IconChevronRight, IconPlus, IconBriefcase,
  IconHome, IconSettings, IconX, IconStar,
} from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

// Composants internes
function StatBlock({ label, value, sub, accent, onClick }: { label: string; value: string; sub?: string; accent: string; onClick?: () => void }) {
  const { theme: T } = useTheme()
  return (
    <div onClick={onClick} style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 14px', cursor: onClick ? 'pointer' : 'default', transition: 'transform .15s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.subtle, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: accent, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardClient({ artisan, chantiers }: { artisan: Artisan | null; chantiers: Chantier[] }) {
  const router = useRouter()
  const { theme: T } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef      = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const greeting = useMemo(() => randomGreeting(), [])
  const tip      = useMemo(() => randomTip(), [])

  // Stats
  const encours  = chantiers.filter(c => c.status === 'encours')
  const impayes  = chantiers.filter(c => c.status === 'impaye')
  const payes    = chantiers.filter(c => c.status === 'paye')
  const clotures = chantiers.filter(c => c.status === 'cloture' || c.status === 'paye')
  const actifs   = chantiers.filter(c => c.status === 'encours' || c.status === 'impaye')

  const caAttente  = actifs.reduce((s, c)   => s + c.montant_ttc, 0)
  const caRealise  = clotures.reduce((s, c) => s + c.montant_ttc, 0)
  const caMois     = (() => {
    const now = new Date(); const m = now.getMonth(); const y = now.getFullYear()
    return chantiers.filter(c => { const d = new Date(c.closed_at ?? c.created_at); return d.getMonth() === m && d.getFullYear() === y && (c.status === 'paye' || c.status === 'cloture') }).reduce((s, c) => s + c.montant_ttc, 0)
  })()

  const filteredActifs = actifs.filter(c =>
    !searchQuery || c.nom_client.toLowerCase().includes(searchQuery.toLowerCase()) || c.type_travaux.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.dash-welcome',     { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.1)
    tl.fromTo(heroRef.current,     { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.2)
    tl.fromTo('.dash-stat',        { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, 0.38)
    tl.fromTo('.dash-card',        { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.38, stagger: 0.07 }, 0.52)
    tl.fromTo('.dash-tip',         { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
  }, { scope: containerRef })

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>

        {/* Header */}
        <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProFiniLogo color={PRIMARY} accent={ACCENT} size={26} />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: PRIMARY }}>ProFini</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { setSearchOpen(o => !o); setSearchQuery('') }} style={{ width: 38, height: 38, borderRadius: 10, background: searchOpen ? `${PRIMARY}14` : 'transparent', border: 'none', cursor: 'pointer', color: searchOpen ? PRIMARY : T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
              {searchOpen ? <IconX size={18} sw={2} /> : <IconSearch size={18} sw={2} />}
            </button>
            <button onClick={() => router.push('/settings')} style={{ width: 38, height: 38, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: T.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSettings size={18} sw={2} />
            </button>
          </div>
        </div>

        {/* Search */}
        {searchOpen && (
          <div style={{ padding: '10px 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, animation: 'slideUp .2s ease-out' }}>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nom client, type de travaux…"
              style={{ width: '100%', height: 38, padding: '0 14px', fontSize: 14, fontFamily: 'inherit', color: T.text, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 130px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Accueil personnalisé */}
          <div className="dash-welcome" style={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {artisan?.photo_url && <img src={artisan.photo_url} alt="profil" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.border}` }} />}
              <div>
                <div style={{ fontSize: 13, color: T.subtle, fontWeight: 500 }}>{greeting} 👋</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{artisan?.nom ?? 'Artisan'}</div>
              </div>
            </div>
          </div>

          {/* Hero — CA en attente */}
          <div ref={heroRef} style={{ opacity: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)', borderRadius: 18, padding: '22px 22px', color: '#fff', boxShadow: '0 8px 28px rgba(21,53,91,0.38)', cursor: 'pointer' }}
            onClick={() => router.push('/chantiers-list')}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,164,100,0.5), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, opacity: 0.7, fontWeight: 500, marginBottom: 6 }}>
                <IconTrendingUp size={13} sw={2} />À encaisser
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>{formatEur(caAttente)}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 12 }}>
                <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.16)', borderRadius: 6, fontWeight: 600 }}>{actifs.length} chantier{actifs.length !== 1 ? 's' : ''} actif{actifs.length !== 1 ? 's' : ''}</span>
                {impayes.length > 0 && <span style={{ padding: '3px 8px', background: 'rgba(239,159,39,0.25)', borderRadius: 6, fontWeight: 600, color: '#FCD34D' }}>⚠ {impayes.length} impayé{impayes.length !== 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>

          {/* Stats 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="dash-stat" style={{ opacity: 0 }}>
              <StatBlock label="CA réalisé (total)" value={formatEur(caRealise)} accent={ACCENT} onClick={() => router.push('/chantiers-list')} />
            </div>
            <div className="dash-stat" style={{ opacity: 0 }}>
              <StatBlock label="CA ce mois" value={formatEur(caMois)} accent="#3B82F6" />
            </div>
            <div className="dash-stat" style={{ opacity: 0 }}>
              <StatBlock label="Clôturés" value={String(clotures.length)} accent="#22C55E" onClick={() => router.push('/chantiers-list')} />
            </div>
            <div className="dash-stat" style={{ opacity: 0 }}>
              <StatBlock label="Impayés" value={String(impayes.length)} accent="#F59E0B" sub={impayes.length > 0 ? 'Action requise' : undefined} onClick={() => router.push('/relances')} />
            </div>
          </div>

          {/* Chantiers actifs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: T.text, margin: 0 }}>Chantiers actifs</h2>
            <button onClick={() => router.push('/chantiers/nouveau')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`, borderRadius: 10, color: PRIMARY, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <IconPlus size={14} sw={2.5} />Nouveau
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredActifs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: T.muted, fontSize: 13, background: T.card, borderRadius: 14, border: `1px solid ${T.border}` }}>
                {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun chantier actif en ce moment.'}
                {!searchQuery && <div style={{ marginTop: 10 }}>
                  <button onClick={() => router.push('/chantiers/nouveau')} style={{ color: PRIMARY, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>+ Créer un chantier</button>
                </div>}
              </div>
            )}
            {filteredActifs.map(c => (
              <div key={c.id} className="dash-card" style={{ opacity: 0 }}>
                <div onClick={() => router.push(`/chantiers/${c.id}`)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px', boxShadow: T.dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 9, cursor: 'pointer', transition: 'transform .12s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.nom_client}</div>
                      <div style={{ fontSize: 13, color: T.subtle, marginTop: 1 }}>{c.type_travaux}</div>
                    </div>
                    <Badge status={c.status as ChantierStatus} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: `1px solid ${T.divider}`, fontSize: 12, color: T.subtle }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconCalendar size={12} sw={2} />{fmtDate(c.date_chantier ?? c.created_at)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: T.text }}>{formatEur(c.montant_ttc)}</span>
                    <span style={{ marginLeft: 'auto' }}><IconChevronRight size={14} sw={2} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip du jour */}
          <div className="dash-tip" style={{ opacity: 0, padding: '12px 14px', background: T.dark ? `${PRIMARY}15` : `${PRIMARY}08`, border: `1px solid ${PRIMARY}20`, borderRadius: 12, fontSize: 13, color: T.dark ? '#93C5FD' : PRIMARY, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flexShrink: 0 }}>💡</span>{tip}
          </div>
        </div>

        {/* FAB */}
        <button onClick={() => router.push('/chantiers/nouveau')} style={{ position: 'fixed', right: 'max(16px, calc(50vw - 215px + 16px))', bottom: 80, width: 56, height: 56, background: PRIMARY, color: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 6px 20px rgba(21,53,91,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}>
          <IconPlus size={24} sw={2.5} />
        </button>

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 64, background: T.nav, borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',      label: 'Accueil',   icon: IconHome,      path: '/',               active: true },
            { id: 'chantiers', label: 'Chantiers',  icon: IconBriefcase, path: '/chantiers-list', active: false },
            { id: 'relances',  label: 'Relances',   icon: IconAlertCircle,path: '/relances',      active: false },
            { id: 'settings',  label: 'Réglages',   icon: IconSettings,  path: '/settings',       active: false },
          ].map(n => (
            <button key={n.id} onClick={() => router.push(n.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', color: n.active ? PRIMARY : T.muted, fontFamily: 'inherit', transition: 'color .2s', position: 'relative' }}>
              {n.id === 'relances' && impayes.length > 0 && <span style={{ position: 'absolute', top: 4, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: `2px solid ${T.nav}` }} />}
              <n.icon size={20} sw={n.active ? 2 : 1.75} />
              <span style={{ fontSize: 10, fontWeight: n.active ? 600 : 500 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}
