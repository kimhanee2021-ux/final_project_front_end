import HomeHero from '../../features/games/components/HomeHero'
import HomeGameList from '../../features/games/components/HomeGameList'
import { PlayPattern, Recommendations } from '../../features/games/components/HomeWidgets'
import HomeRecentFocus from '../../features/games/components/HomeRecentFocus'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="grid grid-cols-[minmax(0,1.24fr)_minmax(0,1fr)] gap-[20px] mt-[19px] items-start min-[1600px]:gap-[21px] min-[1600px]:mt-[18px] max-[1350px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] max-[1350px]:gap-[16px] max-[1120px]:grid-cols-1 max-[1120px]:gap-[24px]">
        <HomeGameList />
        <aside className="grid gap-[12px] min-w-0" aria-label="나의 게임 인사이트">
          <PlayPattern />
          <Recommendations />
          <HomeRecentFocus />
        </aside>
      </div>
    </>
  )
}
