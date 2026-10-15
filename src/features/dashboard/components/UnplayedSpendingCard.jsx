import GSIcon from '../../../components/common/GSIcon'
import { money } from '../../../utils/formatters'
export default function UnplayedSpendingCard({ summary, onExplore }) {
  return (
    <section className="relative flex flex-col overflow-hidden p-[23px] rounded-[15px] border border-border bg-surface max-[1000px]:p-[20px]">
      <div className="flex items-center justify-between text-primary-text">
        <span className="text-[8px] font-bold tracking-[1.9px]">NEXT ADVENTURE</span>
        <GSIcon name="library" size={20} />
      </div>
      <h2 className="text-[15px] mt-[11px] max-[580px]:mt-[14px]">아직 펼치지 않은 이야기</h2>
      <p className="text-[11px] text-muted mt-[6px]">
        구매 후 미플레이 게임 <strong className="text-primary-text">{summary.unplayed.length}개</strong>
      </p>
      {/* 금액과 표지를 같은 줄에 두고, 자리가 모자라면 표지가 아래로 내려가게 한다 (이전엔 표지·버튼을 absolute로 띄워서 좁아지면 금액과 겹쳤다) */}
      <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px] mt-[10px] mb-[17px]">
        <div className="text-[29px] font-[750] tracking-[-1px] whitespace-nowrap">{money(summary.unplayedAmount)}</div>
        <div className="flex rotate-[8deg] opacity-80 pl-[15px] max-[1200px]:opacity-[.45]" aria-hidden="true">
          {summary.unplayed.slice(0, 3).map(game => (
            <span
              key={game.id}
              className={`game-art art-${game.art} ${game.thumbnailUrl ? 'has-image' : ''} w-[42px]! h-[57px]! ml-[-15px]! border-[3px]! border-surface! text-[10px]! max-[580px]:w-[48px]! max-[580px]:h-[64px]!`}
            >
              {game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" loading="lazy" /> : game.initials}
            </span>
          ))}
        </div>
      </div>
      <button
        className="w-full mt-auto pt-[13px] border-t border-border bg-transparent text-primary-text text-[10px] flex justify-between items-center"
        onClick={onExplore}
      >
        보유 게임부터 살펴보기
        <GSIcon name="arrow" size={17} />
      </button>
    </section>
  )
}
