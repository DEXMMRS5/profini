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
  google_review_url?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan?: 'trial' | 'active' | 'expired'
  trial_ends_at?: string
  relance_j2?: boolean
  relance_j7?: boolean
  relance_j30?: boolean
  relance_ton?: string
  relance_custom_j2?: string
  relance_custom_j7?: string
  relance_custom_j30?: string
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
  sig_artisan_path?: string
  sig_client_url?: string
  sig_client_path?: string
  pdf_url?: string
  date_chantier?: string
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

export interface Relance {
  id: string
  chantier_id: string
  artisan_id: string
  type: 'j2' | 'j7' | 'j30'
  sent_at: string
  email_to?: string
  message_body?: string
}

export function montantHT(ttc: number): number { return ttc / 1.2 }
export function tva(ttc: number): number { return ttc - ttc / 1.2 }

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' €'
}

export function formatMontant(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' €'
}

// Messages d'accueil variés
const GREETINGS = [
  'Bonjour', 'Bienvenue', 'Bonne journée',
  'Content de vous voir', 'Ravi de vous retrouver',
]

const TIPS = [
  'Pensez à clôturer vos chantiers terminés.',
  'Un procès-verbal signé = zéro litige.',
  'Relancez vos impayés dès aujourd\'hui.',
  'Ajoutez votre logo dans les réglages pour un PV pro.',
  'Partagez votre lien avis Google pour booster votre réputation.',
]

export function randomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
}

export function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}
