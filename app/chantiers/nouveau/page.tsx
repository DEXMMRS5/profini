'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import { Field, FormSection, TextInput, SelectInput, TextArea, InfoBubble } from '@/components/FormComponents'
import PhoneInput from '@/components/PhoneInput'
import AddressInput from '@/components/AddressInput'
import { PrimaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { IconMail, IconFile } from '@/components/icons'

const TYPES = ['Électricité', 'Plomberie', 'Carrelage', 'Peinture', 'Menuiserie', 'Maçonnerie', 'Isolation', 'Couverture', 'Multi-travaux', 'Autre']

export default function NouveauChantierPage() {
  const router = useRouter()
  const { theme: T } = useTheme()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<1 | 2>(1)

  const [form, setForm] = useState({
    nom_client: '', tel_client: '', email_client: '',
    adresse: '', code_postal: '', ville: '',
    type_travaux: '', description: '', numero_devis: '', montant_ttc: '',
  })

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  // Validation par step
  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.nom_client.trim()) e.nom_client = 'Le nom du client est requis'
    if (!form.tel_client.replace(/\s/g, '').match(/^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/))
      e.tel_client = 'Numéro invalide (ex: 06 12 34 56 78)'
    if (form.email_client && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email_client))
      e.email_client = 'Email invalide'
    if (!form.adresse.trim()) e.adresse = 'L\'adresse est requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!form.type_travaux) e.type_travaux = 'Le type de travaux est requis'
    if (!form.montant_ttc || isNaN(parseFloat(form.montant_ttc)) || parseFloat(form.montant_ttc) <= 0)
      e.montant_ttc = 'Montant invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleContinue() {
    if (step === 1) {
      if (validateStep1()) setStep(2)
      return
    }
    if (!validateStep2()) return

    setLoading(true)
    console.log('[POST /api/chantiers] start')
    const res = await fetch('/api/chantiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client: form.nom_client,
        tel_client: form.tel_client,
        email_client: form.email_client || undefined,
        adresse: [form.adresse, form.code_postal, form.ville].filter(Boolean).join(' '),
        type_travaux: form.type_travaux,
        description: form.description || undefined,
        numero_devis: form.numero_devis || undefined,
        montant_ttc: parseFloat(form.montant_ttc),
      }),
    })
    const json = await res.json()
    console.log('[POST /api/chantiers] end', json)

    if (!res.ok) { setErrors({ _: json.error ?? 'Erreur serveur' }); setLoading(false); return }
    router.push(`/chantiers/${json.id}/photos`)
  }

  // Indicateur d'étape
  const progressW = step === 1 ? '35%' : '70%'

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Nouveau chantier" backHref="/" />

        {/* Barre de progression */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{ height: '100%', width: progressW, background: '#15355B', transition: 'width .4s cubic-bezier(.34,1.56,.64,1)' }} />
        </div>

        {/* Étapes */}
        <div style={{ padding: '10px 16px 0', display: 'flex', gap: 8 }}>
          {[{ n: 1, label: 'Client' }, { n: 2, label: 'Chantier' }].map(s => (
            <button key={s.n} onClick={() => s.n < step ? setStep(s.n as 1 | 2) : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: s.n < step ? 'pointer' : 'default',
              background: step === s.n ? '#15355B' : s.n < step ? '#2BA46420' : T.bgAlt,
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              color: step === s.n ? '#fff' : s.n < step ? '#2BA464' : T.muted,
              transition: 'all .2s',
            }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', fontSize: 10,
                background: step === s.n ? 'rgba(255,255,255,0.25)' : s.n < step ? '#2BA464' : T.border,
                color: step === s.n ? '#fff' : s.n < step ? '#fff' : T.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {s.n < step ? '✓' : s.n}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Étape 1 — Client */}
          {step === 1 && (
            <FormSection label="Informations du client">
              <Field label="Nom du client" required error={errors.nom_client} hint="Prénom et nom, ou raison sociale">
                <TextInput value={form.nom_client} onChange={set('nom_client')}
                  placeholder="M. Dupont" error={errors.nom_client}
                  valid={form.nom_client.trim().length >= 2} autoComplete="name" />
              </Field>

              <Field label="Téléphone" required error={errors.tel_client}>
                <PhoneInput value={form.tel_client} onChange={set('tel_client')} error={errors.tel_client} required />
              </Field>

              <Field label="Email (optionnel)" error={errors.email_client} hint="Pour l'envoi automatique du procès-verbal">
                <TextInput type="email" value={form.email_client} onChange={set('email_client')}
                  placeholder="client@email.fr" icon={IconMail} error={errors.email_client}
                  valid={!!form.email_client && /^[^@]+@[^@]+\.[^@]+$/.test(form.email_client)}
                  autoComplete="email" />
              </Field>

              <Field label="Adresse du chantier" required error={errors.adresse} hint="Commencez à taper pour voir les suggestions">
                <AddressInput value={form.adresse} error={errors.adresse}
                  onChange={(addr, cp, city) => {
                    setForm(f => ({ ...f, adresse: addr, code_postal: cp ?? f.code_postal, ville: city ?? f.ville }))
                  }} />
              </Field>

              {/* Code postal + Ville auto-remplis */}
              {(form.code_postal || form.ville) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Field label="Code postal">
                    <TextInput value={form.code_postal} onChange={set('code_postal')} placeholder="69001"
                      inputMode="numeric" valid={/^\d{5}$/.test(form.code_postal)} />
                  </Field>
                  <Field label="Ville">
                    <TextInput value={form.ville} onChange={set('ville')} placeholder="Lyon"
                      valid={form.ville.trim().length >= 2} autoComplete="address-level2" />
                  </Field>
                </div>
              )}
            </FormSection>
          )}

          {/* Étape 2 — Chantier */}
          {step === 2 && (
            <FormSection label="Détails du chantier">
              <Field label="Type de travaux" required error={errors.type_travaux} hint="Sélectionnez la catégorie la plus proche">
                <SelectInput value={form.type_travaux} onChange={set('type_travaux')}
                  placeholder="Sélectionner le type…" options={TYPES} error={errors.type_travaux} />
              </Field>

              <Field label="Description (optionnel)" hint="Décrivez précisément ce qui a été fait">
                <TextArea value={form.description} onChange={set('description')}
                  placeholder="Ex: remplacement tableau électrique, pose de 8 prises, installation variateur…" rows={3} />
              </Field>

              <Field label="Numéro de devis (optionnel)">
                <TextInput value={form.numero_devis} onChange={set('numero_devis')}
                  placeholder="DEV-2026-0142" icon={IconFile}
                  valid={form.numero_devis.trim().length >= 3} />
              </Field>

              <Field label="Montant TTC" required error={errors.montant_ttc} hint="Montant total toutes taxes comprises">
                <TextInput type="number" value={form.montant_ttc} onChange={set('montant_ttc')}
                  placeholder="0,00" suffix="€" error={errors.montant_ttc} inputMode="decimal"
                  valid={parseFloat(form.montant_ttc) > 0} />
              </Field>

              <InfoBubble>
                HT = {form.montant_ttc && parseFloat(form.montant_ttc) > 0
                  ? (parseFloat(form.montant_ttc) / 1.2).toFixed(2)
                  : '0,00'} € · TVA 20% = {form.montant_ttc && parseFloat(form.montant_ttc) > 0
                  ? (parseFloat(form.montant_ttc) - parseFloat(form.montant_ttc) / 1.2).toFixed(2)
                  : '0,00'} €
              </InfoBubble>
            </FormSection>
          )}

          {errors._ && (
            <div style={{ fontSize: 13, color: '#E24B4A', background: '#FCEBEB', padding: '10px 14px', borderRadius: 10 }}>
              {errors._}
            </div>
          )}
        </div>

        <BottomBar>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{
              height: 56, padding: '0 20px', background: T.bgAlt, border: `1px solid ${T.border}`,
              borderRadius: 12, fontSize: 15, fontWeight: 600, color: T.subtle,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}>
              Retour
            </button>
          )}
          <PrimaryButton loading={loading} onClick={handleContinue}>
            {step === 1 ? 'Suivant — Chantier →' : 'Créer et continuer →'}
          </PrimaryButton>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
