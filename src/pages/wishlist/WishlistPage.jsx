import { Link } from 'react-router-dom'
import { EmptyState, PageHeading, Panel, PanelPage } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { matchesSearch } from '@/shared/utils/searchMatch'
import { searchTextOf } from '@/shared/utils/gameTags'
// 위시리스트를 열면 AI 분석이 자동으로 돈다(WishlistSummaryProvider). 요약 보기 버튼은 쓰지 않는다
import { WishlistAiOverview, WishlistCard, WishlistSummaryProvider } from '@/features/wishlist'

const linkClass = 'gs-primary-button'

// 위시리스트: 게임 카드의 하트로 담은 게임을 모아 보여준다. 헤더 검색어로 이름·태그를 걸러 볼 수 있다.
// [변경] 패널 두 개: ① 제목 + AI 구매 판단 영역 ② 담은 게임 목록 (AI 게임 추천 화면과 같은 구조라 다크 모드에서도 구분된다)
export default function WishlistPage() {
  const { wishlist, query } = useGameSense()
  // [추가] 찜한 스팀 게임(숫자 id = appid)만 모아서 AI 분석 대상으로 넘긴다
  const steamGames = wishlist.filter(item => typeof item.id === 'number')
  const steamIds = steamGames.map(item => item.id)
  const visible = wishlist.filter(item => matchesSearch(searchTextOf({ ...item, tags: item.tags ?? item.genres }), query))
  const heading = (
    <PageHeading
      id="gs-wishlist-title"
      title="AI가 분석한 나의 위시리스트"
      description={wishlist.length ? `관심 있는 게임 ${wishlist.length}개를 담았어요. 하트를 다시 누르면 뺄 수 있어요.` : '언젠가 만나고 싶은 게임을 하트로 담아 보세요.'}
    />
  )
  return (
    // [추가] 페이지 안의 카드들이 AI 분석 상태를 공유하도록 감싼다
    <WishlistSummaryProvider appIds={steamIds}>
      <PanelPage>
        {/* [변경] 스팀 게임이 있으면 제목을 AI 판단 영역 안에, 없으면 일반 패널에 둔다 */}
        {steamGames.length > 0 ? <WishlistAiOverview games={steamGames} heading={heading} /> : <Panel>{heading}</Panel>}
        <Panel className="min-w-0">
          {!wishlist.length ? (
            <EmptyState
              title="아직 담은 게임이 없어요"
              description="AI 추천 게임이나 스팀 전체 게임에서 마음에 드는 게임의 하트를 눌러 보세요."
              action={
                <div className="flex gap-[8px]">
                  <Link className={linkClass} to="/ai-recommends">
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
            <>
              <h2 className="mb-[16px] text-[16px] font-[700]">담은 게임 {visible.length}개</h2>
              {/* [변경] AI 판단이 잘 보이도록 가로 카드 2열 (좁은 화면은 1열) */}
              <ul className="grid grid-cols-2 gap-[16px] max-[960px]:grid-cols-1">
                {visible.map(item => (
                  <li key={item.id} className="min-w-0">
                    <WishlistCard item={item} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </PanelPage>
    </WishlistSummaryProvider>
  )
}
