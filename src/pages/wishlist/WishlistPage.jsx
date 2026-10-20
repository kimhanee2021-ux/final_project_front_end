import { Link } from 'react-router-dom'
import { EmptyState, PageHeading } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { searchTextOf } from '@/shared/utils/gameTags'
import { WishlistCard } from '@/features/wishlist'

const linkClass = 'gs-primary-button'

// 위시리스트: 게임 카드의 하트로 담은 게임을 모아 보여준다. 헤더 검색어로 이름·태그를 걸러 볼 수 있다.
export default function WishlistPage() {
  const { wishlist, query } = useGameSense()
  const visible = wishlist.filter(item => matchesSearch(searchTextOf({ ...item, tags: item.tags ?? item.genres }), query))
  return (
    <section aria-labelledby="gs-wishlist-title">
      <PageHeading
        id="gs-wishlist-title"
        title="나의 위시리스트"
        description={wishlist.length ? `관심 있는 게임 ${wishlist.length}개를 담았어요. 하트를 다시 누르면 뺄 수 있어요.` : '언젠가 만나고 싶은 게임을 하트로 담아 보세요.'}
      />
      {!wishlist.length ? (
        <EmptyState
          title="아직 담은 게임이 없어요"
          description="AI 추천 게임이나 스팀 전체 게임에서 마음에 드는 게임의 하트를 눌러 보세요."
          action={
            <div className="flex gap-[8px]">
              <Link className={linkClass} to="/recommendations">
                AI 추천 게임 보기
              </Link>
              <Link className="gs-secondary-button" to="/explore">
                스팀 전체 게임 보기
              </Link>
            </div>
          }
        />
      ) : !visible.length ? (
        <EmptyState title="검색 결과가 없어요" description="검색어를 지우거나 다른 검색어로 찾아보세요." />
      ) : (
        <ul className="grid grid-cols-4 gap-[36px_20px] max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1">
          {visible.map(item => (
            <li key={item.id} className="min-w-0">
              <WishlistCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
