import { useState } from 'react'
import { gameGridClass } from '../model/gameGridClass'
import CatalogMessage from './CatalogMessage'
import CategoryChips from './CategoryChips'
import CategoryChipsSkeleton from './CategoryChipsSkeleton'
import GameGrid from './GameGrid'
import GameLoadingSkeleton from './GameLoadingSkeleton'
import SectionHeader from './SectionHeader'

// 지금 스팀에서 주목받는 카테고리별 게임. 카테고리 선택 상태만 이 컴포넌트가 가진다.
// source: useFeaturedCategories()의 결과({ categories, loading, error, retry })
export default function TrendingSection({ view, source }) {
  const [categoryKey, setCategoryKey] = useState(null)
  const { categories, loading, error, retry } = source
  const activeKey = categoryKey ?? categories[0]?.key
  const games = categories.find(category => category.key === activeKey)?.games ?? []

  let body
  if (loading) {
    body = (
      <>
        <CategoryChipsSkeleton />
        <GameLoadingSkeleton view={view} className={gameGridClass(view)} />
      </>
    )
  } else if (error && !categories.length) {
    body = <CatalogMessage role="alert" icon="info" title="카테고리를 불러오지 못했어요" description={error} action={{ label: '다시 시도', onClick: retry }} />
  } else {
    body = (
      <>
        <CategoryChips categories={categories} activeKey={activeKey} onSelect={setCategoryKey} />
        {games.length > 0 ? <GameGrid games={games} view={view} /> : <CatalogMessage icon="search" title="표시할 게임이 없어요" />}
      </>
    )
  }

  return (
    <section className="min-w-0" aria-labelledby="gs-trending-title" aria-busy={loading}>
      <SectionHeader id="gs-trending-title" title="트렌드" description="지금 스팀에서 주목받는 카테고리별 게임을 만나보세요." />
      {body}
    </section>
  )
}
