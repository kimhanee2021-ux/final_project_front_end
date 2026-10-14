import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'

export function PlatformIcons({ platforms }) {
  return (
    <div className="flex items-center gap-[11px] mt-auto" aria-label={`플랫폼: ${platforms.join(', ')}`}>
      {platforms.map(platform => (
        <span key={platform} className="inline-flex items-center gap-[5px]" title={platform}>
          <GSIcon name="steam" size={17} />
          {platforms.length === 1 && <small className="text-[9px] text-gs-muted">{platform}</small>}
        </span>
      ))}
    </div>
  )
}

// view="list"는 GameCatalog의 그리드/리스트 토글을 그대로 받는다. 이전엔
// ".gs-list-view .gs-game-card" 같은 부모 클래스 기반 선택자로 모양을 바꿨는데,
// prop으로 직접 받는 쪽이 더 명확하다. (반응형 min-height의 몇 px 차이는 생략했다.)
export default function GameCard({ game, view = 'grid' }) {
  const { wishlist, toggleWishlist, setSelectedGame } = useGameSense()
  const saved = wishlist.includes(game.id)
  const list = view === 'list'
  return (
    <article
      className={`relative flex min-w-0 bg-[linear-gradient(120deg,transparent_40%,#7795a205),var(--gs-panel)] border border-gs-border rounded-[10px] [transition:border-color_.2s,transform_.2s,box-shadow_.2s] overflow-hidden hover:border-[#587c7680] hover:-translate-y-[2px] hover:shadow-[0_7px_22px_#00000015] ${list ? 'min-h-[112px]' : 'min-h-[133px] max-[600px]:min-h-[140px]'}`}
    >
      <button
        className={`group p-0 bg-[#1b2430] self-stretch rounded-[8px] overflow-hidden m-[2px] ${list ? 'shrink-0 basis-[95px] w-[95px]' : 'shrink-0 basis-[32%] w-[32%]'}`}
        onClick={() => setSelectedGame(game)}
        aria-label={`${game.name} 상세 보기`}
      >
        <img
          className={`group-hover:scale-[1.045] transition-transform duration-[350ms] block w-full object-cover object-center ${list ? 'h-[120px]' : 'h-full aspect-[0.83]'}`}
          src={game.image}
          alt=""
          loading="lazy"
        />
      </button>
      <div className={`flex flex-col gap-[7px] min-w-0 flex-1 ${list ? 'p-[12px_17px]' : 'p-[11px_8px_9px_11px]'}`}>
        <button
          className={`bg-transparent pr-[20px] text-[12px] font-[620] leading-[1.42] text-left [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden min-h-[17px] hover:text-gs-mint ${list ? 'text-[14px]' : ''}`}
          onClick={() => setSelectedGame(game)}
        >
          {game.name}
        </button>
        <div className="flex items-center gap-[5px] text-[11px] leading-none whitespace-nowrap [&_svg]:text-[#ffd354] [&_svg]:fill-[#ffd354] [&_svg]:stroke-1">
          <GSIcon name="star" size={15} />
          <strong className="font-[550]">{game.rating.toFixed(1)}</strong>
          <span className="text-gs-muted">({game.reviews})</span>
        </div>
        <div className="flex flex-wrap gap-[5px]">
          {game.genres.map(genre => (
            <span key={genre} className="bg-gs-raised text-gs-muted py-[3px] px-[6px] rounded-[5px] text-[9px] leading-[1.3] whitespace-nowrap">{genre}</span>
          ))}
        </div>
        <PlatformIcons platforms={game.platforms} />
      </div>
      <button
        className={`absolute right-[7px] top-[9px] grid place-items-center w-[24px] h-[24px] p-0 bg-transparent rounded-full text-gs-text hover:text-gs-mint hover:bg-gs-raised ${saved ? 'text-gs-mint [&_svg]:fill-gs-mint' : ''}`}
        aria-label={`${game.name} ${saved ? '찜 해제' : '찜하기'}`}
        aria-pressed={saved}
        onClick={() => toggleWishlist(game)}
      >
        <GSIcon name="heart" size={19} />
      </button>
    </article>
  )
}
