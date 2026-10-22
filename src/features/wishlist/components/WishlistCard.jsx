import WishlistButton from './WishlistButton'
// [변경] AI 구매 판단을 카드의 주인공으로: 판단 칩 → 이름 · 가격 → AI 문장.
// 할인 기록 · 지금 vs 기대 막대 같은 자세한 근거는 위쪽 AI 영역에서 게임 태그를 눌러 본다.
import WishlistVerdictBadge from './analysis/WishlistVerdictBadge'
import WishlistCardSummary from './analysis/WishlistCardSummary'

// 위시리스트 화면의 게임 한 칸 (가로 카드): 왼쪽 커버(누르면 스팀 상점 새 탭, 하트로 빼기), 오른쪽 AI 판단과 그 근거.
export default function WishlistCard({ item }) {
  return (
    <article className="flex gap-[16px] h-full p-[14px] rounded-[20px] bg-bg border border-border min-w-0 max-[480px]:flex-col">
      <div className="relative w-[40%] shrink-0 self-center max-[480px]:w-full">
        <a
          href={item.storeUrl}
          target="_blank"
          rel="noreferrer"
          className="group block w-full overflow-hidden rounded-[14px] bg-bg"
          aria-label={`${item.name} 스팀 상점 보기`}
        >
          {item.image && (
            <img
              className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
              src={item.image}
              alt=""
              loading="lazy"
            />
          )}
        </a>
        <WishlistButton game={item} className="absolute right-[8px] top-[8px]" />
      </div>
      <div className="flex flex-col gap-[10px] flex-1 min-w-0">
        <WishlistVerdictBadge item={item} />
        <div className="min-w-0">
          <strong className="text-[16px] font-[700] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {item.name}
          </strong>
          {item.price && (
            <p className="mt-[2px] flex items-center gap-[8px] text-[13px]">
              {item.discountPercent > 0 && <em className="not-italic font-[700] text-primary-text">-{item.discountPercent}%</em>}
              <span className="text-muted">{item.price}</span>
            </p>
          )}
        </div>
        <WishlistCardSummary item={item} />
      </div>
    </article>
  )
}
