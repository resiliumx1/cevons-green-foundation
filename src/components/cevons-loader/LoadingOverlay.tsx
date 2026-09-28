import { useEffect, useState } from 'react'
import { CevonsLoader } from './CevonsLoader'

/**
 * For work that changes things and takes a moment: saving, importing, sending,
 * switching a view. Covers the screen with the logo loader and says what is
 * happening.
 *
 * - It waits 300ms before showing, so quick saves never flash an overlay.
 * - After 6 seconds it adds "Still working", and after 15 "Taking longer than
 *   usual. Nothing has failed." A loader that says the same thing for fifteen
 *   seconds is what makes people reload in the middle of a save.
 */
export function LoadingOverlay({ open, what = 'Working' }: { open: boolean; what?: string }) {
  const [visible, setVisible] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      setElapsed(0)
      return
    }
    const started = Date.now()
    const show = window.setTimeout(() => setVisible(true), 300)
    const tick = window.setInterval(() => setElapsed(Date.now() - started), 1000)
    return () => {
      window.clearTimeout(show)
      window.clearInterval(tick)
    }
  }, [open])

  if (!open || !visible) return null
  const dark = document.documentElement.matches('.dark, [data-theme="dark"]')
  const note =
    elapsed >= 15_000 ? 'Taking longer than usual. Nothing has failed.' : elapsed >= 6_000 ? 'Still working…' : ''

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={what}
      style={{
        background: dark ? 'rgba(11, 35, 71, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
        padding: 16,
      }}
    >
      <CevonsLoader size={120} decorative />
      <p className="text-base font-medium text-foreground" style={{ margin: 0 }}>
        {what}
      </p>
      <p aria-live="polite" className="text-sm text-muted-foreground" style={{ margin: 0, minHeight: '1.25rem' }}>
        {note}
      </p>
    </div>
  )
}
