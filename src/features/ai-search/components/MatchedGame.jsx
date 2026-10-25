import { GameImage, GSIcon, PRIMARY_BUTTON } from '@/shared/ui'
import { tagLabel } from '@/shared/utils/gameTags'

// 사용자가 이름으로 말한 게임. 비슷한 게임 목록보다 먼저, 크게 보여준다.
export default function MatchedGame({ game, selected, onSelect }) {
  return (
    <article className={`flex items-center gap-[18px] p-[14px] rounded-[18px] bg-bg max-[600px]:flex-col max-[600px]:items-stretch ${selected ? 'ring-2 ring-primary' : ''}`}>
      <GameImage src={game.image} className="w-[220px] aspect-[460/215] rounded-[12px] object-cover shrink-0 max-[600px]:w-full" iconSize={30} />
      <div className="flex-1 min-w-0">
        <span className="text-[12px] font-[700] text-primary-text">말씀하신 게임</span>
        <strong className="block mt-[4px] text-[20px] font-[750] tracking-[-0.5px] leading-[1.35]">{game.name}</strong>
        {game.genres.length > 0 && (
          <p className="mt-[6px] text-[13px] text-muted">{game.genres.slice(0, 4).map(tagLabel).join(' · ')}</p>
        )}
      </div>
      <div className="flex flex-col gap-[8px] shrink-0">
        <button type="button" className={PRIMARY_BUTTON + ' px-[18px]'} onClick={() => onSelect(game.appId)} aria-pressed={selected}>
          {selected ? '소식 보는 중' : '공식 소식 · AI 브리핑'}
        </button>
        <a href={game.storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-[4px] text-[13px] text-muted hover:text-text">
          스팀에서 보기<GSIcon name="arrow" size={13} />
          <span className="sr-only"> (새 탭)</span>
        </a>
      </div>
    </article>
  )
}
