import { memo, useRef } from 'react'
import { GRID, NEUTRAL_COLOR } from '../js/mapConfig.js'

// 원본 블록 ID와 transform을 유지해 연도 사이의 이동·등장 모션을 복원한다.
function MosaicSurface({ layout, year, scrollRef }) {
  const dragRef = useRef(null)
  const side = GRID.step - GRID.gap
  return (
    <svg className="gs-atlas__pixel-world" viewBox={`0 0 ${GRID.width} ${GRID.height}`}
      role="img" aria-label={`${year}년 PC 모자이크 세계지도. 유색 블록은 19개국의 이용자 제공값, 회청색 블록은 통계가 아닌 주변 지형입니다. 원출처는 별도로 검증하지 않았습니다.`}
      data-year={year} data-platform="PC" data-block-size={GRID.step - GRID.gap}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return
        dragRef.current = { x: event.clientX, scroll: scrollRef.current.scrollLeft }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={event => {
        if (dragRef.current) scrollRef.current.scrollLeft = dragRef.current.scroll - event.clientX + dragRef.current.x
      }}
      onPointerUp={event => {
        dragRef.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { dragRef.current = null }}
      onLostPointerCapture={() => { dragRef.current = null }}>
            <g fill={NEUTRAL_COLOR} data-layer="context-mosaic">
              {layout.neutralCells.map((cell) => (
                <rect key={cell.id} className="gs-atlas__mosaic-cell" data-region={cell.region}
                  style={{ transform: `translate(${cell.x + GRID.gap / 2}px, ${cell.y + GRID.gap / 2}px)` }}
                  width={side} height={side} />
              ))}
            </g>
            <g data-layer="player-mosaic">
              {layout.dataCells.map((cell) => (
                <g key={cell.id} data-country={cell.iso2} className="gs-atlas__mosaic-cell"
                  style={{ transform: `translate(${cell.x + GRID.gap / 2}px, ${cell.y + GRID.gap / 2}px)` }}>
                  {cell.fill < 1 && <rect width={side} height={side} fill="none" stroke={cell.color} strokeWidth="0.8" />}
                  <rect width={side * cell.fill} height={side} fill={cell.color} />
                </g>
              ))}
            </g>
      <g className="gs-atlas__label-lines">
        {layout.labels.map(label => (
          <line key={label.iso2} x1={label.center.x} y1={label.center.y} x2={label.x} y2={label.y + 10} stroke={label.color} />
        ))}
      </g>
    </svg>
  )
}

// 국가 호버·선택·확대 시 블록 요소를 다시 평가하지 않는다.
export default memo(MosaicSurface)
