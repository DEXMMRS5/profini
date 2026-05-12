export default function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '12px 16px 28px',
      background: '#fff',
      borderTop: '0.5px solid #E5E7EB',
      display: 'flex', gap: 12, zIndex: 5,
    }}>
      {children}
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: 'rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
