import { use, useDeferredValue, useEffect, useState } from 'react'
import { loadPrecomputedMap } from '../model/precomputedMap.js'
import { getAvailableYears } from '../model/playerData.js'
import { formatMillions } from '../model/formatters.js'
import { GRID } from '../model/mapConfig.js'
import CanvasMosaic from './CanvasMosaic.jsx'
import '../styles/gamer-news.css'

// 랜딩에서는 최근 3년(2023~2025)만 천천히 보여준다. 연도가 바뀔 때마다 블록 수천 개가 움직여서,
// 전체 16년을 빠르게 넘기면 스크롤과 함께 화면이 끊긴다.
const FIRST_YEAR = 2023
const YEARS = getAvailableYears().filter(entry => entry >= FIRST_YEAR)
const LAST_YEAR = YEARS[YEARS.length - 1]
// 한 연도를 보여주는 시간
const STEP_MS = 1800
// 따로 열었을 때(랜딩 밖) 마지막 해(2025)는 다 커진 모습을 잠시 보여 준 뒤 처음으로 돌아간다
const LAST_HOLD_MS = 2600
// 랜딩 페이지 안(iframe)에 있는지. 그때는 랜딩이 재생 · 정지를 정한다.
const EMBEDDED = window.parent !== window

// 랜딩과 주고받는 메시지 (같은 출처만)
// 랜딩 → 지도: { type: 'gamesense:map', action: 'play' | 'pause' }  play는 첫 해(2023)부터 다시 재생
// 지도 → 랜딩: { type: 'gamesense:map-ready' } 메시지를 받을 준비가 됨, { type: 'gamesense:map-done' } 2025까지 재생함
const tellLanding = type => window.parent.postMessage({ type }, window.location.origin)

// 랜딩 페이지에 끼워 넣는 지도: 툴바 · 줌 · 설명 없이 지도와 연도 · 합계만 보여준다.
// 랜딩 안에서는 그 장면에 왔을 때만 2023→2025를 한 번 재생하고(안 보일 때는 멈춰서 스크롤을 무겁게 하지 않는다),
// 따로 열면 끝없이 반복 재생한다. 보는 용도라 국가 선택은 하지 않는다.
export default function GamerMapEmbed() {
  const [requestedYear, setRequestedYear] = useState(YEARS[0])
  const [playing, setPlaying] = useState(!EMBEDDED)
  // 다음 연도 지도를 불러오는 동안 이전 지도를 그대로 보여준다
  const year = useDeferredValue(requestedYear)
  const layout = use(loadPrecomputedMap(year))

  // 넘길 때 끊기지 않도록 보여줄 연도의 지도를 미리 받아 둔다. 한꺼번에 받으면 화면이 멈칫하므로 한 해씩 차례로 받는다.
  useEffect(() => {
    let cancelled = false
    YEARS.reduce((chain, entry) => chain.then(() => (cancelled ? null : loadPrecomputedMap(entry))), Promise.resolve())
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!EMBEDDED) return undefined
    const onMessage = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      if (event.data?.type !== 'gamesense:map') return
      if (event.data.action === 'play') {
        setRequestedYear(YEARS[0])
        setPlaying(true)
      } else if (event.data.action === 'pause') setPlaying(false)
    }
    window.addEventListener('message', onMessage)
    tellLanding('gamesense:map-ready')
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!playing || requestedYear !== year) return undefined
    // 랜딩 안에서는 2025에 닿으면 멈추고 랜딩에 알린다 (랜딩이 다음 장면으로 넘어간다)
    if (EMBEDDED && year === LAST_YEAR) {
      tellLanding('gamesense:map-done')
      return undefined
    }
    const timer = window.setTimeout(
      () => setRequestedYear(YEARS[(YEARS.indexOf(year) + 1) % YEARS.length]),
      year === LAST_YEAR ? LAST_HOLD_MS : STEP_MS
    )
    return () => window.clearTimeout(timer)
  }, [playing, requestedYear, year])

  return (
    <div className="gs-atlas gs-atlas--embed">
      <div className="gs-atlas__embed-head" aria-live="polite">
        <strong>{year}</strong>
        <span>
          19개국 PC 게이머 <b>{formatMillions(layout.summary.players)}</b>백만 명
        </span>
      </div>
      {/* 원본 지도와 같은 틀(class)을 써서 잘라내기 · 이름표 스타일을 그대로 쓰고, 블록은 canvas로 그린다 */}
      <div className="gs-atlas__map">
        <div className="gs-atlas__map-scroll">
          <div className="gs-atlas__map-plane" style={{ aspectRatio: `${GRID.width} / ${GRID.height}` }}>
            <CanvasMosaic layout={layout} year={year} />
            <div className="gs-atlas__labels" aria-hidden="true">
              {layout.labels.map(label => (
                <span
                  key={label.iso2}
                  className="gs-atlas__country-label"
                  style={{ left: `${(label.x / GRID.width) * 100}%`, top: `${(label.y / GRID.height) * 100}%`, '--country-color': label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
