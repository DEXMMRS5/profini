'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import Badge from '@/components/Badge'
import { Chantier, ChantierStatus, formatEur } from '@/lib/types'
import { IconPlus, IconSearch, IconCalendar, IconEuro, IconChevronRight, IconX, IconHome, IconBriefcase, IconSettings } from '@/components/icons'

const PRIMARY = '#15355B'
const FILTRES = [
  { id: 'tous', label: 'Tous' },
  { id: 'encours', label: 'En cours' },
  { id: 'impaye', label: 'Impayés' },
  { id: 'paye', label: 'Payés' },
  { id: 'cloture', label: 'Clôturés' },
]

export default function ChantiersListPage() {
  const router = useRouter()
  const { theme: T } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chantiers').then(r => r.json()).then(d => { setChantiers(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useGSAP(() => {
    if (loading) return
    gsap.fromTo('.chantier-row', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.38, stagger: 0.055, ease: 'power3.out' })
  }, { scope: containerRef, dependencies: [loading, filtre, search] })

  const filtered = chantiers
    .filter(c => filtre === 'tous' || c.status === filtre)
    .filter(c => !search || c.nom_client.toLowerCase().includes(search.toLowerCase()) || c.type_travaux.toLowerCase().includes(search.toLowerCase()) || c.adresse?.toLowerCase().includes(search.toLowerCase()))

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg,
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />

        {/* Header */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Chantiers</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setSearching(s => !s); setSearch('') }} style={{
              width: 38, height: 38, borderRadius: 10, background: searching ? `${PRIMARY}12` : 'transparent',
              border: 'none', cursor: 'pointer', color: searching ? PRIMARY : T.subtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {searching ? <IconX size={18} sw={2} /> : <IconSearch size={18} sw={2} />}
            </button>
            <button onClick={() => router.push('/chantiers/nouveau')} style={{
              width: 38, height: 38, borderRadius: 10, background: PRIMARY, border: 'none',
              cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconPlus size={18} sw={2.5} />
            </button>
          </div>
        </div>

        {/* Search */}
        {searching && (
          <div style={{ padding: '10px 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, animation: 'slideUp .2s ease-out' }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Nom, type de travaux, adresse…"
              style={{ width: '100%', height: 40, padding: '0 14px', fontSize: 15, fontFamily: 'inherit',
                color: T.text, background: T.bgAlt, border: `1px solid ${T.border}`,
                borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Filtres */}
        <div style={{ background: T.nav, borderBottom: `0.5px solid ${T.border}`, overflowX: 'auto',
          display: 'flex', flexShrink: 0, scrollbarWidth: 'none' as const }}>
          {FILTRES.map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{
              padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: filtre === f.id ? 700 : 400,
              color: filtre === f.id ? PRIMARY : T.subtle, whiteSpace: 'nowrap',
              borderBottom: `2px solid ${filtre === f.id ? PRIMARY : 'transparent'}`, transition: 'all .2s',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Liste */}
        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted, fontSize: 14 }}>Chargement…</div>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: T.muted, fontSize: 14 }}>
              {search ? `Aucun résultat pour "${search}"` : 'Aucun chantier dans cette catégorie.'}
              {!search && filtre === 'tous' && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => router.push('/chantiers/nouveau')} style={{
                    background: PRIMARY, color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>+ Créer un chantier</button>
                </div>
              )}
            </div>
          )}

          {filtered.map(c => (
            <div key={c.id} className="chantier-row" style={{ opacity: 0 }}
              onClick={() => router.push(`/chantiers/${c.id}`)}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: 14, boxShadow: T.dark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'transform .12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.nom_client}</div>
                    <div style={{ fontSize: 13, color: T.subtle, marginTop: 2 }}>{c.type_travaux}</div>
                  </div>
                  <Badge status={c.status as ChantierStatus} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8,
                  borderTop: `1px solid ${T.divider}`, fontSize: 12, color: T.subtle }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <IconCalendar size={12} sw={2} />{fmtDate(c.created_at)}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: T.text }}>
                    <IconEuro size={12} sw={2} />{formatEur(c.montant_ttc)}
                  </span>
                  <span style={{ marginLeft: 'auto' }}><IconChevronRight size={14} sw={2} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 72, background: T.nav,
          borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-around', paddingBottom: 8, zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',      label: 'Dashboard', icon: IconHome,      path: '/' },
            { id: 'chantiers', label: 'Chantiers',  icon: IconBriefcase, path: '/chantiers-list', active: true },
            { id: 'settings',  label: 'Réglages',   icon: IconSettings,  path: '/settings' },
          ].map(n => (
            <button key={n.id} onClick={() => router.push(n.path)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 16px', color: (n as { active?: boolean }).active ? PRIMARY : T.muted, fontFamily: 'inherit',
            }}>
              <n.icon size={22} sw={(n as { active?: boolean }).active ? 2 : 1.75} />
              <span style={{ fontSize: 11, fontWeight: (n as { active?: boolean }).active ? 600 : 500 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}
