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
  const redrawRef = useRef(null)
  useEffect(() => {
    activityRef.current = activity
    redrawRef.current?.()
  }, [activity])

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
    let intensity = activityRef.current === 'LISTENING' ? 1 : 0
    // 마우스가 원에 가까워질수록 파동이 커서 쪽으로 휘고 밝아진다 (누를 수 있다는 신호)
    let near = 0
    let nearTarget = 0
    let pointerX = .5
    let pointerY = .5

    const draw = (delta = 0) => {
      if (!width || !height) return
      const pulse = Math.max(0, Math.min(2, pulseEnergyRef.current || 0))
      pulseEnergyRef.current = pulse * Math.exp(-delta * 3.8)
      const listening = activityRef.current === 'LISTENING'
      const preparing = ['HOLDING', 'STARTING'].includes(activityRef.current)
      const processing = activityRef.current === 'TRANSCRIBING'
      const target = listening ? 1 : preparing ? .18 : processing ? .3 : 0
      intensity = motion.matches ? target : intensity + (target - intensity) * (1 - Math.exp(-delta * 7))
      near += (nearTarget - near) * (1 - Math.exp(-delta * 6))
      // 듣는 중에는 음성 반응만 보이도록 커서 반응을 줄인다
      const hover = near * (1 - intensity)
      time += delta * (1.4 + intensity * 4.6 + hover * 1.2)
      const swell = listening ? 1 + Math.sin(time * 1.7) * .12 : 1
      const amplitude = height * (.12 + intensity * .19 + pulse * .025 + hover * .05) * swell
      const bend = (pointerY - .5) * height * .45 * hover
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.shadowColor = listening ? 'rgba(34, 211, 238, .48)' : hover > .02 ? `rgba(129, 140, 248, ${(.5 * hover).toFixed(3)})` : 'transparent'
      ctx.shadowBlur = listening ? 9 : hover * 8
      for (let i = 0; i < 15; i++) {
        const phase = i * .19
        const spread = (i / 14 - .5) * 2
        ctx.beginPath()
        ctx.strokeStyle = COLORS[i % COLORS.length]
        ctx.lineWidth = (i % 4 === 0 ? 2 : 1.25) + intensity * .45
        for (let x = 0; x <= width + 6; x += 6) {
          const position = Math.min(x, width)
          const norm = position / width
          const envelope = Math.pow(Math.sin(norm * Math.PI), 2.3)
          const wave1 = Math.sin(norm * 14 - time * 1.4 + phase * .7)
          const wave2 = Math.cos(norm * 23 + time * .9 - phase * 1.1) * .55
          const wave3 = Math.sin(norm * 9.5 - time * .6 + i * .35) * .45
          const separation = Math.sin(norm * 18 + time * .8) * spread * amplitude * (.48 + intensity * .2)
          const pull = bend ? bend * Math.exp(-(((norm - pointerX) / .22) ** 2)) : 0
          const y = height * .5 + ((wave1 + wave2 + wave3) * .52 * amplitude + separation + pull) * envelope
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
    const followPointer = event => {
      if (event.pointerType === 'touch' || motion.matches) return
      const rect = parent.getBoundingClientRect()
      const radius = rect.width / 2
      if (!radius) return
      const dx = event.clientX - (rect.left + radius)
      const dy = event.clientY - (rect.top + rect.height / 2)
      // 원 중심 가까이에서 최대, 원 테두리 밖으로 반지름 0.9배만큼 멀어지면 0
      nearTarget = Math.max(0, Math.min(1, 1 - (Math.hypot(dx, dy) - radius * .55) / (radius * 1.35)))
      pointerX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      pointerY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    }
    const leavePage = event => { if (!event.relatedTarget) nearTarget = 0 }
    // Reduced-motion users still see the ON/OFF shape change without continuous animation.
    redrawRef.current = syncAnimation
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting
      syncAnimation()
    })
    resizeObserver.observe(parent)
    intersectionObserver.observe(parent)
    motion.addEventListener('change', syncAnimation)
    document.addEventListener('visibilitychange', syncAnimation)
    window.addEventListener('pointermove', followPointer, { passive: true })
    document.addEventListener('pointerout', leavePage)
    resize()
    syncAnimation()
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motion.removeEventListener('change', syncAnimation)
      document.removeEventListener('visibilitychange', syncAnimation)
      window.removeEventListener('pointermove', followPointer)
      document.removeEventListener('pointerout', leavePage)
      redrawRef.current = null
    }
  }, [pulseEnergyRef])

  return <canvas ref={canvasRef} className="news-neon-canvas" data-activity={activity} aria-hidden="true" />
}
