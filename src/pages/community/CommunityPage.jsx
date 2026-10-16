import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useAuth } from '../../features/auth/context/AuthContext'
import { BOARD_CATEGORIES, dateTimeLabel, postAuthorLabel } from '../../features/board/boardModel'
import { useBoardPosts } from '../../features/board/hooks/useBoardPosts'
// [추가] 리뷰·평점 칩을 눌렀을 때 게시글 대신 보여줄 리뷰 화면
import ReviewBoard from '../../features/review/components/ReviewBoard'

export default function CommunityPage() {
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const category = BOARD_CATEGORIES.includes(params.get('category')) ? params.get('category') : 'All'
  // [추가] ?view=reviews 이면 리뷰·평점 화면을 보여준다
  const isReviewView = params.get('view') === 'reviews'
  const [keyword, setKeyword] = useState('')
  const { posts, total, last, error, loading, loadingMore, loadMore, retry } = useBoardPosts({
    category: category === 'All' ? '' : category,
    query: keyword,
    enabled: isAuthenticated,
  })
  const setCategory = value =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous)
        if (value === 'All') next.delete('category')
        else next.set('category', value)
        next.delete('view') // [추가] 카테고리를 고르면 리뷰 화면을 끈다
        return next
      },
      { replace: true }
    )

  // [추가] 리뷰·평점 칩: 카테고리를 지우고 ?view=reviews 를 붙인다
  const openReviews = () =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous)
        next.delete('category')
        next.set('view', 'reviews')
        return next
      },
      { replace: true }
    )

  return (
    <section className="min-w-0 pt-[26px]" aria-labelledby="gs-community-title">
      <div className="flex items-start justify-between gap-[16px] items-center mb-[26px]">
        <div>
          <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
          <h1 className="text-[31px] m-[10px_0_0] tracking-[-0.6px] font-[650] leading-[1.25] max-[600px]:text-[27px]" id="gs-community-title">
            커뮤니티
            {isAuthenticated && !loading && !error && <span className="inline-block ml-[12px] align-middle text-[13px] p-[4px_8px] bg-gs-raised text-gs-muted rounded-[6px] max-[600px]:ml-[8px] max-[600px]:text-[11px]">{total.toLocaleString()}</span>}
          </h1>
          <p className="text-gs-muted text-[11px] mt-[8px] max-[600px]:max-w-[230px] max-[600px]:leading-[1.7]">솔직한 후기와 꿀팁을 나눠보세요.</p>
        </div>
        {isAuthenticated && (
          <Link to="/community/new" className="gs-primary-button">
            글쓰기
            <GSIcon name="edit" size={16} />
          </Link>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
          <GSIcon name="users" size={38} />
          <h3 className="text-[18px] mt-[18px]">로그인하면 커뮤니티를 이용할 수 있어요</h3>
          <p className="m-[8px_0_23px] text-gs-muted text-[12px]">데모 세션에서는 게시글을 불러올 수 없어요.</p>
          <Link className="gs-primary-button" to="/signup">
            회원가입하기
            <GSIcon name="arrow" size={17} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-[13px] m-[0_0_17px] min-w-0 max-[600px]:gap-[9px] max-[600px]:mb-[15px]">
            <div
              className="flex gap-[7px] overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-[2px_1px_3px] [&_button]:border [&_button]:border-gs-border [&_button]:rounded-[25px] [&_button]:bg-[linear-gradient(0deg,transparent,#8796a00c),var(--gs-raised)] [&_button]:p-[6px_15px] [&_button]:text-[10px] [&_button]:whitespace-nowrap [&_button]:min-h-[31px] [&_button:hover]:border-gs-mint min-[1600px]:[&_button]:text-[11px] min-[1600px]:[&_button]:p-[6px_17px] max-[600px]:[&_button]:p-[6px_14px] max-[600px]:[&_button]:min-h-[32px] max-[600px]:[&_button]:text-[10px]"
              role="group"
              aria-label="게시판 카테고리"
            >
              {['All', ...BOARD_CATEGORIES].map(item => (
                <button
                  key={item}
                  className={category === item ? 'bg-gs-accent! text-[#04291f]! font-[650]! border-gs-accent!' : ''}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item === 'All' ? '전체' : item}
                </button>
              ))}
              {/* [추가] 리뷰·평점 칩: 누르면 게시글 대신 리뷰 화면을 보여준다 */}
              <button
                className={isReviewView ? 'bg-gs-accent! text-[#04291f]! font-[650]! border-gs-accent!' : ''}
                aria-pressed={isReviewView}
                onClick={openReviews}
              >
                리뷰·평점
              </button>
            </div>
            <label className="flex items-center gap-[9px] min-w-[200px] px-[14px] h-[38px] border border-gs-border rounded-[25px] bg-gs-search text-gs-muted shrink-0">
              <GSIcon name="search" size={16} className="shrink-0" />
              <input
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder="제목, 내용 검색"
                aria-label="게시글 검색"
                className="w-full bg-transparent border-0 outline-none text-gs-text text-[12px]"
              />
            </label>
          </div>

          {/* [추가] 리뷰 화면이면 게시글 대신 ReviewBoard를 보여준다. 아니면 아래 기존 로직 그대로 */}
          {isReviewView ? (
            <ReviewBoard />
          ) : loading ? (
            <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="status">
              <GSIcon name="search" size={38} />
              <h3 className="text-[18px] mt-[18px]">게시글을 불러오는 중이에요</h3>
            </div>
          ) : error && !posts.length ? (
            <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted" role="alert">
              <GSIcon name="info" size={38} />
              <h3 className="text-[18px] mt-[18px]">게시글을 불러오지 못했어요</h3>
              <p className="m-[8px_0_23px] text-gs-muted text-[12px]">{error}</p>
              <button className="gs-primary-button" onClick={retry}>
                다시 시도
              </button>
            </div>
          ) : posts.length > 0 ? (
            <>
              <ul className="flex flex-col gap-0.5 border border-gs-border rounded-xl overflow-hidden bg-gs-panel">
                {posts.map((post, index) => (
                  <li key={post.id}>
                    <Link
                      to={`/community/${post.id}`}
                      className={`flex items-center gap-[14px] px-[18px] py-[15px] min-w-0 hover:bg-gs-hover ${index === posts.length - 1 ? '' : 'border-b border-gs-border'}`}
                    >
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" loading="lazy" className="w-[52px] h-[52px] rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex flex-col gap-[5px] min-w-0 flex-1">
                        <span className="inline-flex self-start px-[9px] py-[3px] rounded-[6px] bg-gs-active text-gs-mint text-[10px] font-[650]">
                          {post.category}
                        </span>
                        <strong className="text-[14px] font-[620] whitespace-nowrap overflow-hidden text-ellipsis">{post.title}</strong>
                        <div className="flex items-center gap-[10px] text-gs-muted text-[11px]">
                          <span>{postAuthorLabel(post)}</span>
                          <span>{dateTimeLabel(post.createdAt)}</span>
                          <span className="inline-flex items-center gap-[4px]">
                            <GSIcon name="eye" size={13} />
                            {post.viewCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {error && (
                <p className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]" role="alert">
                  <GSIcon name="info" size={20} />
                  {error}
                </p>
              )}
              {!last && (
                <div className="flex justify-center p-[26px_0_8px]">
                  <button
                    className="gs-secondary-button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    aria-busy={loadingMore}
                  >
                    {loadingMore ? '불러오는 중...' : `더 보기 (${posts.length.toLocaleString()} / ${total.toLocaleString()})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-[70px_20px] text-center border border-dashed border-gs-border rounded-[12px] [&>svg]:text-gs-muted">
              <GSIcon name="search" size={38} />
              <h3 className="text-[18px] mt-[18px]">게시글이 없어요</h3>
              <p className="m-[8px_0_23px] text-gs-muted text-[12px]">첫 번째 글을 남겨보세요.</p>
              <Link className="gs-primary-button" to="/community/new">
                글쓰기
                <GSIcon name="arrow" size={17} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
