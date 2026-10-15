import { Link } from 'react-router-dom'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'
import GameListCard from './GameListCard'
import GameLoadingSkeleton from './GameLoadingSkeleton'
import { useFeaturedGames } from '../hooks/useFeaturedGames'

const PREVIEW_COUNT = 6

// 홈 화면 미리보기. 탐색탭과 같은 실제 데이터(/api/games/featured)를 써서
// "View All"을 누르면 이어지는 탐색탭과 내용이 일관되게 맞는다.
export default function HomeGameList() {
  const { query, t } = useGameSense()
  const { games, loading, error } = useFeaturedGames()
  const name = query.trim().toLowerCase()
  const filtered = name ? games.filter(game => game.name.toLowerCase().includes(name)) : games
  const visibleGames = filtered.slice(0, PREVIEW_COUNT)
  const gridClass = 'grid grid-cols-2 gap-[11px_12px] max-[600px]:grid-cols-1 max-[600px]:gap-[11px]'

  return (
    <section className="min-w-0" aria-labelledby="gs-catalog-title">
      <div className="flex items-start justify-between gap-[16px] mb-[17px] max-[600px]:mb-[15px]">
        <div>
          <h2 className="text-[23px] tracking-[-0.6px] font-[650] leading-[1.25]" id="gs-catalog-title">
            {t('Game List', '게임 목록')}
          </h2>
          <p className="text-gs-muted text-[11px] mt-[4px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">새로운 세계를 발견해보세요.</p>
        </div>
        <Link to="/explore" className="mt-[7px] inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint">
          View All
          <GSIcon name="arrow" size={16} />
        </Link>
      </div>
      {loading ? (
        <GameLoadingSkeleton count={PREVIEW_COUNT} className={gridClass} />
      ) : error && !games.length ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="alert">
          <GSIcon name="info" size={38} />
          <h3 className="text-[18px] mt-[18px]">게임 목록을 불러오지 못했어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">{error}</p>
        </div>
      ) : visibleGames.length > 0 ? (
        <div className={gridClass}>
          {visibleGames.map(game => (
            <GameListCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="search" size={38} />
          <h3 className="text-[18px] mt-[18px]">검색 결과가 없어요</h3>
        </div>
      )}
    </section>
  )
}
