import { use, useDeferredValue, useEffect, useState } from 'react'
import { loadPrecomputedMap } from '../js/precomputedMap.js'
import { getAvailableYears } from '../js/playerData.js'
import { formatMillions } from '../js/formatters.js'
import PixelWorldMap from './PixelWorldMap.jsx'
import TimeExplorer from './TimeExplorer.jsx'
import TabIcon from './TabIcon.jsx'
import '../styles/gamer-news.css'

const YEARS = getAvailableYears()

// 연도와 선택 국가는 앱의 URL이 관리한다. 이 컴포넌트는 지도와 재생 상태만 맡는다.
export default function GamerMap({ year: requestedYear, onYearChange, selectedCountry, onSelectCountry }) {
  const [playing, setPlaying] = useState(false)
  const year = useDeferredValue(requestedYear)
  const layout = use(loadPrecomputedMap(year))
  const summary = layout.summary

  // 최신 controlled 연도에서 다음 연도로 진행하며, 변경·일시정지·언마운트 시 타이머를 정리한다.
  useEffect(() => {
    if (!playing || requestedYear !== year) return undefined
    const timer = window.setTimeout(() => {
      onYearChange(YEARS[(YEARS.indexOf(year) + 1) % YEARS.length])
    }, 2800)
    return () => window.clearTimeout(timer)
  }, [playing, year, requestedYear, onYearChange])

  function changeYear(nextYear) {
    setPlaying(false)
    onYearChange(nextYear)
  }

  return (
    <div className="gs-atlas" aria-busy={requestedYear !== year}>
      <section className="gs-atlas__map-card" aria-label="PC 게이머 픽셀 세계지도">
        <div className="gs-atlas__map-toolbar">
          <div className="gs-atlas__platforms">
            <span className="gs-atlas__platform-label"><TabIcon name="monitor" /> PC 게임</span>
            <span className="gs-atlas__source-period">2010–2025 제공자료</span>
          </div>
          <div className="gs-atlas__map-total" aria-live="polite" aria-atomic="true">
            <span>19개국 제공자료 합계 · 캐나다 제외</span>
            <strong>{formatMillions(summary.players)}<small>백만 명</small></strong>
          </div>
        </div>
        <p className="gs-atlas__source-note">
          <TabIcon name="info" size={16} />
          <span>사용자가 제공한 연도별 자료입니다. 원출처를 별도로 검증하지 않았습니다.</span>
        </p>
        <PixelWorldMap
          layout={layout}
          year={year}
          selectedCountry={selectedCountry}
          onSelectCountry={onSelectCountry}
        />
        <TimeExplorer year={year} onYearChange={changeYear} playing={playing} onPlayingChange={setPlaying} />
      </section>
      <details className="gs-atlas__method">
        <summary>
          <span><TabIcon name="info" size={17} /> 이 지도를 읽는 방법</span>
          <span>단위와 자료 안내 <TabIcon name="chevron" size={15} /></span>
        </summary>
        <div className="gs-atlas__method-body">
          <div>
            <h3>같은 블록, 국가별로 다른 인원 단위</h3>
            <p>
              모든 사각형은 같은 크기입니다. 한 블록은 중국·인도 75만 명, 나머지 17개국은 25만 명입니다.
              2010~2025년 전체에 같은 단위를 적용하고 마지막 블록은 남은 인원만큼 채웁니다.
              국가별 단위가 달라 면적을 직접 비교할 수 없습니다.
            </p>
          </div>
          <div>
            <h3>회청색 블록은 주변 지형</h3>
            <p>
              회청색 블록은 이용자 통계가 아닙니다. 각 영역의 2025년을 기준으로 집계 국가의
              PC 이용자 증감률에 따라 주변 지형이 함께 변하며, 이 블록은 합계에 포함하지 않습니다.
              원본 배치에서 호주는 남아시아 영역과 함께 계산합니다.
            </p>
          </div>
          <div>
            <h3>제공 자료의 범위</h3>
            <p>
              원본 자료는 19개국의 PC 월간 활성 이용자(MAU)로 표기되어 있습니다.
              제공된 값과 출처 목록은 보존했으나 원출처의 조사 방식과 국가별 비교 가능성을
              별도로 검증한 자료는 아닙니다. 화면의 합계는 이 제공값을 더한 수치입니다.
            </p>
          </div>
          <div>
            <h3>연도별 변화와 지도 형태</h3>
            <p>
              2010~2025년 16개 연도의 제공값을 그대로 사용하며 없는 수치는 보간하지 않습니다.
              연도를 선택하면 국가 모양과 주변 지형이 함께 변합니다. 화면 배율은 유지되며,
              윤곽과 위치는 단순화한 표현으로 실제 국경을 보존하지 않습니다.
            </p>
          </div>
        </div>
      </details>
    </div>
  )
}
