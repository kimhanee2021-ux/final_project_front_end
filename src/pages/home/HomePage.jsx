import HomeHero from '../../features/games/components/HomeHero'
import GameCatalog from '../../features/games/components/GameCatalog'
import {
  PlayPattern,
  RecentActivity,
  Recommendations,
} from '../../features/games/components/HomeWidgets'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="gs-dashboard-grid">
        <GameCatalog />
        <aside className="gs-dashboard-widgets" aria-label="나의 게임 인사이트">
          <PlayPattern />
          <Recommendations />
          <RecentActivity />
        </aside>
      </div>
    </>
  )
}
