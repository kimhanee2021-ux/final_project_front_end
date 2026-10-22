import { GameImage } from '@/shared/ui'

// 추천 게임 한 칸: 커버(누르면 스팀 상점, 왼쪽 위에 순위·오른쪽 위에 신작 표시) → 이름 → 장르.
export default function RecommendationCard({ card }) {
  return (
    <article className="flex flex-col gap-[12px] min-w-0">
      <a
        href={card.storeUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative block w-full overflow-hidden rounded-[16px] bg-bg"
        aria-label={`${card.name} 스팀 상점 보기`}
      >
        <GameImage
          className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
          src={card.image}
          iconSize={34}
        />
        <span className="absolute left-[8px] top-[8px] grid place-items-center min-w-[28px] h-[28px] px-[8px] rounded-full bg-[#14131ccc] text-[12px] font-[750] text-[#f0edf9] tabular-nums">
          {card.rank}
        </span>
        {card.isNew && (
          <span className="absolute right-[8px] top-[8px] px-[9px] h-[24px] inline-flex items-center rounded-[6px] bg-primary text-on-primary text-[11px] font-[800]">
            신작
          </span>
        )}
      </a>
      <div className="flex flex-col gap-[6px] min-w-0">
        <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {card.name}
        </strong>
        {card.genre && <p className="text-[13px] text-muted [overflow-wrap:anywhere]">{card.genre}</p>}
      </div>
    </article>
  )
}
