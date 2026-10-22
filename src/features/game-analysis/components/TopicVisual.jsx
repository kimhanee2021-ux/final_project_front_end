import { ColumnChart, CountUp, DonutChart, chartColor, donutSlices, PRIMARY_BUTTON } from '@/shared/ui'
import { topicVisual } from '../model/insightVisual'
import { scrollToPanel } from '@/shared/utils/smoothScroll'

// 도넛: 왼쪽에 도넛(가운데에 전체 숫자), 오른쪽에 장르별 범례를 한 줄씩(색 점 · 이름 · 비중)
// 가운데 숫자가 길면(예: 1,314.5시간) 링 안쪽 지름을 넘지 않도록 글자를 줄여 맞춘다.
const centerSize = text => (text.length > 9 ? 'text-[16px]' : text.length > 6 ? 'text-[19px]' : 'text-[22px]')

function DonutBlock({ visual }) {
  const slices = donutSlices(visual.items)
  if (!slices.length) return <p className="py-[40px] text-center text-[13px] text-muted">표시할 데이터가 아직 없어요.</p>
  const { caption, value, format } = visual.center
  return (
    <div className="flex-1 flex flex-wrap items-center justify-center gap-[16px_18px]">
      <DonutChart items={visual.items} size={210}>
        <span className="text-[12px] text-muted">{caption}</span>
        <strong className={`${centerSize(format(value))} font-[750] tracking-[-0.5px] tabular-nums whitespace-nowrap`}>
          <CountUp value={value} format={format} />
        </strong>
      </DonutChart>
      {/* 이름과 비중을 같은 줄 바로 옆에 두도록 열 3개짜리 격자를 쓴다 (비중 열은 오른쪽 정렬로 숫자가 가지런하다). */}
      <ul className="list-none m-0 p-0 min-w-[150px] grid justify-start grid-cols-[auto_auto_auto] gap-x-[10px] gap-y-[12px] items-center text-[14px]">
        {slices.map((slice, index) => (
          <li key={slice.label} className="col-span-3 grid grid-cols-subgrid items-center min-w-0">
            <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: chartColor(index) }} aria-hidden="true" />
            <span className="truncate max-w-[9em]">{slice.label}</span>
            <strong className="text-right tabular-nums">{slice.percent}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

// AI 분석 태그 옆에 보여주는 시각 데이터 카드. 고른 태그에 맞는 차트를 보여주고, 누르면 그 원본 데이터 패널로 부드럽게 스크롤된다.
// onShowDetail: 이동하기 전에 그 패널의 보기(detailView)를 맞춰 두라고 바깥에 알린다.
export default function TopicVisual({ topic, games, onShowDetail }) {
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
        onClick={event => {
          if (visual.detailView) onShowDetail?.(visual.detailView)
          scrollToPanel(event, visual.detailId)
        }}
        className={PRIMARY_BUTTON + ' mt-[18px] w-full grid place-items-center'}
      >
        상세 분석 보기 →
      </a>
    </aside>
  )
}
