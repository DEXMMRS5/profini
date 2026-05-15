'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import FormHeader from '@/components/FormHeader'
import { IconCheck, IconStar, IconMail, IconFile, IconCamera, IconPhone } from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

const FEATURES = [
  { icon: IconFile,   text: 'PV de réception PDF illimités' },
  { icon: IconCheck,  text: 'Signature tactile client sur écran' },
  { icon: IconCamera, text: 'Photos avant/après illimitées' },
  { icon: IconStar,   text: "Collecteur d'avis Google automatique" },
  { icon: IconMail,   text: 'Relance paiement automatique J+2 / J+7' },
  { icon: IconPhone,  text: 'Stockage sécurisé de tous les dossiers' },
]

// ── Mini chatbot ProFini ───────────────────────────────────────────────────────
const FAQ: { q: string; a: string }[] = [
  { q: "C'est quoi ProFini ?", a: "ProFini, c'est l'app qui vous fait gagner du temps sur l'administratif : PV signés, photos, relances, avis Google — tout automatisé depuis votre téléphone." },
  { q: "29 € par mois, c'est beaucoup ?", a: "Un seul impayé évité, c'est souvent 500 à 2 000 € récupérés. ProFini se rembourse au premier chantier clôturé correctement." },
  { q: "Et si je veux annuler ?", a: "Vous annulez quand vous voulez, sans frais, en un clic. Aucun engagement." },
  { q: "C'est facile à utiliser ?", a: "C'est fait pour les artisans, pas pour les informaticiens. 5 minutes pour créer un chantier et envoyer un PV signé." },
  { q: "Mes données sont sécurisées ?", a: "Oui. Tout est chiffré, hébergé en Europe (Supabase), conforme RGPD. Personne d'autre que vous n'y a accès." },
]

export default function PlanPage() {
  const router  = useRouter()
  const { theme: T } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Bonjour ! 👋 Je suis là pour répondre à vos questions sur ProFini. Comment puis-je vous aider ?' },
  ])
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useGSAP(() => {
    gsap.fromTo('.plan-feature', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.38, stagger: 0.07, ease: 'power3.out', delay: 0.2 })
    gsap.fromTo('.plan-hero', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
  }, { scope: containerRef })

  function answerQuestion(q: string): string {
    const lq = q.toLowerCase()
    // Recherche dans la FAQ
    for (const f of FAQ) {
      if (f.q.toLowerCase().split(' ').some(w => w.length > 3 && lq.includes(w))) return f.a
    }
    if (lq.includes('prix') || lq.includes('coût') || lq.includes('combien') || lq.includes('euro') || lq.includes('abonnement')) {
      return "ProFini, c'est 29 €/mois tout inclus, avec 14 jours d'essai gratuit. Pas de frais cachés, résiliable à tout moment."
    }
    if (lq.includes('essai') || lq.includes('gratuit') || lq.includes('test')) {
      return "Vous avez 14 jours d'essai gratuit, sans CB requise. Profitez-en pour tester toutes les fonctionnalités."
    }
    if (lq.includes('annul') || lq.includes('résili') || lq.includes('engagement')) {
      return "Aucun engagement. Vous résiliez quand vous voulez depuis les réglages, en 2 clics."
    }
    if (lq.includes('facture') || lq.includes('reçu') || lq.includes('paiement')) {
      return "Vous recevez une facture par email à chaque prélèvement. Simple et transparent."
    }
    return "Pour toute question technique ou concernant votre compte, contactez-nous à support@profini.fr. Nous répondons sous 24h."
  }

  function sendMessage() {
    const q = chatInput.trim()
    if (!q) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setChatInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: answerQuestion(q) }])
      setLoading(false)
    }, 600)
  }

  async function handleSubscribe() {
    setCheckoutLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const json = await res.json()
    if (json.url) window.location.href = json.url
    else { alert('Stripe non configuré. Ajoutez vos clés dans .env.local'); setCheckoutLoading(false) }
  }

  return (
    <MobileShell>
      <div ref={containerRef} style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <FormHeader title="Abonnement" backHref="/settings" cancelLabel="Retour" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hero prix */}
          <div className="plan-hero" style={{ opacity: 0, background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)', borderRadius: 20, padding: '28px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(43,164,100,0.5), transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ background: `${ACCENT}30`, padding: '2px 8px', borderRadius: 6, color: '#4ADE80', fontWeight: 700 }}>✓ 14 jours gratuits</span>
                Résiliable à tout moment
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>29</span>
                <span style={{ fontSize: 20, fontWeight: 600, opacity: 0.9 }}>€</span>
                <span style={{ fontSize: 14, opacity: 0.65 }}>/mois</span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Tout inclus · Sans engagement · Facture mensuelle</div>
            </div>
          </div>

          {/* Features */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="plan-feature" style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < FEATURES.length - 1 ? `1px solid ${T.divider}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ACCENT}14`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={16} sw={2} />
                </div>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{f.text}</span>
                <IconCheck size={14} sw={2.5} color={ACCENT} style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={handleSubscribe} disabled={checkoutLoading} style={{ height: 56, background: checkoutLoading ? T.muted : ACCENT, border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(43,164,100,0.4)', transition: 'all .2s' }}>
            {checkoutLoading ? 'Redirection…' : 'Démarrer l\'essai gratuit de 14 jours →'}
          </button>
          <div style={{ fontSize: 12, color: T.muted, textAlign: 'center', marginTop: -10 }}>Aucune CB requise pour l'essai. Annulation en 2 clics.</div>

          {/* Chatbot */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.divider}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>💬 Une question sur ProFini ?</div>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '82%', padding: '9px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.role === 'user' ? PRIMARY : T.bgAlt, color: m.role === 'user' ? '#fff' : T.text, fontSize: 13, lineHeight: 1.5 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div style={{ fontSize: 13, color: T.muted }}>…</div>}
            </div>
            {/* FAQ rapides */}
            <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.divider}`, display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {['Prix ?', 'Essai gratuit ?', 'Annulation ?', 'Sécurité ?'].map(q => (
                <button key={q} onClick={() => { setChatInput(q); setTimeout(() => { setMessages(m => [...m, { role: 'user', text: q }, { role: 'bot', text: answerQuestion(q) }]) }, 0) }}
                  style={{ whiteSpace: 'nowrap', padding: '5px 12px', background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}25`, borderRadius: 999, fontSize: 12, color: PRIMARY, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: `1px solid ${T.divider}` }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Posez votre question…"
                style={{ flex: 1, height: 38, padding: '0 12px', fontSize: 14, fontFamily: 'inherit', color: T.text, background: T.bgAlt, border: `1px solid ${T.border}`, borderRadius: 10, outline: 'none' }} />
              <button onClick={sendMessage} style={{ width: 38, height: 38, background: PRIMARY, border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12L21 3l-9 18v-9L3 12z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  )
}
