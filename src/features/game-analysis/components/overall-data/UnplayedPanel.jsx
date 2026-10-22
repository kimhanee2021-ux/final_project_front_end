import { AnalysisPanel } from '@/shared/ui'
import { netAmount } from '@/features/spending'
import { money } from '@/shared/utils/formatters'
import { br, hl } from '@/shared/utils/headline'
import GameThumb from '../parts/GameThumb'

// 미플레이 패널에 미리 보여줄 게임 수 (정가가 높은 순)
const UNPLAYED_PREVIEW = 4

// 미플레이 게임: 정가가 높은 게임 몇 개만 미리 보여주고, 전체는 아래 보유 게임 표의 "미플레이" 필터로 이어서 본다.
export default function UnplayedPanel({ eyebrow, icon, stats, onShowUnplayed }) {
  const { summary, unplayed } = stats
  const preview = unplayed.slice(0, UNPLAYED_PREVIEW)
  return (
    <AnalysisPanel
      eyebrow={eyebrow}
      icon={icon}
      headline={unplayed.length ? ['아직 켜보지 않은 게임 ', hl(`${unplayed.length}개`), br, hl(money(summary.unplayedAmount)), '어치예요.'] : '산 게임을 모두 한 번 이상 플레이했어요.'}
    >
      {preview.length > 0 && (
        <>
          <ul className="gs-stagger grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1">
            {preview.map(game => (
              <li key={game.id} className="flex items-center gap-[14px] p-[16px] rounded-[16px] bg-bg min-w-0">
                <GameThumb game={game} className="w-[40px]! h-[47px]!" />
                <strong className="text-[15px] truncate">{game.name}</strong>
                <span className="px-[10px] py-[3px] rounded-full bg-surface text-muted text-[12px] shrink-0">{game.genre}</span>
                <strong className="ml-auto text-[14px] shrink-0">{money(netAmount(game))}</strong>
              </li>
            ))}
          </ul>
          <a href="#games" onClick={onShowUnplayed} className="gs-secondary-button mt-[16px] w-full">
            {unplayed.length > preview.length ? `미플레이 게임 ${unplayed.length}개 모두 보기 ↓` : '보유 게임 표에서 미플레이만 보기 ↓'}
          </a>
        </>
      )}
    </AnalysisPanel>
  )
}
