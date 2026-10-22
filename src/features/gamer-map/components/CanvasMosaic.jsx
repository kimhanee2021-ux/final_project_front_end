import { useEffect, useRef } from 'react'
import { GRID, NEUTRAL_COLOR } from '../model/mapConfig.js'

// 연도가 바뀔 때 블록이 이전 자리에서 새 자리로 움직이는 시간 (원본 SVG 지도의 550ms와 비슷하게)
const MOVE_MS = 650
const SIDE = GRID.step - GRID.gap
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

// 블록 id → 자리. 회색 지형과 국가 블록은 id가 겹칠 수 있어 앞에 구분자를 붙인다.
function positionsOf(layout) {
  const map = new Map()
  layout.neutralCells.forEach(cell => map.set(`n:${cell.id}`, cell))
  layout.dataCells.forEach(cell => map.set(`p:${cell.id}`, cell))
  return map
}

// 블록 하나의 지금 자리: 이전 해에 있던 블록은 이전 자리 → 새 자리로 옮기고, 새로 생긴 블록은 제자리에서 나타난다.
function placeOf(cell, previous, progress) {
  if (!previous) return cell
  return { x: previous.x + (cell.x - previous.x) * progress, y: previous.y + (cell.y - previous.y) * progress }
}

function draw(context, layout, from, progress, scale) {
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.clearRect(0, 0, GRID.width, GRID.height)
  const offset = GRID.gap / 2

  // 회색 지형: 한 색이라 경로 하나로 모아 한 번에 칠한다. 새 블록은 투명도로 나타나게 따로 칠한다.
  const appearing = []
  context.fillStyle = NEUTRAL_COLOR
  context.beginPath()
  layout.neutralCells.forEach(cell => {
    const previous = from?.get(`n:${cell.id}`)
    if (from && !previous) return appearing.push({ cell, color: NEUTRAL_COLOR, fill: 1 })
    const { x, y } = placeOf(cell, previous, progress)
    context.rect(x + offset, y + offset, SIDE, SIDE)
  })
  context.fill()

  // 국가 블록: 색마다 경로를 모아 칠한다. 일부만 채운 블록(fill < 1)은 테두리를 그린다.
  const byColor = new Map()
  layout.dataCells.forEach(cell => {
    const previous = from?.get(`p:${cell.id}`)
    if (from && !previous) return appearing.push({ cell, color: cell.color, fill: cell.fill })
    const { x, y } = placeOf(cell, previous, progress)
    if (!byColor.has(cell.color)) byColor.set(cell.color, [])
    byColor.get(cell.color).push({ x, y, fill: cell.fill })
  })
  byColor.forEach((cells, color) => {
    context.fillStyle = color
    context.beginPath()
    cells.forEach(({ x, y, fill }) => context.rect(x + offset, y + offset, SIDE * fill, SIDE))
    context.fill()
    context.strokeStyle = color
    context.lineWidth = 0.8
    cells.filter(cell => cell.fill < 1).forEach(({ x, y }) => context.strokeRect(x + offset, y + offset, SIDE, SIDE))
  })

  // 새로 생긴 블록은 움직임에 맞춰 서서히 나타난다
  context.globalAlpha = progress
  appearing.forEach(({ cell, color, fill }) => {
    context.fillStyle = color
    context.fillRect(cell.x + offset, cell.y + offset, SIDE * fill, SIDE)
  })
  context.globalAlpha = 1

  // 국가 이름표로 이어지는 선
  context.lineWidth = 1
  context.globalAlpha = 0.6
  layout.labels.forEach(label => {
    context.strokeStyle = label.color
    context.beginPath()
    context.moveTo(label.center.x, label.center.y)
    context.lineTo(label.x, label.y + 10)
    context.stroke()
  })
  context.globalAlpha = 1
}

// 모자이크 지도를 canvas 한 장에 그린다. 원본 SVG 지도는 블록(약 6,600개)마다 요소를 만들어 움직여서,
// 랜딩의 3D 영상과 함께 돌면 화면이 끊긴다. canvas는 프레임마다 다시 칠해도 가볍다.
export default function CanvasMosaic({ layout, year }) {
  const canvasRef = useRef(null)
  const shownRef = useRef(null) // 마지막으로 다 그린 연도의 블록 자리
  const scaleRef = useRef(1)
  const layoutRef = useRef(layout) // 크기가 바뀔 때 다시 그릴 지금 지도

  // 크기가 바뀌면 화면 해상도에 맞춰 canvas를 다시 잡고, 지금 지도를 다시 그린다.
  // 연도가 바뀔 때는 다시 걸지 않는다 (그러면 새 지도가 한 프레임 먼저 보였다가 움직이기 시작한다).
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * ratio)
      canvas.height = Math.round(canvas.clientHeight * ratio)
      scaleRef.current = canvas.width / GRID.width
      draw(canvas.getContext('2d'), layoutRef.current, null, 1, scaleRef.current)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // 연도가 바뀌면 이전 자리에서 새 자리로 블록을 옮긴다
  useEffect(() => {
    layoutRef.current = layout
    const context = canvasRef.current.getContext('2d')
    const from = shownRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const started = performance.now()
    const step = now => {
      const progress = from && !reduced ? Math.min(1, (now - started) / MOVE_MS) : 1
      draw(context, layout, progress < 1 ? from : null, easeInOut(progress), scaleRef.current)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frame)
      // 다음 연도는 이번 연도의 최종 자리에서 출발한다
      shownRef.current = positionsOf(layout)
    }
  }, [layout])

  return (
    <canvas
      ref={canvasRef}
      className="gs-atlas__pixel-world"
      role="img"
      aria-label={`${year}년 PC 모자이크 세계지도. 유색 블록은 19개국의 이용자 제공값, 회청색 블록은 통계가 아닌 주변 지형입니다.`}
    />
  )
}
