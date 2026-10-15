import { useState } from 'react'
import GSIcon from '../../components/common/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import GameListCard from '../../features/games/components/GameListCard'
import GameLoadingSkeleton from '../../features/games/components/GameLoadingSkeleton'
import { useFeaturedCategories } from '../../features/games/hooks/useFeaturedCategories'

export default function TrendingPage() {
  const { t } = useGameSense()
  const [view, setView] = useState('grid')
  const [categoryKey, setCategoryKey] = useState(null)
  const { categories, loading, error, retry } = useFeaturedCategories()
  const activeKey = categoryKey ?? categories[0]?.key
  const activeCategory = categories.find(category => category.key === activeKey)
  const games = activeCategory?.games ?? []
  const gridClass = `grid gap-[11px_12px] max-[600px]:grid-cols-1 max-[600px]:gap-[11px] ${view === 'list' ? 'grid-cols-1' : 'grid-cols-2 min-[1900px]:grid-cols-4 max-[1350px]:grid-cols-2'}`

  return (
    <section className="min-w-0 pt-[26px]" aria-labelledby="gs-catalog-title" aria-busy={loading}>
      <div className="flex items-start justify-between gap-[16px] items-center mb-[26px]">
        <div>
          <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
          <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-catalog-title">
            {t('Trending', '트렌드')}
          </h1>
          <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">지금 스팀에서 주목받는 카테고리별 게임을 만나보세요.</p>
        </div>
        <div className="flex border border-gs-border rounded-[20px] h-[31px] overflow-hidden shrink-0 max-[600px]:h-[32px]" role="group" aria-label="게임 목록 보기 방식">
          <button
            className={`w-[32px] grid place-items-center bg-transparent text-gs-muted p-0 max-[600px]:w-[30px] ${view === 'grid' ? 'text-gs-text bg-gs-hover' : ''}`}
            aria-label="그리드 보기"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <GSIcon name="grid" size={17} className={view === 'grid' ? 'stroke-2' : ''} />
          </button>
          <button
            className={`w-[32px] grid place-items-center bg-transparent text-gs-muted p-0 max-[600px]:w-[30px] ${view === 'list' ? 'text-gs-text bg-gs-hover' : ''}`}
            aria-label="리스트 보기"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            <GSIcon name="list" size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex gap-[7px] m-[0_0_17px] max-[600px]:mb-[15px]">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[31px] w-[84px] rounded-[25px] bg-gs-raised animate-pulse" />
            ))}
          </div>
          <GameLoadingSkeleton view={view} className={gridClass} />
        </>
      ) : error && !categories.length ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="alert">
          <GSIcon name="info" size={38} />
          <h3 className="text-[18px] mt-[18px]">카테고리를 불러오지 못했어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">{error}</p>
          <button className="gs-primary-button" onClick={retry}>
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div
            className="flex gap-[7px] overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-[2px_1px_3px] m-[0_0_17px] max-[600px]:mb-[15px] [&_button]:border [&_button]:border-gs-border [&_button]:rounded-[25px] [&_button]:bg-[linear-gradient(0deg,transparent,#8796a00c),var(--gs-raised)] [&_button]:p-[6px_15px] [&_button]:text-[10px] [&_button]:whitespace-nowrap [&_button]:min-h-[31px] [&_button:hover]:border-gs-mint min-[1600px]:[&_button]:text-[11px] min-[1600px]:[&_button]:p-[6px_17px]"
            role="group"
            aria-label="카테고리"
          >
            {categories.map(category => (
              <button
                key={category.key}
                className={activeKey === category.key ? 'bg-gs-accent! text-[#04291f]! font-[650]! border-gs-accent!' : ''}
                aria-pressed={activeKey === category.key}
                onClick={() => setCategoryKey(category.key)}
              >
                {category.name}
              </button>
            ))}
          </div>
          {games.length > 0 ? (
            <div className={gridClass}>
              {games.map(game => (
                <GameListCard key={game.id} game={game} view={view} />
              ))}
            </div>
          ) : (
            <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
              <GSIcon name="search" size={38} />
              <h3 className="text-[18px] mt-[18px]">표시할 게임이 없어요</h3>
            </div>
          )}
        </>
      )}
    </section>
  )
}
