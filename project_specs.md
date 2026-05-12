# ProFini — Project Specs

## Ce que fait l'app / qui l'utilise

ProFini est une **application mobile web** destinée aux **artisans du bâtiment** (électriciens, plombiers, carreleurs…). Elle permet de gérer les chantiers : création, photos, double signature, génération d'un procès-verbal PDF, et clôture.

Utilisateur unique : l'artisan, sur son smartphone.

---

## Tech Stack

| Couche | Choix |
|--------|-------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS-in-JS inline styles (fidélité pixel-perfect au design) |
| BaaS | Supabase (Auth, Postgres, Storage) — préparé, non câblé dans cette itération |
| Déploiement | Vercel |
| Polices | Inter (défaut) via Google Fonts |
| Animations | CSS keyframes natifs (pas de lib externe) |

---

## Pages / Écrans (App Router)

| Route | Écran | Description |
|-------|-------|-------------|
| `/` | Dashboard | CA en attente, stats (en attente / clôturés), liste des chantiers actifs |
| `/chantiers/nouveau` | Nouveau chantier | Formulaire : nom client, tel, email, adresse, type travaux, montant TTC |
| `/chantiers/photos` | Photos | Ajout de photos (max 8) via input file + grille |
| `/chantiers/signature-artisan` | Signature artisan | Canvas de signature digitale pour l'artisan |
| `/chantiers/signature-client` | Signature client | Canvas de signature digitale pour le client |
| `/chantiers/recapitulatif` | Récapitulatif | Synthèse client + financier (HT/TVA/TTC) + options clôture |
| `/chantiers/succes` | Succès | Confirmation animée — PDF généré, client notifié |

La navigation entre écrans se fait via `router.push()`. L'état du chantier en cours est géré en mémoire (React context ou `useState` passé en props) pour cette itération.

---

## Design system

- **Couleurs** : Navy `#15355B` (primary) · Vert `#2BA464` (accent) · Fond `#F9FAFB` · Texte `#111827`
- **Border-radius** : 12px (cards) · 8px (inputs) · 999px (badges pill)
- **Typography** : Inter 400/500/600/700
- **Mobile-first** : max-width 430px, centré sur desktop dans un fond sombre (`#0F1729`)
- **Dark mode** : supporté via classe CSS (préparé, non activé par défaut)

---

## Données (itération 1 — frontend only)

Pas de base de données dans cette itération. Les données du chantier en cours sont gardées en mémoire via un React context `ChantierContext`. Structure :

```ts
type Chantier = {
  nom: string
  tel: string
  email?: string
  adresse: string
  type: string
  description?: string
  devis?: string
  montant: string
  photos: File[]
  sigArtisan: boolean
  sigClient: boolean
  paiementRecu: boolean
  demandeAvis: boolean
}
```

Les chantiers affichés sur le dashboard sont des données mockées pour l'instant.

---

## Ce que "done" veut dire

- [ ] Les 7 écrans sont implémentés pixel-perfect (fidèle au design handoff)
- [ ] Formulaire validé (champs requis + email format)
- [ ] Canvas de signature fonctionnel (souris + touch)
- [ ] Upload photos avec grille 2 colonnes et suppression individuelle
- [ ] Navigation fluide entre tous les écrans
- [ ] `npm run build` passe sans erreur TypeScript
- [ ] Visible et utilisable sur mobile (375px) et centré sur desktop

---

## Ce qui est hors scope (itération 1)

- Authentification Supabase
- Persistance des chantiers en base
- Génération PDF réelle
- Envoi d'email
- Demande d'avis Google réelle
