import { useId } from 'react'
import { getAvailableYears } from '../js/playerData.js'
import TabIcon from './TabIcon.jsx'

const YEARS = getAvailableYears()

// 원본에 등록된 연도만 선택한다. 수동 변경 시 재생 중지는 부모 지도 컴포넌트가 처리한다.
export default function TimeExplorer({ year, onYearChange, playing, onPlayingChange }) {
  const inputId = useId()
  const index = YEARS.indexOf(year)
  const progress = YEARS.length > 1 ? (index / (YEARS.length - 1)) * 100 : 0

  return (
    <section className="gs-atlas__timeline" aria-label="지도 연도 선택">
      <div className="gs-atlas__timeline-title">
        <span className="gs-atlas__eyebrow">연도별 변화</span>
        <div><strong>{year}<small>년</small></strong><span>연도별 제공값</span></div>
      </div>
      <button
        type="button"
        className={`gs-atlas__play${playing ? ' is-playing' : ''}`}
        aria-label={playing ? '연도 자동 재생 일시정지' : '연도 자동 재생'}
        aria-pressed={playing}
        onClick={() => onPlayingChange(!playing)}
        disabled={YEARS.length < 2}
      >
        <TabIcon name={playing ? 'pause' : 'play'} size={20} />
      </button>
      <div className="gs-atlas__year-control">
        <label className="gs-atlas__sr-only" htmlFor={inputId}>지도 연도</label>
        <input
          id={inputId}
          type="range"
          min="0"
          max={YEARS.length - 1}
          step="1"
          value={index}
          aria-valuetext={`${year}년, 제공자료 기준`}
          style={{ '--timeline-progress': `${progress}%` }}
          onChange={(event) => onYearChange(YEARS[Number(event.target.value)])}
        />
        <div className="gs-atlas__year-labels" role="group" aria-label="연도 바로 선택">
          {YEARS.map((entry) => (
            <button key={entry} type="button" aria-pressed={year === entry} onClick={() => onYearChange(entry)}>{entry}</button>
          ))}
        </div>
      </div>
    </section>
  )
}
