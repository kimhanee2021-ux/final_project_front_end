import GSIcon from '../../../components/common/GSIcon'
import { money } from '../../../utils/formatters'
export default function UnplayedSpendingCard({ summary, onExplore }) {
  return (
    <section className="relative overflow-hidden p-[23px] rounded-[15px] border border-border bg-surface max-[1000px]:p-[20px] max-[580px]:min-h-[228px]">
      <div className="flex items-center justify-between text-primary-text">
        <span className="text-[8px] font-bold tracking-[1.9px]">NEXT ADVENTURE</span>
        <GSIcon name="library" size={20} />
      </div>
      <h2 className="text-[15px] mt-[11px] max-[580px]:mt-[14px]">아직 펼치지 않은 이야기</h2>
      <p className="text-[11px] text-muted mt-[6px]">
        구매 후 미플레이 게임 <strong className="text-primary-text">{summary.unplayed.length}개</strong>
      </p>
      <div className="text-[29px] font-[750] tracking-[-1px] mt-[10px] mb-[17px] relative z-[1] max-[1000px]:mt-[18px]">{money(summary.unplayedAmount)}</div>
      <div
        className="absolute right-[24px] top-[81px] flex rotate-[8deg] opacity-80 max-[1200px]:right-[17px] max-[1200px]:opacity-[.45] max-[1000px]:top-[155px] max-[580px]:top-[86px] max-[580px]:right-[35px]"
        aria-hidden="true"
      >
        {summary.unplayed.slice(0, 3).map(game => (
          <span
            key={game.id}
            className={`game-art art-${game.art} !w-[42px] !h-[57px] !ml-[-15px] !border-[3px] !border-surface !text-[10px] max-[580px]:!w-[48px] max-[580px]:!h-[64px]`}
          >
            {game.initials}
          </span>
        ))}
      </div>
      <button
        className="w-full pt-[13px] border-t border-border bg-transparent text-primary-text text-[10px] flex justify-between items-center relative z-[1] max-[1000px]:absolute max-[1000px]:bottom-[20px] max-[1000px]:w-[calc(100%-40px)]"
        onClick={onExplore}
      >
        보유 게임부터 살펴보기
        <GSIcon name="arrow" size={17} />
      </button>
    </section>
  )
}
