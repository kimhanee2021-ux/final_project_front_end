// 탐색 탭은 스팀 "추천" 섹션 캐시(/api/games/featured)를 보여준다 — 장르·리뷰 데이터가 없어 가격만 표시한다.
// 상세 API가 아직 없어 카드를 누르면 스팀 상점 페이지를 새 탭으로 연다.
// view="list"는 ExplorePage의 그리드/리스트 토글을 받는다 — 기본은 세로(커버가 위),
// 리스트 모드에서 가로(커버가 왼쪽)로 바뀐다. GameCard와 반대 기본값인 점이 다르다.
export default function GameListCard({ game, view = 'grid' }) {
  const list = view === 'list'
  return (
    <article
      className={`relative flex min-w-0 bg-[linear-gradient(120deg,transparent_40%,#7795a205),var(--gs-panel)] border border-gs-border rounded-[10px] [transition:border-color_.2s,transform_.2s,box-shadow_.2s] overflow-hidden hover:border-[#587c7680] hover:-translate-y-[2px] hover:shadow-[0_7px_22px_#00000015] ${list ? 'flex-row min-h-[112px]' : 'flex-col min-h-[133px] max-[600px]:min-h-[140px]'}`}
    >
      <a
        className={`group p-0 bg-[#1b2430] rounded-[8px] overflow-hidden m-[2px] block ${list ? 'shrink-0 basis-[34%] w-[34%] self-stretch' : 'w-auto self-auto'}`}
        href={game.storeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${game.name} 스팀 상점에서 보기`}
      >
        {game.image && (
          <img
            className={`group-hover:scale-[1.045] transition-transform duration-[350ms] block w-full object-cover object-center ${list ? 'h-full' : 'h-auto aspect-[460/215]'}`}
            src={game.image}
            alt=""
            loading="lazy"
          />
        )}
      </a>
      <div className="flex flex-col gap-[7px] min-w-0 flex-1 p-[11px_8px_9px_11px]">
        <a
          className="bg-transparent pr-[20px] text-[12px] font-[620] leading-[1.42] text-left [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden min-h-[17px] hover:text-gs-mint"
          href={game.storeUrl}
          target="_blank"
          rel="noreferrer"
        >
          {game.name}
        </a>
        {game.price && (
          <p className="flex items-center gap-[7px] mt-auto text-[12px]">
            {game.discountPercent > 0 && (
              <em className="not-italic font-[650] text-[#04291f] bg-gs-accent py-[1px] px-[5px] rounded-[4px] text-[10px]">-{game.discountPercent}%</em>
            )}
            <strong className="font-semibold">{game.price}</strong>
          </p>
        )}
      </div>
    </article>
  )
}
