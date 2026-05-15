'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import { IconUser, IconLogOut, IconCheck, IconBriefcase, IconHome, IconSettings, IconAlertCircle, IconStar } from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

interface Artisan {
  id: string; nom: string; email: string; tel?: string
  nom_entreprise?: string; siret?: string; adresse?: string
  code_postal?: string; ville?: string; site_web?: string
  description_activite?: string; mention_tva?: string
  photo_url?: string; logo_url?: string; google_review_url?: string
  plan?: string; relance_j2?: boolean; relance_j7?: boolean; relance_j30?: boolean
  relance_ton?: string; relance_custom_j2?: string; relance_custom_j7?: string; relance_custom_j30?: string
}

// ── ImageUpload ────────────────────────────────────────────────────────────────
function ImageUpload({ label, hint, value, type, shape, onUploaded, T }: {
  label: string; hint: string; value?: string; type: 'photo' | 'logo'
  shape: 'circle' | 'square'; onUploaded: (url: string) => void; T: ReturnType<typeof useTheme>['theme']
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  useEffect(() => setPreview(value), [value])
  async function handleFile(file: File) {
    setUploading(true); setPreview(URL.createObjectURL(file))
    const fd = new FormData(); fd.append('file', file); fd.append('type', type)
    const res = await fetch('/api/artisan/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.url) { setPreview(json.url); onUploaded(json.url) }
    setUploading(false)
  }
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.divider}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div onClick={() => inputRef.current?.click()} style={{ width: shape === 'circle' ? 52 : 64, height: shape === 'circle' ? 52 : 52, borderRadius: shape === 'circle' ? '50%' : 10, overflow: 'hidden', flexShrink: 0, background: preview ? 'transparent' : `${PRIMARY}12`, border: `2px dashed ${preview ? PRIMARY : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: shape === 'circle' ? 'cover' : 'contain' }} /> : <span style={{ fontSize: 18, opacity: 0.3 }}>{type === 'logo' ? '🏢' : '👤'}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{ width: '100%', height: 36, background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}30`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: PRIMARY, cursor: 'pointer', fontFamily: 'inherit' }}>
            {uploading ? 'Envoi…' : preview ? 'Changer' : 'Choisir'}
          </button>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 5, lineHeight: 1.4 }}>{hint}</div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}

function Toggle({ value, onChange, T }: { value: boolean; onChange: () => void; T: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2, background: value ? ACCENT : T.border, transition: 'background .25s', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: value ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)' }} />
    </button>
  )
}

function Field({ label, value, placeholder, onChange, type = 'text', multiline, last, required: req, error, hint, T }: {
  label: string; value: string; placeholder?: string; onChange: (v: string) => void; type?: string; multiline?: boolean; last?: boolean; required?: boolean; error?: string; hint?: string; T: ReturnType<typeof useTheme>['theme']
}) {
  const [focused, setFocused] = useState(false)
  const st: React.CSSProperties = { width: '100%', padding: multiline ? '10px 12px' : '0 12px', height: multiline ? undefined : 42, fontSize: 15, fontFamily: 'inherit', color: T.text, background: focused ? T.card : T.bgAlt, border: `1.5px solid ${error ? '#E24B4A' : focused ? PRIMARY : T.border}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box', boxShadow: focused ? `0 0 0 3px ${error ? '#E24B4A' : PRIMARY}18` : 'none', transition: 'all .15s', resize: 'none' as const }
  return (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${T.divider}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}{req && <span style={{ color: '#E24B4A', marginLeft: 2 }}>*</span>}
      </div>
      {multiline
        ? <textarea value={value} placeholder={placeholder} rows={3} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...st, lineHeight: 1.5 }} />
        : <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={st} />
      }
      {hint && !error && <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: '#E24B4A', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><IconAlertCircle size={11} sw={2} />{error}</div>}
    </div>
  )
}

function Section({ title, children, T }: { title: string; children: React.ReactNode; T: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div className="settings-section" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, padding: '0 16px' }}>{title}</div>
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', margin: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Validation entreprise ──────────────────────────────────────────────────────
const REQUIRED_FIELDS: (keyof Artisan)[] = ['nom_entreprise', 'siret', 'adresse', 'ville']

export default function SettingsPage() {
  const router = useRouter()
  const { theme: T, toggle: toggleDark } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [form, setForm] = useState<Partial<Artisan>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/artisan').then(r => r.json()).then((d: Artisan) => {
      setArtisan(d)
      setForm({ nom: d.nom ?? '', tel: d.tel ?? '', nom_entreprise: d.nom_entreprise ?? '', siret: d.siret ?? '', adresse: d.adresse ?? '', code_postal: d.code_postal ?? '', ville: d.ville ?? '', site_web: d.site_web ?? '', description_activite: d.description_activite ?? '', mention_tva: d.mention_tva ?? 'Non soumis à TVA — Article 293B du CGI', photo_url: d.photo_url ?? '', logo_url: d.logo_url ?? '', google_review_url: d.google_review_url ?? '', relance_j2: d.relance_j2 ?? true, relance_j7: d.relance_j7 ?? true, relance_j30: d.relance_j30 ?? false, relance_ton: d.relance_ton ?? 'auto', relance_custom_j2: d.relance_custom_j2 ?? '', relance_custom_j7: d.relance_custom_j7 ?? '', relance_custom_j30: d.relance_custom_j30 ?? '' })
    })
  }, [])

  useGSAP(() => {
    if (!artisan) return
    gsap.fromTo('.settings-section', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.42, stagger: 0.08, ease: 'power3.out', delay: 0.1 })
  }, { scope: containerRef, dependencies: [!!artisan] })

  function set(k: keyof Artisan) { return (v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setDirty(true) } }
  function setB(k: keyof Artisan) { return () => { setForm(f => ({ ...f, [k]: !f[k as keyof typeof f] })); setDirty(true) } }

  function validate(): boolean {
    const e: Record<string, string> = {}
    REQUIRED_FIELDS.forEach(f => { if (!((form as Record<string, unknown>)[f] as string)?.trim()) e[f as string] = 'Requis' })
    if (form.siret && form.siret.replace(/\s/g, '').length !== 14) e.siret = 'SIRET invalide (14 chiffres)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    await fetch('/api/artisan', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setDirty(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!artisan) return <MobileShell><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Chargement…</div></MobileShell>

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>

        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Réglages</span>
          {saved && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: ACCENT, fontWeight: 600 }}><IconCheck size={15} sw={2.5} />Sauvegardé</span>}
        </div>

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 0 130px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Profile card */}
          <div className="settings-section" style={{ opacity: 0, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)', borderRadius: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,164,100,0.4), transparent 70%)' }} />
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.photo_url ? <img src={form.photo_url as string} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={24} sw={1.5} color="rgba(255,255,255,0.7)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{form.nom || artisan.nom}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>{artisan.email}</div>
                {form.nom_entreprise && <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>{form.nom_entreprise as string}</div>}
              </div>
              {form.logo_url && <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#fff', flexShrink: 0 }}><img src={form.logo_url as string} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>}
            </div>
          </div>

          {/* Images */}
          <Section title="Photos & Logo" T={T}>
            <ImageUpload label="Photo de profil" hint="Apparaît sur le dashboard" value={form.photo_url as string} type="photo" shape="circle" T={T} onUploaded={url => { setForm(f => ({ ...f, photo_url: url })); setDirty(true) }} />
            <ImageUpload label="Logo entreprise (sur le procès-verbal)" hint="PNG fond transparent recommandé" value={form.logo_url as string} type="logo" shape="square" T={T} onUploaded={url => { setForm(f => ({ ...f, logo_url: url })); setDirty(true) }} />
          </Section>

          {/* Infos perso */}
          <Section title="Informations personnelles" T={T}>
            <Field label="Nom complet" value={form.nom as string ?? ''} placeholder="Thomas Bertrand" onChange={set('nom')} T={T} />
            <Field label="Téléphone" value={form.tel as string ?? ''} placeholder="+33 6 00 00 00 00" type="tel" onChange={set('tel')} last T={T} />
          </Section>

          {/* Entreprise — OBLIGATOIRE */}
          <Section title="Mon entreprise (obligatoire pour le PV)" T={T}>
            <Field label="Nom de l'entreprise" value={form.nom_entreprise as string ?? ''} placeholder="Bertrand Électricité" onChange={set('nom_entreprise')} required error={errors.nom_entreprise} T={T} />
            <Field label="N° SIRET (14 chiffres)" value={form.siret as string ?? ''} placeholder="123 456 789 00010" onChange={set('siret')} required error={errors.siret} hint="Figurera sur tous vos procès-verbaux" T={T} />
            <Field label="Adresse" value={form.adresse as string ?? ''} placeholder="12 rue des Artisans" onChange={set('adresse')} required error={errors.adresse} T={T} />
            <div style={{ display: 'flex' }}>
              <div style={{ flex: '0 0 38%', borderRight: `1px solid ${T.divider}` }}>
                <Field label="Code postal" value={form.code_postal as string ?? ''} placeholder="69001" onChange={set('code_postal')} last T={T} />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Ville" value={form.ville as string ?? ''} placeholder="Lyon" onChange={set('ville')} required error={errors.ville} last T={T} />
              </div>
            </div>
            <Field label="Site web" value={form.site_web as string ?? ''} placeholder="www.mon-entreprise.fr" onChange={set('site_web')} last T={T} />
          </Section>

          {/* Activité */}
          <Section title="Activité & Mention TVA" T={T}>
            <Field label="Description de l'activité" value={form.description_activite as string ?? ''} placeholder="Travaux d'électricité générale…" onChange={set('description_activite')} multiline T={T} />
            <Field label="Mention TVA" value={form.mention_tva as string ?? ''} placeholder="Non soumis à TVA — Article 293B du CGI" onChange={set('mention_tva')} hint="Apparaît sur chaque procès-verbal" last T={T} />
          </Section>

          {/* Google Avis */}
          <Section title="Avis Google" T={T}>
            <Field label="Lien vers vos avis Google" value={form.google_review_url as string ?? ''} placeholder="https://g.page/r/XXXX/review" onChange={set('google_review_url')} hint="Envoyé automatiquement au client après clôture si activé" T={T} last />
          </Section>

          {/* Relances */}
          <Section title="Relances automatiques impayés" T={T}>
            {[
              { key: 'relance_j2',  label: 'J+2 — Rappel cordial', sub: 'Envoyé 2 jours après la clôture si impayé' },
              { key: 'relance_j7',  label: 'J+7 — Relance ferme',  sub: 'Envoyé 7 jours après la clôture si impayé' },
              { key: 'relance_j30', label: 'J+30 — Mise en demeure', sub: 'Envoyé 30 jours après la clôture si impayé' },
            ].map((r, i, arr) => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.divider}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{r.sub}</div>
                </div>
                <Toggle value={!!(form[r.key as keyof typeof form])} onChange={setB(r.key as keyof Artisan)} T={T} />
              </div>
            ))}
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.divider}` }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>Ton des relances automatiques</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'auto', l: 'Auto' }, { v: 'cordial', l: 'Cordial' }, { v: 'neutre', l: 'Neutre' }, { v: 'formel', l: 'Formel' }].map(t => (
                  <button key={t.v} onClick={() => { setForm(f => ({ ...f, relance_ton: t.v })); setDirty(true) }} style={{ flex: 1, padding: '7px 0', borderRadius: 10, border: `1.5px solid ${form.relance_ton === t.v ? PRIMARY : T.border}`, background: form.relance_ton === t.v ? `${PRIMARY}10` : 'transparent', color: form.relance_ton === t.v ? PRIMARY : T.subtle, fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Apparence */}
          <Section title="Apparence" T={T}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>Mode sombre</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Interface noire, économise la batterie</div>
              </div>
              <Toggle value={T.dark} onChange={toggleDark} T={T} />
            </div>
          </Section>

          {/* Abonnement */}
          <Section title="Abonnement" T={T}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => router.push('/plan')}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>Plan ProFini</div>
                <div style={{ fontSize: 12, color: artisan.plan === 'active' ? ACCENT : T.muted, marginTop: 2, fontWeight: 600 }}>
                  {artisan.plan === 'active' ? '✓ Abonnement actif — 29 €/mois' : artisan.plan === 'expired' ? 'Abonnement expiré' : 'Essai gratuit — 14 jours'}
                </div>
              </div>
              <IconStar size={18} sw={2} color={artisan.plan === 'active' ? ACCENT : T.muted} />
            </div>
            <div style={{ padding: '0 16px 14px' }}>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>Conforme RGPD · Données chiffrées · Hébergé en Europe · PV valeur juridique eIDAS</div>
            </div>
          </Section>

          {/* Déconnexion */}
          <div className="settings-section" style={{ opacity: 0, padding: '0 16px' }}>
            <button onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push('/login') }} style={{ width: '100%', height: 50, background: T.dark ? 'rgba(220,38,38,0.15)' : '#FEF2F2', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <IconLogOut size={17} sw={2} />Se déconnecter
            </button>
          </div>
        </div>

        {/* Save bar */}
        {dirty && (
          <div style={{ position: 'sticky', bottom: 64, padding: '10px 16px', background: T.nav, borderTop: `0.5px solid ${T.border}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', zIndex: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ width: '100%', height: 50, background: saving ? T.muted : PRIMARY, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 64, background: T.nav, borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',      label: 'Accueil',  icon: IconHome,        path: '/' },
            { id: 'chantiers', label: 'Chantiers', icon: IconBriefcase,  path: '/chantiers-list' },
            { id: 'relances',  label: 'Relances',  icon: IconAlertCircle,path: '/relances' },
            { id: 'settings',  label: 'Réglages',  icon: IconSettings,   path: '/settings', active: true },
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
