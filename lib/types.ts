export type ChantierStatus = 'encours' | 'impaye' | 'paye' | 'cloture'

export interface Artisan {
  id: string
  nom: string
  email: string
  tel?: string
  nom_entreprise?: string
  siret?: string
  adresse?: string
  code_postal?: string
  ville?: string
  site_web?: string
  description_activite?: string
  mention_tva?: string
  photo_url?: string
  logo_url?: string
  created_at: string
}

export interface Chantier {
  id: string
  artisan_id: string
  nom_client: string
  tel_client: string
  email_client?: string
  adresse: string
  type_travaux: string
  description?: string
  numero_devis?: string
  montant_ttc: number
  status: ChantierStatus
  paiement_recu: boolean
  demande_avis: boolean
  sig_artisan_url?: string
  sig_client_url?: string
  pdf_url?: string
  created_at: string
  closed_at?: string
  photos?: Photo[]
}

export interface Photo {
  id: string
  chantier_id: string
  url: string
  path: string
  created_at: string
}

export interface ChantierFormData {
  nom_client: string
  tel_client: string
  email_client: string
  adresse: string
  type_travaux: string
  description: string
  numero_devis: string
  montant_ttc: string
}

export function montantHT(ttc: number): number {
  return ttc / 1.2
}

export function tva(ttc: number): number {
  return ttc - ttc / 1.2
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' €'
}
