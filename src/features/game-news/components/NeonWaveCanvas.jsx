import { useEffect, useRef } from 'react'

const COLORS = [
  'rgba(0, 242, 254, .72)', 'rgba(56, 189, 248, .65)',
  'rgba(59, 130, 246, .68)', 'rgba(99, 102, 241, .62)',
  'rgba(139, 92, 246, .68)', 'rgba(168, 85, 247, .65)',
  'rgba(217, 70, 239, .58)', 'rgba(236, 72, 153, .50)',
]

export default function NeonWaveCanvas({ pulseEnergyRef, activity = 'IDLE' }) {
  const canvasRef = useRef(null)
  const activityRef = useRef(activity)
  useEffect(() => { activityRef.current = activity }, [activity])

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!parent || !ctx) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let time = 0
    let lastTime = 0
    let frame = null
    let inView = true

    const draw = (delta = 0) => {
      if (!width || !height) return
      const pulse = Math.max(0, Math.min(2, pulseEnergyRef.current || 0))
      pulseEnergyRef.current = pulse * Math.exp(-delta * 3.8)
      const speaking = activityRef.current === 'MODEL_SPEAKING'
      time += delta * (speaking ? 4.5 : 1.5)
      const amplitude = height * ((speaking ? .20 : .13) + pulse * .04)
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 15; i++) {
        const phase = i * .19
        const spread = (i / 14 - .5) * 2
        ctx.beginPath()
        ctx.strokeStyle = COLORS[i % COLORS.length]
        ctx.lineWidth = i % 4 === 0 ? 2 : 1.25
        for (let x = 0; x <= width + 6; x += 6) {
          const position = Math.min(x, width)
          const norm = position / width
          const envelope = Math.pow(Math.sin(norm * Math.PI), 2.3)
          const wave1 = Math.sin(norm * 14 - time * 1.4 + phase * .7)
          const wave2 = Math.cos(norm * 23 + time * .9 - phase * 1.1) * .55
          const wave3 = Math.sin(norm * 9.5 - time * .6 + i * .35) * .45
          const separation = Math.sin(norm * 18 + time * .8) * spread * amplitude * .48
          const y = height * .5 + ((wave1 + wave2 + wave3) * .52 * amplitude + separation) * envelope
          if (x === 0) ctx.moveTo(position, y)
          else ctx.lineTo(position, y)
        }
        ctx.stroke()
      }
      ctx.restore()
    }

    const render = now => {
      const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0
      lastTime = now
      draw(delta)
      frame = requestAnimationFrame(render)
    }
    const syncAnimation = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      lastTime = 0
      draw()
      if (!motion.matches && !document.hidden && inView) frame = requestAnimationFrame(render)
    }
    const resize = () => {
      const rect = parent.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }
    const showStaticPulse = () => {
      if (motion.matches) draw()
    }
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting
      syncAnimation()
    })
    resizeObserver.observe(parent)
    intersectionObserver.observe(parent)
    motion.addEventListener('change', syncAnimation)
    document.addEventListener('visibilitychange', syncAnimation)
    parent.addEventListener('news-wave-pulse', showStaticPulse)
    resize()
    syncAnimation()
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motion.removeEventListener('change', syncAnimation)
      document.removeEventListener('visibilitychange', syncAnimation)
      parent.removeEventListener('news-wave-pulse', showStaticPulse)
    }
  }, [pulseEnergyRef])

  return <canvas ref={canvasRef} className="news-neon-canvas" data-activity={activity} aria-hidden="true" />
}
