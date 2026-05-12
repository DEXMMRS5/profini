'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import { Field, FormSection, TextInput, SelectInput, TextArea, InfoBubble } from '@/components/FormComponents'
import { PrimaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { IconMail, IconMapPin, IconFile } from '@/components/icons'

const TYPES = ['Électricité', 'Plomberie', 'Carrelage', 'Peinture', 'Menuiserie', 'Maçonnerie', 'Multi-travaux']

export default function NouveauChantierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    nom_client: '', tel_client: '', email_client: '',
    adresse: '', type_travaux: '', description: '',
    numero_devis: '', montant_ttc: '',
  })

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const required: (keyof typeof form)[] = ['nom_client', 'tel_client', 'adresse', 'type_travaux', 'montant_ttc']
  const isValid = required.every(k => form[k].trim().length > 0)

  async function handleSubmit() {
    const e: Record<string, string> = {}
    required.forEach(k => { if (!form[k].trim()) e[k] = 'Champ requis' })
    if (form.email_client && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email_client)) e.email_client = 'Email invalide'
    if (form.montant_ttc && isNaN(parseFloat(form.montant_ttc))) e.montant_ttc = 'Montant invalide'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setLoading(true)
    console.log('[POST /api/chantiers] start')
    const res = await fetch('/api/chantiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, montant_ttc: parseFloat(form.montant_ttc) }),
    })
    const json = await res.json()
    console.log('[POST /api/chantiers] end', json)

    if (!res.ok) { setErrors({ _: json.error ?? 'Erreur' }); setLoading(false); return }
    router.push(`/chantiers/${json.id}/photos`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Nouveau chantier" backHref="/" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <FormSection label="Informations client">
            <Field label="Nom du client" required error={errors.nom_client}>
              <TextInput value={form.nom_client} onChange={set('nom_client')} placeholder="ex. M. Dupont" error={errors.nom_client} />
            </Field>
            <Field label="Téléphone" required error={errors.tel_client}>
              <TextInput type="tel" value={form.tel_client} onChange={set('tel_client')} prefix="+33" placeholder="6 12 34 56 78" error={errors.tel_client} />
            </Field>
            <Field label="Email (optionnel)" error={errors.email_client}>
              <TextInput type="email" value={form.email_client} onChange={set('email_client')} placeholder="client@email.fr" icon={IconMail} error={errors.email_client} />
            </Field>
            <Field label="Adresse chantier" required error={errors.adresse}>
              <TextInput value={form.adresse} onChange={set('adresse')} placeholder="12 rue Victor Hugo, Lyon" icon={IconMapPin} error={errors.adresse} />
            </Field>
          </FormSection>

          <FormSection label="Détails du chantier">
            <Field label="Type de travaux" required error={errors.type_travaux}>
              <SelectInput value={form.type_travaux} onChange={set('type_travaux')} placeholder="Sélectionner…" options={TYPES} error={errors.type_travaux} />
            </Field>
            <Field label="Description (optionnel)">
              <TextArea value={form.description} onChange={set('description')} placeholder="Détails des travaux réalisés…" />
            </Field>
            <Field label="Numéro de devis (optionnel)">
              <TextInput value={form.numero_devis} onChange={set('numero_devis')} placeholder="ex. DEV-2026-0142" icon={IconFile} />
            </Field>
            <Field label="Montant TTC" required error={errors.montant_ttc}>
              <TextInput type="number" value={form.montant_ttc} onChange={set('montant_ttc')} placeholder="0,00" suffix="€" error={errors.montant_ttc} />
            </Field>
            <InfoBubble>La TVA 20% sera calculée automatiquement.</InfoBubble>
          </FormSection>

          {errors._ && (
            <div style={{ fontSize: 13, color: '#E24B4A', background: '#FCEBEB', padding: '10px 14px', borderRadius: 10 }}>
              {errors._}
            </div>
          )}
        </div>

        <BottomBar>
          <PrimaryButton disabled={!isValid} loading={loading} onClick={handleSubmit}>
            Continuer
          </PrimaryButton>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
