import { Link } from 'react-router-dom'
import { EmptyState, PageHeading } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { searchTextOf } from '@/shared/utils/gameTags'
import { WishlistCard } from '@/features/wishlist'
// [변경] 위시리스트를 열면 AI 분석이 자동으로 돈다. 요약 보기 버튼은 쓰지 않는다
import { WishlistSummaryProvider } from '@/features/wishlist/analysis/WishlistSummaryContext'
import WishlistSummaryMessage from '@/features/wishlist/analysis/WishlistSummaryMessage'

const linkClass = 'gs-primary-button'

// 위시리스트: 게임 카드의 하트로 담은 게임을 모아 보여준다. 헤더 검색어로 이름·태그를 걸러 볼 수 있다.
export default function WishlistPage() {
  const { wishlist, query } = useGameSense()
  // [추가] 찜한 스팀 게임(숫자 id = appid)만 모아서 AI 분석 대상으로 넘긴다
  const steamIds = wishlist.filter(item => typeof item.id === 'number').map(item => item.id)
  const visible = wishlist.filter(item => matchesSearch(searchTextOf({ ...item, tags: item.tags ?? item.genres }), query))
  return (
    // [추가] 페이지 안의 카드들이 AI 분석 상태를 공유하도록 감싼다
    <WishlistSummaryProvider appIds={steamIds}>
      <section aria-labelledby="gs-wishlist-title">
        {/* [변경] 제목: AI가 분석한 목록임을 드러낸다 */}
        <PageHeading
          id="gs-wishlist-title"
          title="AI가 분석한 나의 위시리스트"
          description={wishlist.length ? `관심 있는 게임 ${wishlist.length}개를 담았어요. 하트를 다시 누르면 뺄 수 있어요.` : '언젠가 만나고 싶은 게임을 하트로 담아 보세요.'}
        />
        {/* [변경] 상단 AI 전체 요약 (분석 중이면 안내 문구, 끝나면 요약 문단) */}
        {wishlist.length > 0 && <WishlistSummaryMessage />}
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
    </WishlistSummaryProvider>
  )
}