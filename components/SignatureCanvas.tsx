'use client'
import { useRef, useState, useEffect } from 'react'
import { IconX } from './icons'

interface Props {
  onChange?: (hasInk: boolean) => void
  onCapture?: (dataUrl: string | null) => void
}

export default function SignatureCanvas({ onChange, onCapture }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const point = 'touches' in e ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawingRef.current = true
    lastRef.current = getPos(e)
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawingRef.current) return
    e.preventDefault()
    const p = getPos(e)
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(lastRef.current!.x, lastRef.current!.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastRef.current = p
    if (!hasInk) {
      setHasInk(true)
      onChange?.(true)
    }
  }

  function end() { drawingRef.current = false }

  function clear() {
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onChange?.(false)
    onCapture?.(null)
  }

  function capture(): string | null {
    if (!hasInk) return null
    return canvasRef.current!.toDataURL('image/png')
  }

  // Expose capture via imperative handle workaround
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    ;(el as HTMLCanvasElement & { captureSignature: () => string | null }).captureSignature = capture
  })

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{
          width: '100%', height: 280,
          background: '#fff',
          border: `2px ${hasInk ? 'solid' : 'dashed'} #D1D5DB`,
          borderRadius: 12,
          touchAction: 'none', cursor: 'crosshair',
          display: 'block',
        }}
      />
      {!hasInk && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', color: '#9CA3AF', fontSize: 15,
        }}>
          Signez avec votre doigt
        </div>
      )}
      {hasInk && (
        <button onClick={clear} style={{
          position: 'absolute', top: 12, right: 12,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #E5E7EB',
          cursor: 'pointer', color: '#6B7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <IconX size={18} sw={2.25} />
        </button>
      )}
    </div>
  )
}
