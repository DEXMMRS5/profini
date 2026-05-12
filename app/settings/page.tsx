'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { createClient } from '@/lib/supabase/client'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import {
  IconUser, IconPhone, IconMail, IconLogOut, IconCheck,
  IconMapPin, IconFile, IconBriefcase, IconHome, IconSettings,
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

// ── Composants UI locaux ───────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="settings-section" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const,
        color: '#6B7280', padding: '0 16px' }}>{title}</div>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
        overflow: 'hidden', margin: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}

function FieldRow({ label, value, placeholder, onChange, type = 'text', last }: {
  label: string; value: string; placeholder?: string
  onChange: (v: string) => void; type?: string; last?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : '1px solid #F3F4F6' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' as const,
        letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 40, padding: '0 12px', fontSize: 15,
          fontFamily: 'inherit', color: '#111827', background: focused ? '#fff' : '#F9FAFB',
          border: `1px solid ${focused ? PRIMARY : '#E5E7EB'}`,
          borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
          boxShadow: focused ? `0 0 0 3px ${PRIMARY}18` : 'none', transition: 'all .15s',
        }} />
    </div>
  )
}

function TextareaRow({ label, value, placeholder, onChange, last }: {
  label: string; value: string; placeholder?: string; onChange: (v: string) => void; last?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ padding: '12px 16px', borderBottom: last ? 'none' : '1px solid #F3F4F6' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' as const,
        letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <textarea
        value={value} placeholder={placeholder} rows={3}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '10px 12px', fontSize: 14, lineHeight: 1.5,
          fontFamily: 'inherit', color: '#111827', background: focused ? '#fff' : '#F9FAFB',
          border: `1px solid ${focused ? PRIMARY : '#E5E7EB'}`,
          borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
          resize: 'none', boxShadow: focused ? `0 0 0 3px ${PRIMARY}18` : 'none', transition: 'all .15s',
        }} />
    </div>
  )
}

// ── Upload image ───────────────────────────────────────────────────────────────
function ImageUpload({ label, value, type, onUploaded }: {
  label: string; value?: string; type: 'photo' | 'logo'; onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)

  useEffect(() => { setPreview(value) }, [value])

  async function handleFile(file: File) {
    setUploading(true)
    const local = URL.createObjectURL(file)
    setPreview(local)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/artisan/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.url) { setPreview(json.url); onUploaded(json.url) }
    setUploading(false)
  }

  const isLogo = type === 'logo'

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' as const,
        letterSpacing: 0.5, marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Preview */}
        <div style={{
          width: isLogo ? 80 : 64, height: isLogo ? 80 : 64,
          borderRadius: isLogo ? 12 : '50%',
          background: preview ? 'transparent' : `${PRIMARY}10`,
          border: `2px dashed ${preview ? PRIMARY : '#D1D5DB'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
          transition: 'border-color .2s',
        }} onClick={() => inputRef.current?.click()}>
          {preview
            ? <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: isLogo ? 'contain' : 'cover' }} />
            : <span style={{ fontSize: 22, opacity: 0.4 }}>{isLogo ? '🏢' : '👤'}</span>
          }
        </div>
        {/* Actions */}
        <div style={{ flex: 1 }}>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{
            width: '100%', height: 40, background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}30`,
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: PRIMARY,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          }}>
            {uploading ? 'Envoi…' : preview ? 'Changer' : 'Choisir une image'}
          </button>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, lineHeight: 1.4 }}>
            {isLogo ? 'PNG ou SVG recommandé, fond transparent' : 'JPG, PNG — apparaît dans vos documents'}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
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
        nom: d.nom ?? '',
        tel: d.tel ?? '',
        nom_entreprise: d.nom_entreprise ?? '',
        siret: d.siret ?? '',
        adresse: d.adresse ?? '',
        code_postal: d.code_postal ?? '',
        ville: d.ville ?? '',
        site_web: d.site_web ?? '',
        description_activite: d.description_activite ?? '',
        mention_tva: d.mention_tva ?? 'Non soumis à TVA — Article 293B du CGI',
        photo_url: d.photo_url ?? '',
        logo_url: d.logo_url ?? '',
      })
    })
  }, [])

  useGSAP(() => {
    gsap.fromTo('.settings-section',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: 'power3.out', delay: 0.1 }
    )
  }, { scope: containerRef, dependencies: [!!artisan] })

  function set(k: keyof Artisan) {
    return (v: string) => { setForm(f => ({ ...f, [k]: v })); setDirty(true) }
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/artisan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setDirty(false)
    setSaved(true)
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
        height: '100vh', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
        Chargement…
      </div>
    </MobileShell>
  )

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

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 0 120px',
          display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Profile card */}
          <div className="settings-section" style={{ opacity: 0, margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px',
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #0A2240 100%)`,
              borderRadius: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100,
                borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}40, transparent 70%)` }} />
              {/* Avatar */}
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.photo_url
                  ? <img src={form.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profil" />
                  : <IconUser size={28} sw={1.5} color="rgba(255,255,255,0.8)" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{form.nom ?? artisan.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 1 }}>{artisan.email}</div>
                {form.nom_entreprise && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>{form.nom_entreprise}</div>}
              </div>
              {/* Logo preview */}
              {form.logo_url && (
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={form.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <Section title="Photos & Logo">
            <ImageUpload label="Photo de profil" value={form.photo_url} type="photo"
              onUploaded={url => { setForm(f => ({ ...f, photo_url: url })); setDirty(true) }} />
            <ImageUpload label="Logo de l'entreprise (sur le procès-verbal)" value={form.logo_url} type="logo"
              onUploaded={url => { setForm(f => ({ ...f, logo_url: url })); setDirty(true) }} />
          </Section>

          {/* Infos personnelles */}
          <Section title="Informations personnelles">
            <FieldRow label="Nom complet" value={form.nom ?? ''} placeholder="Thomas Bertrand" onChange={set('nom')} />
            <FieldRow label="Téléphone" value={form.tel ?? ''} placeholder="+33 6 00 00 00 00" type="tel" onChange={set('tel')} last />
          </Section>

          {/* Entreprise */}
          <Section title="Mon entreprise">
            <FieldRow label="Nom de l'entreprise" value={form.nom_entreprise ?? ''} placeholder="Bertrand Électricité" onChange={set('nom_entreprise')} />
            <FieldRow label="N° SIRET" value={form.siret ?? ''} placeholder="123 456 789 00010" onChange={set('siret')} />
            <FieldRow label="Adresse" value={form.adresse ?? ''} placeholder="12 rue des Artisans" onChange={set('adresse')} />
            <div style={{ display: 'flex' }}>
              <div style={{ flex: '0 0 36%', borderRight: '1px solid #F3F4F6' }}>
                <FieldRow label="Code postal" value={form.code_postal ?? ''} placeholder="69001" onChange={set('code_postal')} last />
              </div>
              <div style={{ flex: 1 }}>
                <FieldRow label="Ville" value={form.ville ?? ''} placeholder="Lyon" onChange={set('ville')} last />
              </div>
            </div>
            <FieldRow label="Site web (optionnel)" value={form.site_web ?? ''} placeholder="www.mon-site.fr" onChange={set('site_web')} last />
          </Section>

          {/* Description */}
          <Section title="Activité">
            <TextareaRow label="Description de l'activité" value={form.description_activite ?? ''}
              placeholder="Travaux d'électricité générale, installation et dépannage…"
              onChange={set('description_activite')} last />
          </Section>

          {/* Juridique */}
          <Section title="Mentions légales & TVA">
            <FieldRow label="Mention TVA (apparaît sur le PV)" value={form.mention_tva ?? ''}
              placeholder="Non soumis à TVA — Article 293B du CGI"
              onChange={set('mention_tva')} last />
          </Section>

          {/* App info */}
          <Section title="Application">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Version</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>ProFini 1.0.0</div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Données</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Hébergé sur Supabase · Conforme RGPD</div>
            </div>
          </Section>

          {/* Logout */}
          <div className="settings-section" style={{ opacity: 0, padding: '0 16px' }}>
            <button onClick={handleLogout} style={{
              width: '100%', height: 52, background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#DC2626',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <IconLogOut size={18} sw={2} />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Save bar */}
        {dirty && (
          <div style={{ position: 'sticky', bottom: 72, left: 0, right: 0,
            padding: '10px 16px', background: '#fff', borderTop: '0.5px solid #E5E7EB',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', zIndex: 10, animation: 'slideUp .25s ease-out' }}>
            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', height: 52, background: saving ? '#9CA3AF' : PRIMARY,
              border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
              color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s',
            }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <BottomNav active="settings" />
      </div>
    </MobileShell>
  )
}

function BottomNav({ active }: { active: string }) {
  const router = useRouter()
  const items = [
    { id: 'home', label: 'Dashboard', icon: IconHome, path: '/' },
    { id: 'chantiers', label: 'Chantiers', icon: IconBriefcase, path: '/chantiers-list' },
    { id: 'settings', label: 'Réglages', icon: IconSettings, path: '/settings' },
  ]
  return (
    <div style={{ position: 'sticky', bottom: 0, height: 72, background: '#fff',
      borderTop: '0.5px solid #E5E7EB', display: 'flex', alignItems: 'center',
      justifyContent: 'space-around', paddingBottom: 8, zIndex: 5, flexShrink: 0 }}>
      {items.map(n => (
        <button key={n.id} onClick={() => router.push(n.path)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '8px 16px', color: n.id === active ? PRIMARY : '#9CA3AF', fontFamily: 'inherit',
        }}>
          <n.icon size={22} sw={n.id === active ? 2 : 1.75} />
          <span style={{ fontSize: 11, fontWeight: n.id === active ? 600 : 500 }}>{n.label}</span>
        </button>
      ))}
    </div>
  )
}
