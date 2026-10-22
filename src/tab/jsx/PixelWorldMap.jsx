import { useRef, useState } from 'react'
import { GRID } from '../js/mapConfig.js'
import { formatCells, formatPeople } from '../js/formatters.js'
import TabIcon from './TabIcon.jsx'
import MosaicSurface from './MosaicSurface.jsx'

export default function PixelWorldMap({ layout, year, selectedCountry, onSelectCountry }) {
  const [zoom, setZoom] = useState(1)
  const [hoveredIso, setHoveredIso] = useState(null)
  const scrollRef = useRef(null)
  const active = layout.countries.find((country) => country.iso2 === (hoveredIso || selectedCountry))
  const describeCountry = (country) => `${country.name} · ${year}년 PC 이용자 제공값 ${formatPeople(country.players)} · 한 블록 ${country.unit / 10_000}만 명 · ${formatCells(country.quantized.equivalent)}블록 상당 · 원출처 미검증`

  return (
    <div className="gs-atlas__map">
      <div className="gs-atlas__map-kicker">
        <span><i /> PC 게이머 · {year}</span>
        <span>19개국 모자이크 지도</span>
      </div>
      <div className="gs-atlas__map-scroll" ref={scrollRef} aria-label="모자이크 세계지도. 국가 이름을 선택하여 수치를 확인하세요.">
        <div className="gs-atlas__map-plane" style={{ width: `${zoom * 100}%`, minWidth: `${880 * zoom}px`, aspectRatio: `${GRID.width} / ${GRID.height}` }}>
          <MosaicSurface layout={layout} year={year} scrollRef={scrollRef} />
          <div className="gs-atlas__labels" role="group" aria-label="지도 국가 정보">
            {layout.labels.map((label) => {
              const country = layout.countries.find((item) => item.iso2 === label.iso2)
              return (
                <button key={label.iso2} type="button" className="gs-atlas__country-label" data-country-label={label.iso2}
                  style={{ left: `${label.x / GRID.width * 100}%`, top: `${label.y / GRID.height * 100}%`, '--country-color': label.color }}
                  aria-label={`${label.name} 선택, PC 이용자 제공값 ${formatPeople(country.players)}`} aria-pressed={selectedCountry === label.iso2} title={describeCountry(country)}
                  onClick={() => onSelectCountry(label.iso2)}
                  onMouseEnter={() => setHoveredIso(label.iso2)} onMouseLeave={() => setHoveredIso(null)}
                  onFocus={() => setHoveredIso(label.iso2)} onBlur={() => setHoveredIso(null)}>
                  {label.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="gs-atlas__map-footer">
        <div className="gs-atlas__legends">
          <span><i className="gs-atlas__legend-cell" /> 19개국 제공값 · 국가별 단위 고정</span>
          <span><i className="gs-atlas__legend-cell is-neutral" /> 주변 지형 · 영역 증감률 반영 · 통계 아님</span>
        </div>
        <div className="gs-atlas__zoom" role="group" aria-label="지도 확대 축소">
          <button type="button" aria-label="지도 축소" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} disabled={zoom === 1}><TabIcon name="minus" size={15} /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="지도 확대" onClick={() => setZoom((value) => Math.min(2, value + 0.25))} disabled={zoom === 2}><TabIcon name="plus" size={15} /></button>
          <button type="button" aria-label="지도 배율 초기화" onClick={() => { setZoom(1); scrollRef.current.scrollLeft = 0 }}><TabIcon name="reset" size={14} /></button>
        </div>
      </div>
      <p className="gs-atlas__map-readout" aria-live="polite">
        {active ? describeCountry(active) : '모든 블록의 크기는 같습니다. 국가별 인원 단위가 다르므로 면적을 직접 비교하지 마세요. 국가 이름을 선택하면 수치와 단위를 볼 수 있습니다.'}
      </p>
    </div>
  )
}
