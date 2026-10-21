import { ColumnChart, CountUp, DonutChart, chartColor, donutSlices } from '@/shared/ui'
import { PRIMARY_BUTTON } from '@/features/spending'
import { topicVisual } from '../model/insightVisual'

// 도넛: 왼쪽에 도넛(가운데에 전체 숫자), 오른쪽에 장르별 범례를 한 줄씩(색 점 · 이름 · 비중)
function DonutBlock({ visual }) {
  const slices = donutSlices(visual.items)
  if (!slices.length) return <p className="py-[40px] text-center text-[13px] text-muted">표시할 데이터가 아직 없어요.</p>
  const { caption, value, format } = visual.center
  return (
    <div className="flex-1 flex items-center gap-[24px] max-[420px]:flex-col max-[420px]:items-stretch">
      <DonutChart items={visual.items} size={170}>
        <span className="text-[12px] text-muted">{caption}</span>
        <strong className="text-[22px] font-[750] tracking-[-0.5px] tabular-nums">
          <CountUp value={value} format={format} />
        </strong>
      </DonutChart>
      <ul className="list-none m-0 p-0 flex-1 min-w-0 grid gap-[12px] text-[14px]">
        {slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center gap-[8px] min-w-0">
            <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: chartColor(index) }} aria-hidden="true" />
            <span className="truncate">{slice.label}</span>
            <strong className="ml-auto tabular-nums">{slice.percent}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 상세 분석 버튼: 원본 데이터 패널로 부드럽게 스크롤한다 (모션 줄이기 설정이면 바로 이동).
// 주소(해시)는 바꾸지 않는다. 바꾸면 레이아웃이 해시 변경을 보고 바로 순간이동시키기 때문이다.
function scrollToPanel(event, id) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

// AI 분석 태그 옆에 보여주는 시각 데이터 카드. 고른 태그에 맞는 차트를 보여주고, 누르면 그 원본 데이터 패널로 부드럽게 스크롤된다.
export default function TopicVisual({ topic, games }) {
  const visual = topicVisual(topic, games)
  if (!visual) return null
  return (
    <aside className="h-full flex flex-col rounded-[20px] bg-surface p-[22px]" aria-label={visual.title}>
      <p className="mb-[12px] text-[13px] font-[650] text-muted">{visual.title}</p>
      {visual.kind === 'donut' ? (
        <DonutBlock visual={visual} />
      ) : (
        <div className="flex-1 flex items-center">
          <div className="w-full">
            <ColumnChart items={visual.items} height={130} />
          </div>
        </div>
      )}
      <a
        href={`#${visual.detailId}`}
        onClick={event => scrollToPanel(event, visual.detailId)}
        className={PRIMARY_BUTTON + ' mt-[18px] w-full grid place-items-center'}
      >
        상세 분석 보기 →
      </a>
    </aside>
  )
}
