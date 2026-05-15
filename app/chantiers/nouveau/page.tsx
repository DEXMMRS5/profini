'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import FormHeader from '@/components/FormHeader'
import { Field, FormSection, TextInput, SelectInput, TextArea, InfoBubble } from '@/components/FormComponents'
import PhoneInput from '@/components/PhoneInput'
import AddressInput from '@/components/AddressInput'
import { PrimaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { IconMail, IconFile, IconCalendar } from '@/components/icons'
import { formatEur } from '@/lib/types'

const TYPES = ['Électricité','Plomberie','Carrelage','Peinture','Menuiserie','Maçonnerie','Isolation','Couverture','Toiture','Plâtrerie','Façade','VRD','Paysagisme','Décoration','Multi-travaux','Autre']
const STATUTS = [
  { value: 'encours', label: 'En cours' },
  { value: 'impaye',  label: 'Impayé' },
  { value: 'paye',    label: 'Payé' },
  { value: 'cloture', label: 'Clôturé' },
]

export default function NouveauChantierPage() {
  const router = useRouter()
  const { theme: T } = useTheme()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<1 | 2>(1)

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    nom_client: '', tel_client: '', email_client: '',
    adresse: '', code_postal: '', ville: '',
    type_travaux: '', description: '', numero_devis: '',
    montant_ttc: '', date_chantier: today, status: 'encours',
  })

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.nom_client.trim()) e.nom_client = 'Nom requis'
    if (!form.tel_client.replace(/\s/g, '').match(/^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/)) e.tel_client = 'Numéro invalide'
    if (form.email_client && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email_client)) e.email_client = 'Email invalide'
    if (!form.adresse.trim()) e.adresse = 'Adresse requise'
    setErrors(e); return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!form.type_travaux) e.type_travaux = 'Type requis'
    if (!form.montant_ttc || isNaN(parseFloat(form.montant_ttc)) || parseFloat(form.montant_ttc) <= 0) e.montant_ttc = 'Montant invalide'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleContinue() {
    if (step === 1) { if (validateStep1()) setStep(2); return }
    if (!validateStep2()) return
    setLoading(true)
    const res = await fetch('/api/chantiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client:   form.nom_client,
        tel_client:   form.tel_client,
        email_client: form.email_client || undefined,
        adresse:      [form.adresse, form.code_postal, form.ville].filter(Boolean).join(', '),
        type_travaux: form.type_travaux,
        description:  form.description || undefined,
        numero_devis: form.numero_devis || undefined,
        montant_ttc:  parseFloat(form.montant_ttc),
        date_chantier: form.date_chantier,
        status:       form.status,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setErrors({ _: json.error ?? 'Erreur' }); setLoading(false); return }
    // Si clôturé d'emblée → pas de flow photos/signatures
    if (form.status === 'cloture' || form.status === 'paye') {
      router.push('/')
    } else {
      router.push(`/chantiers/${json.id}/photos`)
    }
  }

  const ttc = parseFloat(form.montant_ttc) || 0
  const ht  = ttc > 0 ? (ttc / 1.2).toFixed(2) : '0,00'
  const tva = ttc > 0 ? (ttc - ttc / 1.2).toFixed(2) : '0,00'

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <FormHeader title="Nouveau chantier" backHref="/" />

        {/* Progression */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{ height: '100%', width: step === 1 ? '40%' : '80%', background: PRIMARY, transition: 'width .4s cubic-bezier(.34,1.56,.64,1)' }} />
        </div>

        {/* Étapes */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0' }}>
          {[{ n: 1, l: 'Client' }, { n: 2, l: 'Chantier' }].map(s => (
            <button key={s.n} onClick={() => s.n < step ? setStep(s.n as 1 | 2) : undefined} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, border: 'none', cursor: s.n < step ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: step === s.n ? PRIMARY : s.n < step ? '#DCFCE7' : T.bgAlt, color: step === s.n ? '#fff' : s.n < step ? '#15803D' : T.muted, transition: 'all .2s' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', fontSize: 9, background: step === s.n ? 'rgba(255,255,255,0.25)' : s.n < step ? '#22C55E' : T.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {s.n < step ? '✓' : s.n}
              </span>
              {s.l}
            </button>
          ))}
        </div>

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {step === 1 && (
            <FormSection label="Informations client">
              <Field label="Nom du client" required error={errors.nom_client} hint="Prénom nom ou raison sociale">
                <TextInput value={form.nom_client} onChange={set('nom_client')} placeholder="M. Dupont" error={errors.nom_client} valid={form.nom_client.trim().length >= 2} autoComplete="name" />
              </Field>
              <Field label="Téléphone" required error={errors.tel_client}>
                <PhoneInput value={form.tel_client} onChange={set('tel_client')} error={errors.tel_client} required />
              </Field>
              <Field label="Email (optionnel)" error={errors.email_client} hint="Le PV sera envoyé automatiquement à cet email">
                <TextInput type="email" value={form.email_client} onChange={set('email_client')} placeholder="client@email.fr" icon={IconMail} error={errors.email_client} valid={!!form.email_client && /^[^@]+@[^@]+\.[^@]+$/.test(form.email_client)} />
              </Field>
              <Field label="Adresse du chantier" required error={errors.adresse} hint="Tapez pour voir les suggestions">
                <AddressInput value={form.adresse} error={errors.adresse}
                  onChange={(addr, cp, city) => setForm(f => ({ ...f, adresse: addr, code_postal: cp ?? f.code_postal, ville: city ?? f.ville }))} />
              </Field>
              {(form.code_postal || form.ville) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Field label="Code postal"><TextInput value={form.code_postal} onChange={set('code_postal')} placeholder="69001" inputMode="numeric" valid={/^\d{5}$/.test(form.code_postal)} /></Field>
                  <Field label="Ville"><TextInput value={form.ville} onChange={set('ville')} placeholder="Lyon" valid={form.ville.trim().length >= 2} /></Field>
                </div>
              )}
            </FormSection>
          )}

          {step === 2 && (
            <FormSection label="Détails du chantier">
              <Field label="Date du chantier" required>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}><IconCalendar size={17} sw={1.75} /></div>
                  <input type="date" value={form.date_chantier} onChange={e => setForm(f => ({ ...f, date_chantier: e.target.value }))}
                    style={{ width: '100%', height: 48, paddingLeft: 38, paddingRight: 14, fontSize: 15, fontFamily: 'inherit', color: T.text, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </Field>
              <Field label="Type de travaux" required error={errors.type_travaux}>
                <SelectInput value={form.type_travaux} onChange={set('type_travaux')} placeholder="Sélectionner…" options={TYPES} error={errors.type_travaux} />
              </Field>
              <Field label="Statut" hint="Vous pouvez enregistrer directement un chantier payé ou clôturé">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUTS.map(s => (
                    <button key={s.value} onClick={() => setForm(f => ({ ...f, status: s.value }))} style={{ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${form.status === s.value ? PRIMARY : T.border}`, background: form.status === s.value ? `${PRIMARY}10` : 'transparent', color: form.status === s.value ? PRIMARY : T.subtle, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Description (optionnel)" hint="Détails des travaux effectués">
                <TextArea value={form.description} onChange={set('description')} placeholder="Ex: remplacement tableau électrique, pose de 8 prises…" rows={3} />
              </Field>
              <Field label="Numéro de devis (optionnel)">
                <TextInput value={form.numero_devis} onChange={set('numero_devis')} placeholder="DEV-2026-0142" icon={IconFile} valid={form.numero_devis.trim().length >= 3} />
              </Field>
              <Field label="Montant TTC" required error={errors.montant_ttc}>
                <TextInput type="number" value={form.montant_ttc} onChange={set('montant_ttc')} placeholder="0,00" suffix="€" error={errors.montant_ttc} inputMode="decimal" valid={ttc > 0} />
              </Field>
              {ttc > 0 && <InfoBubble>HT = {ht} € · TVA 20% = {tva} €</InfoBubble>}
            </FormSection>
          )}

          {errors._ && <div style={{ fontSize: 13, color: '#E24B4A', background: '#FCEBEB', padding: '10px 14px', borderRadius: 10 }}>{errors._}</div>}
        </div>

        <BottomBar>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ height: 56, padding: '0 18px', background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: T.subtle, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              Retour
            </button>
          )}
          <PrimaryButton loading={loading} onClick={handleContinue}>
            {step === 1 ? 'Suivant →' : form.status === 'cloture' || form.status === 'paye' ? 'Enregistrer' : 'Continuer →'}
          </PrimaryButton>
        </BottomBar>
      </div>
    </MobileShell>
  )
}

const PRIMARY = '#15355B'
