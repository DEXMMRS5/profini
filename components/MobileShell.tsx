'use client'
export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pf-stage">
      <div className="pf-shell">
        {children}
      </div>
    </div>
  )
}
