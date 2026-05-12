'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import Badge from '@/components/Badge'
import { Chantier, formatEur, ChantierStatus } from '@/lib/types'
import { IconPlus, IconSearch, IconCalendar, IconEuro, IconChevronRight } from '@/components/icons'

const PRIMARY = '#15355B'
const STATUTS: { id: string; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'encours', label: 'En cours' },
  { id: 'impaye', label: 'Impayés' },
  { id: 'paye', label: 'Payés' },
  { id: 'cloture', label: 'Clôturés' },
]

export default function ChantiersListPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chantiers').then(r => r.json()).then(d => {
      setChantiers(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  useGSAP(() => {
    if (loading) return
    gsap.fromTo('.chantier-row',
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }
    )
  }, { scope: containerRef, dependencies: [loading, filtre] })

  const filtered = chantiers
    .filter(c => filtre === 'tous' || c.status === filtre)
    .filter(c => !search || c.nom_client.toLowerCase().includes(search.toLowerCase()) || c.type_travaux.toLowerCase().includes(search.toLowerCase()))

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB',
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <StatusBar />

        {/* Header */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: '#fff', borderBottom: '0.5px solid #E5E7EB', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Chantiers</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setSearching(s => !s)} style={{ width: 40, height: 40, borderRadius: 12,
              background: searching ? `${PRIMARY}10` : 'transparent', border: 'none', cursor: 'pointer',
              color: searching ? PRIMARY : '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSearch size={20} sw={2} />
            </button>
            <button onClick={() => router.push('/chantiers/nouveau')} style={{ width: 40, height: 40, borderRadius: 12,
              background: PRIMARY, border: 'none', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconPlus size={20} sw={2.5} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searching && (
          <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '0.5px solid #E5E7EB' }}>
            <input
              autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un chantier ou client…"
              style={{ width: '100%', height: 40, padding: '0 14px', fontSize: 15,
                fontFamily: 'inherit', color: '#111827', background: '#F3F4F6',
                border: '1px solid #E5E7EB', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E7EB', overflowX: 'auto',
          display: 'flex', flexShrink: 0, scrollbarWidth: 'none' }}>
          {STATUTS.map(s => (
            <button key={s.id} onClick={() => setFiltre(s.id)} style={{
              padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: filtre === s.id ? 600 : 400,
              color: filtre === s.id ? PRIMARY : '#6B7280', whiteSpace: 'nowrap',
              borderBottom: `2px solid ${filtre === s.id ? PRIMARY : 'transparent'}`,
              transition: 'all .2s',
            }}>{s.label}</button>
          ))}
        </div>

        {/* List */}
        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>Chargement…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>
              Aucun chantier{filtre !== 'tous' ? ' dans cette catégorie' : ''}.
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id} className="chantier-row" style={{ opacity: 0 }}
              onClick={() => router.push(`/chantiers/${c.id}`)}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14,
                padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{c.nom_client}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{c.type_travaux}</div>
                  </div>
                  <Badge status={c.status as ChantierStatus} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14,
                  paddingTop: 8, borderTop: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <IconCalendar size={13} sw={2} />{fmtDate(c.created_at)}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#111827' }}>
                    <IconEuro size={13} sw={2} />{formatEur(c.montant_ttc)}
                  </span>
                  <span style={{ marginLeft: 'auto' }}><IconChevronRight size={15} sw={2} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <BottomNav active="chantiers" />
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
