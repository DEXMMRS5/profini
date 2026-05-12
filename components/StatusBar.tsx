export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? '#fff' : '#111827'
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      fontFamily: '-apple-system, "SF Pro", system-ui',
      color: c, fontSize: 15, fontWeight: 600, flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="6.5" width="2.8" height="4" rx="0.6" fill={c} />
          <rect x="4.2" y="4" width="2.8" height="6.5" rx="0.6" fill={c} />
          <rect x="8.4" y="2" width="2.8" height="8.5" rx="0.6" fill={c} />
          <rect x="12.6" y="0" width="2.8" height="10.5" rx="0.6" fill={c} />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11">
          <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={c} fill="none" opacity="0.4" />
          <rect x="2" y="2" width="15" height="7" rx="1.5" fill={c} />
          <rect x="19.5" y="3.5" width="1.5" height="4" rx="0.5" fill={c} opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
