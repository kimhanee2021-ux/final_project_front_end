import { AnalysisPanel } from '@/shared/ui'
import GameThumb from './GameThumb'
import { hoursText } from '@/features/spending'

// 목록형 데이터 → 한 줄에 게임 두 개씩: 썸네일 + 게임명/장르 + 플레이시간/시간당 단가
export default function GameListPanel({ rows, eyebrow, onSelect }) {
  return (
    <AnalysisPanel eyebrow={eyebrow} headline="보유 게임별 상세 수치예요.">
      <ul className="gs-stagger grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1">
        {rows.map(({ game, hourly }) => (
          <li key={game.id} className="min-w-0">
            <button
              type="button"
              className="w-full h-full flex items-center gap-[14px] p-[16px] rounded-[16px] bg-bg text-left hover:opacity-80"
              onClick={() => onSelect(game)}
            >
              <GameThumb game={game} className="w-[40px]! h-[47px]!" />
              <div className="min-w-0 flex-1">
                <strong className="block text-[15px] truncate">{game.name}</strong>
                <small className="text-[12px] text-muted">{game.genre}</small>
              </div>
              <div className="text-right shrink-0">
                <strong className="block text-[14px]">{hoursText(game.hours)}</strong>
                <small className="text-[12px] text-muted">{hourly}/시간</small>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </AnalysisPanel>
  )
}
