import { GSIcon } from '@/shared/ui'
import { MEDALS } from '../../model/medals'

const SIZES = {
  sm: { box: 'left-[6px] top-[6px]', badge: 'h-[22px] px-[8px] text-[11px]', icon: 11 },
  md: { box: 'left-[12px] top-[12px]', badge: 'h-[28px] px-[11px] text-[13px]', icon: 13 },
  lg: { box: 'left-[12px] top-[12px]', badge: 'h-[34px] px-[14px] text-[15px]', icon: 16 },
}

// 커버 왼쪽 위 순위 배지. medal이면 1~3위를 금 · 은 · 동으로 칠한다. size는 sm(작은 썸네일) · md · lg(1위 큰 카드).
// position을 주면 기본 자리(왼쪽 위) 대신 그 자리에 둔다.
export default function RankBadge({ rank, isNew, medal = false, size = 'md', position }) {
  const style = medal ? MEDALS[rank] : null
  const { box, badge, icon } = SIZES[size]
  return (
    <span className={`absolute flex items-center gap-[6px] ${position ?? box}`}>
      <span
        className={`inline-flex items-center gap-[5px] rounded-full font-[800] tabular-nums shadow-[0_2px_10px_#0006] ${badge} ${
          style ? style.badge : 'bg-[#14131ce6] text-white'
        }`}
      >
        {style && <GSIcon name={style.icon} size={icon} />}
        {rank}위
      </span>
      {isNew && (
        <span className="inline-flex items-center h-[24px] px-[9px] rounded-[6px] bg-primary text-on-primary text-[11px] font-[800]">신작</span>
      )}
    </span>
  )
}
