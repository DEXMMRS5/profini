'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import FormHeader from '@/components/FormHeader'
import { Chantier, formatEur } from '@/lib/types'
import { IconAlertCircle, IconCheck, IconMail, IconHome, IconBriefcase, IconSettings } from '@/components/icons'

const PRIMARY = '#15355B'

const DELAIS = [
  { key: 'j2',  label: 'J+2',  desc: 'Ton cordial — rappel amical',   color: '#F59E0B' },
  { key: 'j7',  label: 'J+7',  desc: 'Ton neutre — rappel ferme',      color: '#EF4444' },
  { key: 'j30', label: 'J+30', desc: 'Ton formel — mise en demeure',   color: '#7C3AED' },
]

interface RelanceSent { id: string; type: string; sent_at: string; chantiers: { nom_client: string; montant_ttc: number } }

export default function RelancesPage() {
  const router  = useRouter()
  const { theme: T } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [impayes, setImpayes] = useState<Chantier[]>([])
  const [sent, setSent] = useState<RelanceSent[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [delai, setDelai] = useState('j2')
  const [customMsg, setCustomMsg] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [preview, setPreview] = useState<{ objet: string; message: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/chantiers').then(r => r.json()).then((d: Chantier[]) => setImpayes(Array.isArray(d) ? d.filter(c => c.status === 'impaye') : []))
    fetch('/api/relances').then(r => r.json()).then(d => setSent(Array.isArray(d) ? d : []))
  }, [])

  useGSAP(() => {
    gsap.fromTo('.relance-card', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, stagger: 0.07, ease: 'power3.out', delay: 0.1 })
  }, { scope: containerRef, dependencies: [impayes.length] })

  async function sendRelance() {
    if (!selected) return
    setSending(true)
    const res = await fetch('/api/relances', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chantier_id: selected, type: delai, custom_message: useCustom ? customMsg : undefined }),
    })
    const json = await res.json()
    if (json.preview) setPreview(json.preview)
    setSending(false); setSuccess(true)
    fetch('/api/relances').then(r => r.json()).then(d => setSent(Array.isArray(d) ? d : []))
    setTimeout(() => { setSuccess(false); setSelected(null); setPreview(null); setCustomMsg('') }, 3000)
  }

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <FormHeader title="Relances impayés" backHref="/" cancelLabel="Retour" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Info */}
          {impayes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={32} sw={2} color="#22C55E" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: T.text }}>Aucun impayé !</div>
              <div style={{ fontSize: 13, color: T.subtle }}>Tous vos chantiers sont à jour.</div>
              <button onClick={() => router.push('/chantiers-list')} style={{ marginTop: 8, padding: '10px 20px', background: PRIMARY, color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Voir tous les chantiers
              </button>
            </div>
          ) : (
            <>
              {/* Chantiers impayés */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  {impayes.length} chantier{impayes.length !== 1 ? 's' : ''} impayé{impayes.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {impayes.map(c => {
                    const isSelected = selected === c.id
                    const nbRelances = sent.filter(s => (s as { chantier_id?: string }).chantier_id === c.id || s.chantiers?.nom_client === c.nom_client).length
                    return (
                      <div key={c.id} className="relance-card" style={{ opacity: 0 }}>
                        <button onClick={() => setSelected(isSelected ? null : c.id)} style={{
                          width: '100%', textAlign: 'left', background: isSelected ? `${PRIMARY}08` : T.card,
                          border: `1.5px solid ${isSelected ? PRIMARY : T.border}`, borderRadius: 14, padding: '14px 14px',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.nom_client}</div>
                              <div style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{c.type_travaux}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#EF4444' }}>{formatEur(c.montant_ttc)}</div>
                              {nbRelances > 0 && <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{nbRelances} relance{nbRelances !== 1 ? 's' : ''} envoyée{nbRelances !== 1 ? 's' : ''}</div>}
                            </div>
                          </div>
                          {!c.email_client && <div style={{ marginTop: 8, fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}><IconAlertCircle size={11} sw={2} />Pas d'email — relance impossible</div>}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Panel de relance */}
              {selected && (() => {
                const c = impayes.find(x => x.id === selected)!
                return (
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .3s ease-out' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Relance pour {c.nom_client}</div>

                    {/* Délai */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>Ton de la relance</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {DELAIS.map(d => (
                          <button key={d.key} onClick={() => setDelai(d.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: delai === d.key ? `${d.color}10` : T.bgAlt, border: `1.5px solid ${delai === d.key ? d.color : T.border}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: d.color, minWidth: 32 }}>{d.label}</span>
                            <span style={{ fontSize: 13, color: T.subtle }}>{d.desc}</span>
                            {delai === d.key && <IconCheck size={14} sw={2.5} color={d.color} style={{ marginLeft: 'auto' }} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message personnalisé */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>Message personnalisé</div>
                        <button onClick={() => setUseCustom(u => !u)} style={{ fontSize: 12, color: useCustom ? '#22C55E' : T.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                          {useCustom ? '✓ Activé' : 'Activer'}
                        </button>
                      </div>
                      {useCustom && (
                        <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)}
                          placeholder="Rédigez votre message personnalisé…" rows={5}
                          style={{ width: '100%', padding: 12, fontSize: 14, fontFamily: 'inherit', color: T.text, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
                      )}
                    </div>

                    {/* Envoi */}
                    {!c.email_client ? (
                      <div style={{ fontSize: 13, color: '#F59E0B', textAlign: 'center' }}>Ce client n'a pas d'email enregistré.</div>
                    ) : success ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeIn .3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', fontWeight: 600, fontSize: 14 }}>
                          <IconCheck size={18} sw={2.5} />Relance envoyée à {c.email_client}
                        </div>
                        {preview && (
                          <div style={{ background: T.bgAlt, borderRadius: 10, padding: 12, fontSize: 12, color: T.subtle, lineHeight: 1.6 }}>
                            <strong>Objet :</strong> {preview.objet}<br /><br />
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{preview.message}</pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={sendRelance} disabled={sending} style={{ height: 52, background: sending ? T.muted : '#EF4444', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}>
                        <IconMail size={18} sw={2} />
                        {sending ? 'Envoi…' : `Envoyer la relance à ${c.email_client}`}
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* Historique */}
              {sent.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Historique des relances</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sent.slice(0, 8).map(s => (
                      <div key={s.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.chantiers?.nom_client}</div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{new Date(s.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: s.type === 'j30' ? '#7C3AED20' : s.type === 'j7' ? '#EF444420' : '#F59E0B20', color: s.type === 'j30' ? '#7C3AED' : s.type === 'j7' ? '#EF4444' : '#F59E0B' }}>
                          {s.type.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 64, background: T.nav, borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',     label: 'Accueil',  icon: IconHome,         path: '/' },
            { id: 'chantiers',label: 'Chantiers', icon: IconBriefcase,   path: '/chantiers-list' },
            { id: 'relances', label: 'Relances',  icon: IconAlertCircle, path: '/relances', active: true },
            { id: 'settings', label: 'Réglages',  icon: IconSettings,    path: '/settings' },
          ].map(n => (
            <button key={n.id} onClick={() => router.push(n.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', color: (n as { active?: boolean }).active ? PRIMARY : T.muted, fontFamily: 'inherit' }}>
              <n.icon size={20} sw={(n as { active?: boolean }).active ? 2 : 1.75} />
              <span style={{ fontSize: 10, fontWeight: (n as { active?: boolean }).active ? 600 : 500 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}
