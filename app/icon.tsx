import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, #15355B 0%, #0A2240 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
        <path d="M8 4 L26 4 L34 12 L34 22 L26 30 L16 30 L16 36 L8 36 Z"
          stroke="white" strokeWidth="3.2" strokeLinejoin="round" fill="none" />
        <path d="M12 20 L18 26 L30 14 L26 12 L18 20 L14 16 Z" fill="#2BA464" />
      </svg>
    </div>,
    { ...size }
  )
}
