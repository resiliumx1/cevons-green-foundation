import { useEffect, useRef, type CSSProperties } from 'react'
import { CevonsLoader as LoaderEngine, type LoaderTone } from './cevons-loader-engine'

/**
 * The CEVONS logo loader: the logo is the spinner.
 *
 * Plain React (no Next.js). The engine in cevons-loader-engine.ts draws it on a
 * canvas; this file only mounts it, keeps its props current and makes it
 * readable to screen readers.
 *
 * SIZES (from the motion brief): under 40 is the logo alone, 40 to 95 adds the
 * comet, 96 and over adds the tick dial. Buttons 20, cards and sections 56 to 72,
 * a whole page 160.
 *
 * REDUCED MOTION: when the device asks for reduced motion (or `reducedMotion` is
 * passed), the logo stops turning and gently breathes instead, so it still reads
 * as busy. It follows the setting live if it changes.
 *
 * PROGRESS: pass `progress` (0 to 1) only when the work really reports how far it
 * has got. Without it the loader spins, which just says "busy".
 */

/** The three layers of the C logo. Served from /public/cevons-loader/. */
const LAYERS = {
  red: '/cevons-loader/c-ring-red.webp',
  yellow: '/cevons-loader/c-ring-yellow.webp',
  green: '/cevons-loader/c-disc-green.webp',
} as const

export interface CevonsLoaderProps {
  /** Side of the square in px. Default 64. */
  size?: number
  /** The surface it sits on. Omit to follow the theme (`dark` class on a parent or <html>). */
  tone?: LoaderTone
  /** 0 to 1, only where the work reports it. Omit for a spinning loader. */
  progress?: number
  /** What is loading, read to screen readers. Default "Loading". */
  label?: string
  /** True when text beside it already says what is loading, so it is only a picture. */
  decorative?: boolean
  /** Force still (breathing) motion. Omit to follow the device's reduced-motion setting. */
  reducedMotion?: boolean
  className?: string
  style?: CSSProperties
}

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function CevonsLoader({
  size = 64,
  tone,
  progress,
  label = 'Loading',
  decorative = false,
  reducedMotion,
  className,
  style,
}: CevonsLoaderProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<LoaderEngine | null>(null)

  // Create the engine once; later prop changes are handed over below.
  useEffect(() => {
    const node = canvas.current
    if (!node || !node.getContext('2d')) return
    const live = new LoaderEngine(node, {
      size,
      tone: tone ?? toneAround(node),
      progress,
      layers: LAYERS,
    })
    engine.current = live
    return () => {
      live.destroy()
      engine.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const live = engine.current
    if (!live || !canvas.current) return
    live.set({ size, tone: tone ?? toneAround(canvas.current), progress })
  }, [size, tone, progress])

  // Reduced motion: the prop wins; otherwise follow the device setting, live.
  useEffect(() => {
    const live = engine.current
    if (!live) return
    if (typeof reducedMotion === 'boolean') {
      live.reduced = reducedMotion
      return
    }
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(REDUCE_QUERY)
    const apply = () => {
      live.reduced = mq.matches
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [reducedMotion])

  // The theme can flip while it spins; re-read it when <html> changes class.
  useEffect(() => {
    if (tone || typeof MutationObserver === 'undefined') return
    const obs = new MutationObserver(() => {
      if (engine.current && canvas.current) engine.current.set({ tone: toneAround(canvas.current) })
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => obs.disconnect()
  }, [tone])

  const determinate = typeof progress === 'number'
  const box: CSSProperties = {
    position: 'relative',
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    width: size,
    height: size,
    ...style,
  }
  // The canvas has its size from the first render, so it never jumps in a button.
  const art = <canvas ref={canvas} aria-hidden width={size} height={size} style={{ width: size, height: size }} />

  if (decorative) {
    return (
      <span aria-hidden className={className} style={box}>
        {art}
      </span>
    )
  }
  return (
    <span
      className={className}
      style={box}
      role={determinate ? 'progressbar' : 'status'}
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? Math.round(Math.min(1, Math.max(0, progress!)) * 100) : undefined}
    >
      {art}
      {determinate ? null : <span style={srOnly}>{label}</span>}
    </span>
  )
}

/** 'dark' when the page or a parent is in dark mode, so it never glows white on navy. */
function toneAround(node: Element): LoaderTone {
  if (node.closest('.dark, [data-theme="dark"]')) return 'dark'
  return 'light'
}
