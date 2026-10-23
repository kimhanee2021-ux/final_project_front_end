import { hoursText, playtimeMarker } from '../../model/spendingMetrics'

// 미플레이가 더 강한 경고(장미색), 플레이타임 매우 적음은 덜 위협적인 주의(복숭아색)
const MARKERS = {
  unplayed: { label: '미플레이', className: 'bg-rose-bg text-rose-text font-[700]' },
  low: { label: '플레이타임 매우 적음', className: 'bg-peach-bg text-peach-text font-[650]' },
}

// 표의 플레이 시간 칸: 마커가 붙는 게임은 시간 대신 마커만, 나머지는 시간 + 표에서 가장 오래 한 게임 대비 미니 막대.
export default function PlaytimeCell({ hours, maxHours }) {
  const marker = MARKERS[playtimeMarker(hours)]
  if (marker)
    return (
      <span className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] whitespace-nowrap ${marker.className}`}>
        <span className="w-[6px] h-[6px] rounded-full bg-current shrink-0" aria-hidden="true" />
        {marker.label}
      </span>
    )
  if (hours == null) return <span className="text-faint">{hoursText(hours)}</span>
  // 아주 짧아도 막대가 보이도록 최소 4%는 칠한다
  const width = maxHours > 0 ? Math.max(4, (hours / maxHours) * 100) : 0
  return (
    <div className="min-w-[96px] max-w-[140px]">
      <span className="font-[650] tabular-nums">{hoursText(hours)}</span>
      <div className="mt-[6px] h-[4px] rounded-full bg-bg overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
