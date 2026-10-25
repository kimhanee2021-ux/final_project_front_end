import { ColumnChart, CountUp, DonutChart, chartColor, donutSlices, PRIMARY_BUTTON } from '@/shared/ui'
import { topicVisual } from '../model/insightVisual'
import { scrollToPanel } from '@/shared/utils/smoothScroll'

const CARD = 'h-full rounded-[20px] bg-surface p-[22px]'
const TITLE = 'text-[13px] font-[650] text-muted'

// 가운데 숫자가 길면(예: 1,314.5시간) 링 안쪽 지름을 넘지 않도록 글자를 줄여 맞춘다.
const centerSize = text => (text.length > 9 ? 'text-[16px]' : text.length > 6 ? 'text-[20px]' : 'text-[23px]')

// 누르면 그 원본 데이터 패널로 부드럽게 스크롤된다.
// onShowDetail: 이동하기 전에 그 패널의 보기(detailView)를 맞춰 두라고 바깥에 알린다.
function DetailLink({ visual, onShowDetail, className = '' }) {
  return (
    <a
      href={`#${visual.detailId}`}
      onClick={event => {
        if (visual.detailView) onShowDetail?.(visual.detailView)
        scrollToPanel(event, visual.detailId)
      }}
      className={`${PRIMARY_BUTTON} w-full grid place-items-center ${className}`}
    >
      상세 분석 보기 →
    </a>
  )
}

// 도넛: 맨 위에 제목, 그 아래 왼쪽에 도넛(가운데에 전체 숫자), 오른쪽에 장르별 범례(색 점 · 이름 · 비중)와 상세 보기 버튼.
// 위아래로 쌓지 않고 옆으로 나란히 두어 카드가 낮아지므로, 왼쪽 태그 영역 아래에 빈 공간이 남지 않는다.
// 카드가 왼쪽 높이에 맞춰 늘어나도 제목은 위에 붙어 있고, 도넛과 범례는 남은 높이의 가운데에 온다. 아주 좁은 화면에서만 위아래로 쌓는다.
function DonutCard({ visual, onShowDetail }) {
  const slices = donutSlices(visual.items)
  const { caption, value, format } = visual.center
  return (
    <aside className={`${CARD} flex flex-col`} aria-label={visual.title}>
      <p className={TITLE}>{visual.title}</p>
      <div className="flex-1 grid grid-cols-[auto_minmax(0,1fr)] gap-[16px_28px] items-center content-center pt-[14px] max-[480px]:grid-cols-1 max-[480px]:justify-items-center">
        {slices.length > 0 && (
          <DonutChart items={visual.items} size={220}>
            <span className="text-[12px] text-muted">{caption}</span>
            <strong className={`${centerSize(format(value))} font-[750] tracking-[-0.5px] tabular-nums whitespace-nowrap`}>
              <CountUp value={value} format={format} />
            </strong>
          </DonutChart>
        )}
        <div className="grid gap-[22px] min-w-0 max-[480px]:w-full">
        {slices.length ? (
          // 이름과 비중을 같은 줄 바로 옆에 두도록 열 3개짜리 격자를 쓴다 (비중 열은 오른쪽 정렬로 숫자가 가지런하다).
          <ul className="list-none m-0 p-0 grid justify-start grid-cols-[auto_auto_auto] gap-x-[12px] gap-y-[15px] items-center text-[15px]">
            {slices.map((slice, index) => (
              <li key={slice.label} className="col-span-3 grid grid-cols-subgrid items-center min-w-0">
                <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: chartColor(index) }} aria-hidden="true" />
                <span className="truncate max-w-[9em]">{slice.label}</span>
                <strong className="text-right tabular-nums">{slice.percent}%</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-[24px] text-[13px] text-muted">표시할 데이터가 아직 없어요.</p>
        )}
        <DetailLink visual={visual} onShowDetail={onShowDetail} />
        </div>
      </div>
    </aside>
  )
}

// 막대: 제목 → 막대 그래프 → 상세 보기 버튼 (원래 높이가 낮아 위아래로 쌓는다)
function ColumnCard({ visual, onShowDetail }) {
  return (
    <aside className={`${CARD} flex flex-col`} aria-label={visual.title}>
      <p className={TITLE + ' mb-[12px]'}>{visual.title}</p>
      <div className="flex-1 flex items-center">
        <div className="w-full">
          <ColumnChart items={visual.items} height={130} />
        </div>
      </div>
      <DetailLink visual={visual} onShowDetail={onShowDetail} className="mt-[18px]" />
    </aside>
  )
}

// AI 분석 태그 옆에 보여주는 시각 데이터 카드. 고른 태그에 맞는 차트를 보여준다.
export default function TopicVisual({ topic, games, onShowDetail }) {
  const visual = topicVisual(topic, games)
  if (!visual) return null
  return visual.kind === 'donut'
    ? <DonutCard visual={visual} onShowDetail={onShowDetail} />
    : <ColumnCard visual={visual} onShowDetail={onShowDetail} />
}
