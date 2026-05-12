'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import {
  IconUser, IconPhone, IconMail, IconLogOut, IconCheck,
  IconBriefcase, IconHome, IconSettings,
} from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

interface Artisan {
  id: string; nom: string; email: string; tel?: string
  nom_entreprise?: string; siret?: string; adresse?: string
  code_postal?: string; ville?: string; site_web?: string
  description_activite?: string; mention_tva?: string
  photo_url?: string; logo_url?: string
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
    setUploading(true)
    setPreview(URL.createObjectURL(file))
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
        <div style={{ width: shape === 'circle' ? 56 : 72, height: shape === 'circle' ? 56 : 56,
          borderRadius: shape === 'circle' ? '50%' : 10, overflow: 'hidden', flexShrink: 0,
          background: preview ? 'transparent' : `${PRIMARY}12`,
          border: `2px dashed ${preview ? PRIMARY : T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }} onClick={() => inputRef.current?.click()}>
          {preview
            ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: shape === 'circle' ? 'cover' : 'contain' }} />
            : <span style={{ fontSize: 20, opacity: 0.35 }}>{type === 'logo' ? '🏢' : '👤'}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{
            width: '100%', height: 38, background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}30`,
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: PRIMARY,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {uploading ? 'Envoi en cours…' : preview ? 'Changer l\'image' : 'Choisir une image'}
          </button>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 5, lineHeight: 1.4 }}>{hint}</div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ value, onChange, T }: { value: boolean; onChange: () => void; T: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
      background: value ? ACCENT : T.border, transition: 'background .25s', position: 'relative',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: value ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
      }} />
    </button>
  )
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, value, placeholder, onChange, type = 'text', multiline, last, T }: {
  label: string; value: string; placeholder?: string; onChange: (v: string) => void
  type?: string; multiline?: boolean; last?: boolean; T: ReturnType<typeof useTheme>['theme']
}) {
  const [focused, setFocused] = useState(false)
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: multiline ? '10px 12px' : '0 12px',
    height: multiline ? undefined : 40, fontSize: 15, fontFamily: 'inherit',
    color: T.text, background: focused ? T.card : T.bgAlt,
    border: `1px solid ${focused ? PRIMARY : T.border}`,
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
    boxShadow: focused ? `0 0 0 3px ${PRIMARY}18` : 'none', transition: 'all .15s',
    resize: 'none' as const,
  }
  return (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${T.divider}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      {multiline
        ? <textarea value={value} placeholder={placeholder} rows={3}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputStyle, lineHeight: 1.5 }} />
        : <input type={type} value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={inputStyle} />
      }
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────
function Section({ title, children, T }: { title: string; children: React.ReactNode; T: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div className="settings-section" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, padding: '0 16px' }}>{title}</div>
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', margin: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const { theme: T, toggle: toggleDark } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [form, setForm] = useState<Partial<Artisan>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch('/api/artisan').then(r => r.json()).then((d: Artisan) => {
      setArtisan(d)
      setForm({
        nom: d.nom ?? '', tel: d.tel ?? '', nom_entreprise: d.nom_entreprise ?? '',
        siret: d.siret ?? '', adresse: d.adresse ?? '', code_postal: d.code_postal ?? '',
        ville: d.ville ?? '', site_web: d.site_web ?? '', description_activite: d.description_activite ?? '',
        mention_tva: d.mention_tva ?? 'Non soumis à TVA — Article 293B du CGI',
        photo_url: d.photo_url ?? '', logo_url: d.logo_url ?? '',
      })
    })
  }, [])

  useGSAP(() => {
    if (!artisan) return
    gsap.fromTo('.settings-section', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out', delay: 0.1 })
  }, { scope: containerRef, dependencies: [!!artisan] })

  function set(k: keyof Artisan) {
    return (v: string) => { setForm(f => ({ ...f, [k]: v })); setDirty(true) }
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/artisan', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setDirty(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!artisan) return (
    <MobileShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 14, background: T.bg }}>
        Chargement…
      </div>
    </MobileShell>
  )

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg,
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />

        {/* Header */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', background: T.nav, borderBottom: `0.5px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Réglages</span>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: ACCENT, fontWeight: 600 }}>
              <IconCheck size={16} sw={2.5} />Sauvegardé
            </span>
          )}
        </div>

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 0 130px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Profile card */}
          <div className="settings-section" style={{ opacity: 0, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20,
              background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)',
              borderRadius: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,164,100,0.4), transparent 70%)' }} />
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.photo_url
                  ? <img src={form.photo_url} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <IconUser size={28} sw={1.5} color="rgba(255,255,255,0.8)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{form.nom || artisan.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 1 }}>{artisan.email}</div>
                {form.nom_entreprise && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>{form.nom_entreprise}</div>}
              </div>
              {form.logo_url && (
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={form.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <Section title="Photos & Logo" T={T}>
            <ImageUpload label="Photo de profil" hint="Apparaît sur le dashboard et les documents"
              value={form.photo_url} type="photo" shape="circle" T={T}
              onUploaded={url => { setForm(f => ({ ...f, photo_url: url })); setDirty(true) }} />
            <ImageUpload label="Logo de l'entreprise" hint="PNG fond transparent recommandé — apparaît sur le procès-verbal"
              value={form.logo_url} type="logo" shape="square" T={T}
              onUploaded={url => { setForm(f => ({ ...f, logo_url: url })); setDirty(true) }} />
          </Section>

          {/* Infos perso */}
          <Section title="Informations personnelles" T={T}>
            <Field label="Nom complet" value={form.nom ?? ''} placeholder="Thomas Bertrand" onChange={set('nom')} T={T} />
            <Field label="Téléphone" value={form.tel ?? ''} placeholder="+33 6 00 00 00 00" type="tel" onChange={set('tel')} last T={T} />
          </Section>

          {/* Entreprise */}
          <Section title="Mon entreprise" T={T}>
            <Field label="Nom de l'entreprise" value={form.nom_entreprise ?? ''} placeholder="Bertrand Électricité" onChange={set('nom_entreprise')} T={T} />
            <Field label="N° SIRET" value={form.siret ?? ''} placeholder="123 456 789 00010" onChange={set('siret')} T={T} />
            <Field label="Adresse" value={form.adresse ?? ''} placeholder="12 rue des Artisans" onChange={set('adresse')} T={T} />
            <div style={{ display: 'flex' }}>
              <div style={{ flex: '0 0 38%', borderRight: `1px solid ${T.divider}` }}>
                <Field label="Code postal" value={form.code_postal ?? ''} placeholder="69001" onChange={set('code_postal')} last T={T} />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Ville" value={form.ville ?? ''} placeholder="Lyon" onChange={set('ville')} last T={T} />
              </div>
            </div>
            <Field label="Site web" value={form.site_web ?? ''} placeholder="www.mon-entreprise.fr" onChange={set('site_web')} last T={T} />
          </Section>

          {/* Activité */}
          <Section title="Activité & mentions légales" T={T}>
            <Field label="Description de l'activité" value={form.description_activite ?? ''}
              placeholder="Travaux d'électricité générale…" onChange={set('description_activite')} multiline T={T} />
            <Field label="Mention TVA (sur le procès-verbal)" value={form.mention_tva ?? ''}
              placeholder="Non soumis à TVA — Article 293B du CGI" onChange={set('mention_tva')} last T={T} />
          </Section>

          {/* Apparence */}
          <Section title="Apparence" T={T}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: T.text }}>Mode sombre</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Interface sombre pour économiser la batterie</div>
              </div>
              <Toggle value={T.dark} onChange={toggleDark} T={T} />
            </div>
          </Section>

          {/* App info */}
          <Section title="Application" T={T}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.divider}` }}>
              <div style={{ fontSize: 14, color: T.subtle }}>Version ProFini</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>1.0.0 — Hébergé sur Vercel &amp; Supabase</div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 14, color: T.subtle }}>Conformité</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>RGPD · Données chiffrées · PV valeur juridique eIDAS</div>
            </div>
          </Section>

          {/* Logout */}
          <div className="settings-section" style={{ opacity: 0, padding: '0 16px' }}>
            <button onClick={handleLogout} style={{
              width: '100%', height: 52, background: T.dark ? 'rgba(220,38,38,0.15)' : '#FEF2F2',
              border: '1px solid rgba(220,38,38,0.3)', borderRadius: 14,
              fontSize: 15, fontWeight: 600, color: '#DC2626',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <IconLogOut size={18} sw={2} />Se déconnecter
            </button>
          </div>
        </div>

        {/* Save bar */}
        {dirty && (
          <div style={{ position: 'sticky', bottom: 72, padding: '10px 16px', background: T.nav,
            borderTop: `0.5px solid ${T.border}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
            zIndex: 10, animation: 'slideUp .25s ease-out' }}>
            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', height: 52, background: saving ? T.muted : PRIMARY,
              border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
              color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s',
            }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ position: 'sticky', bottom: 0, height: 72, background: T.nav,
          borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'space-around', paddingBottom: 8, zIndex: 5, flexShrink: 0 }}>
          {[
            { id: 'home',      label: 'Dashboard', icon: IconHome,      path: '/' },
            { id: 'chantiers', label: 'Chantiers',  icon: IconBriefcase, path: '/chantiers-list' },
            { id: 'settings',  label: 'Réglages',   icon: IconSettings,  path: '/settings', active: true },
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
