'use client'
import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const id = params.id
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const [uploading, setUploading] = useState(false)

  function addFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, MAX - photos.length)
    const newP = arr.map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), file: f }))
    setPhotos(p => [...p, ...newP])
  }

  function remove(pid: string) {
    setPhotos(p => p.filter(x => x.id !== pid))
  }

  async function handleContinue() {
    setUploading(true)
    console.log('[photos] uploading', photos.length, 'photos for chantier', id)

    for (const p of photos.filter(x => x.file)) {
      const fd = new FormData()
      fd.append('file', p.file!)
      await fetch(`/api/chantiers/${id}/photos`, { method: 'POST', body: fd })
    }

    console.log('[photos] done')
    router.push(`/chantiers/${id}/signature-artisan`)
  }

  const empty = photos.length === 0

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Photos du chantier" backHref={`/chantiers/${id}`} />

        <input ref={fileRef} type="file" accept="image/*" multiple
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {empty ? (
            <div style={{ flex: 1, minHeight: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: `${PRIMARY}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, marginBottom: 8 }}>
                <IconCamera size={40} sw={1.5} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Aucune photo ajoutée</div>
              <div style={{ fontSize: 14, color: '#6B7280', maxWidth: 260, lineHeight: 1.45 }}>
                Prenez des photos du chantier terminé pour le procès-verbal.
              </div>
              <button onClick={() => fileRef.current?.click()} style={{
                marginTop: 16, width: '100%', maxWidth: 320, height: 180, padding: 16,
                background: '#F3F4F6', border: '2px dashed #D1D5DB', borderRadius: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer', color: PRIMARY, fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
              }}>
                <IconCameraPlus size={32} sw={1.75} />
                Prendre une photo
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Photos ajoutées</h2>
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, padding: '4px 8px', background: '#F3F4F6', borderRadius: 999 }}>
                  {photos.length}/{MAX}
                </span>
              </div>

              <button onClick={() => fileRef.current?.click()} disabled={photos.length >= MAX} style={{
                width: '100%', height: 100,
                background: '#F3F4F6', border: '2px dashed #D1D5DB', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, cursor: photos.length >= MAX ? 'not-allowed' : 'pointer',
                color: PRIMARY, fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                opacity: photos.length >= MAX ? 0.4 : 1,
              }}>
                <IconCameraPlus size={24} sw={2} />
                Ajouter une photo
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {photos.map((p, i) => (
                  <div key={p.id} style={{
                    position: 'relative', aspectRatio: '4/3', borderRadius: 12,
                    overflow: 'hidden', background: '#E5E7EB',
                    animation: `slideUp .25s ease-out ${i * 0.04}s both`,
                  }}>
                    <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <button onClick={() => remove(p.id)} style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(226,75,74,0.92)', border: 'none', cursor: 'pointer',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconX size={16} sw={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <BottomBar>
          <SecondaryButton onClick={() => fileRef.current?.click()} icon={IconCameraPlus} fullWidth>
            Ajouter
          </SecondaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton loading={uploading} onClick={handleContinue}>Continuer</PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
