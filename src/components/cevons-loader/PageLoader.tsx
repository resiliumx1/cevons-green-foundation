import { CevonsLoader } from './CevonsLoader'

/**
 * A whole page or panel loading: the logo loader at 160, centred, with one line
 * under it saying what is on its way ("Loading leads", "Loading the dashboard").
 * The line is the announcement, so the loader beside it is only a picture.
 */
export function PageLoader({ label = 'Loading', minHeight = '60vh' }: { label?: string; minHeight?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{
        display: 'flex',
        minHeight,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <CevonsLoader size={160} decorative />
      <p className="text-sm text-muted-foreground" style={{ margin: 0 }}>
        {label}
      </p>
    </div>
  )
}
