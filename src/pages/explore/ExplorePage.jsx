import { useMemo, useState } from 'react'
import { useGameSense } from '@/shared/state'
import { PageHeading, PanelPage, Panel } from '@/shared/ui'
import { useFeaturedCategories, FeaturedSection, TrendingSection, ViewToggle } from '@/features/games'

// 탐색 페이지: 트렌드 / 추천 게임을 각각 한 구간으로 나누고, 보기 방식(view)만 공유한다.
// 검색 중에는 검색 결과에 집중하도록 트렌드 구간을 숨긴다.
export default function ExplorePage() {
  const { query } = useGameSense()
  const [view, setView] = useState('grid')
  const searching = query.trim() !== ''
  // 트렌드 데이터는 여기서 한 번만 받아 트렌드 구역과 검색(추천 + 트렌드 함께 검색)이 같이 쓴다.
  const trending = useFeaturedCategories()
  const trendingGames = useMemo(() => trending.categories.flatMap(category => category.games), [trending.categories])

  return (
    <PanelPage>
      {!searching && (
        <Panel id="trending">
          <PageHeading
            title="게임 탐색"
            description="지금 스팀에서 주목받는 게임을 둘러보세요."
            action={<ViewToggle view={view} onChange={setView} />}
          />
          <TrendingSection view={view} source={trending} />
        </Panel>
      )}
      <Panel id="featured">
        {searching && (
          <PageHeading title="게임 탐색" action={<ViewToggle view={view} onChange={setView} />} />
        )}
        <FeaturedSection view={view} extraGames={searching ? trendingGames : undefined} />
      </Panel>
    </PanelPage>
  )
}
