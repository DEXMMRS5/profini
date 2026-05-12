'use client'
import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import { PrimaryButton, SecondaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { IconCamera, IconCameraPlus, IconX } from '@/components/icons'

const PRIMARY = '#15355B'
const MAX = 8

interface LocalPhoto { id: string; url: string; file?: File }

export default function PhotosPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { theme: T } = useTheme()
  const id = params.id
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const [uploading, setUploading] = useState(false)

  function addFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, MAX - photos.length)
    setPhotos(p => [...p, ...arr.map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), file: f }))])
  }

  function remove(pid: string) { setPhotos(p => p.filter(x => x.id !== pid)) }

  async function handleContinue() {
    setUploading(true)
    await Promise.all(photos.filter(p => p.file).map(p => {
      const fd = new FormData(); fd.append('file', p.file!)
      return fetch(`/api/chantiers/${id}/photos`, { method: 'POST', body: fd })
    }))
    router.push(`/chantiers/${id}/signature-artisan`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Photos du chantier" backHref={`/chantiers/${id}`} />

        <input ref={fileRef} type="file" accept="image/*" multiple
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {photos.length === 0 ? (
            <div style={{ flex: 1, minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: `${PRIMARY}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                <IconCamera size={38} sw={1.5} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: T.text }}>Aucune photo</div>
              <div style={{ fontSize: 14, color: T.subtle, maxWidth: 260, lineHeight: 1.5 }}>
                Ajoutez des photos du chantier terminé pour le procès-verbal.
              </div>
              <button onClick={() => fileRef.current?.click()} style={{
                marginTop: 12, width: '100%', maxWidth: 300, height: 160, padding: 16,
                background: T.bgAlt, border: `2px dashed ${T.border}`,
                borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8, cursor: 'pointer', color: PRIMARY,
                fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
              }}>
                <IconCameraPlus size={28} sw={1.75} />
                Choisir des photos
              </button>
              <div style={{ fontSize: 12, color: T.muted }}>Jusqu'à {MAX} photos · JPG, PNG, HEIC</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, margin: 0 }}>Photos ({photos.length}/{MAX})</h2>
                {photos.length < MAX && (
                  <button onClick={() => fileRef.current?.click()} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    background: `${PRIMARY}10`, border: `1px solid ${PRIMARY}30`, borderRadius: 10,
                    color: PRIMARY, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <IconCameraPlus size={15} sw={2} />Ajouter
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {photos.map((p, i) => (
                  <div key={p.id} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 12,
                    overflow: 'hidden', background: T.bgAlt, animation: `slideUp .25s ease-out ${i * 0.04}s both` }}>
                    <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <button onClick={() => remove(p.id)} style={{
                      position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
                      background: 'rgba(226,75,74,0.9)', border: 'none', cursor: 'pointer',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconX size={15} sw={2.5} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX && (
                  <button onClick={() => fileRef.current?.click()} style={{
                    aspectRatio: '4/3', borderRadius: 12, background: T.bgAlt,
                    border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer', color: T.muted, fontSize: 12, fontFamily: 'inherit',
                  }}>
                    <IconCameraPlus size={22} sw={1.75} />Ajouter
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <BottomBar>
          <SecondaryButton onClick={() => fileRef.current?.click()} icon={IconCameraPlus} fullWidth>Ajouter</SecondaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton loading={uploading} onClick={handleContinue}>
              {photos.length === 0 ? 'Ignorer →' : 'Continuer →'}
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
