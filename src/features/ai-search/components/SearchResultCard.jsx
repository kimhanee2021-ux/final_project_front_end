import { GameImage, GSIcon } from '@/shared/ui'
import { tagLabel } from '@/shared/utils/gameTags'
import { WishlistButton } from '@/features/wishlist'
import { highlightTags } from '../model/searchResult'

// 검색 결과 한 칸: 커버·이름을 누르면 그 게임의 공식 소식과 AI 브리핑을 아래에 연다.
// 태그는 검색 태그와 겹치는 것을 먼저 강조하고, 긍정 평가 비율과 스팀 상점 링크를 함께 둔다.
export default function SearchResultCard({ game, searchTags, selected, onSelect }) {
  const tags = highlightTags(game.steamTags.length ? game.steamTags : game.genres, searchTags)
  return (
    <article className="relative flex flex-col gap-[10px] min-w-0">
      <button
        type="button"
        onClick={() => onSelect(game.appId)}
        aria-pressed={selected}
        aria-label={`${game.name} 소식 보기`}
        className={`group block overflow-hidden rounded-[16px] bg-bg text-left outline-offset-2 ${selected ? 'ring-2 ring-primary' : ''}`}
      >
        <GameImage
          className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
          src={game.image}
          iconSize={34}
        />
      </button>
      <div className="flex flex-col gap-[6px] min-w-0 pr-[44px]">
        <button type="button" onClick={() => onSelect(game.appId)} className="text-left">
          <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {game.name}
          </strong>
        </button>
        {tags.length > 0 && (
          <ul className="list-none m-0 p-0 flex flex-wrap gap-[6px]" aria-label="태그">
            {tags.map(({ tag, matched }) => (
              <li
                key={tag}
                className={`px-[10px] py-[3px] rounded-full text-[12px] ${matched ? 'bg-primary/10 text-primary-text font-[600]' : 'bg-bg text-muted'}`}
              >
                {tagLabel(tag)}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-[10px] text-[12px] text-muted">
          {game.positiveRate != null && <span>긍정 평가 {Math.round(Number(game.positiveRate))}%</span>}
          <a href={game.storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-[3px] hover:text-text">
            스팀<GSIcon name="arrow" size={12} />
            <span className="sr-only"> (새 탭)</span>
          </a>
        </div>
      </div>
      <WishlistButton game={game} className="absolute right-0 bottom-0" />
    </article>
  )
}
