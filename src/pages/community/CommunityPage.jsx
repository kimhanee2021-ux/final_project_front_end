import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useAuth } from '../../features/auth/context/AuthContext'
import { BOARD_CATEGORIES, dateTimeLabel, postAuthorLabel } from '../../features/board/boardModel'
import { useBoardPosts } from '../../features/board/hooks/useBoardPosts'

export default function CommunityPage() {
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const category = BOARD_CATEGORIES.includes(params.get('category')) ? params.get('category') : 'All'
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
        return next
      },
      { replace: true }
    )

  return (
    <section className="gs-catalog gs-full-catalog" aria-labelledby="gs-community-title">
      <div className="gs-section-heading">
        <div>
          <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
          <h1 id="gs-community-title">
            커뮤니티
            {isAuthenticated && !loading && !error && <span className="gs-result-count">{total.toLocaleString()}</span>}
          </h1>
          <p>솔직한 후기와 꿀팁을 나눠보세요.</p>
        </div>
        {isAuthenticated && (
          <Link to="/community/new" className="gs-primary-button">
            글쓰기
            <GSIcon name="edit" size={16} />
          </Link>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="gs-empty">
          <GSIcon name="users" size={38} />
          <h3>로그인하면 커뮤니티를 이용할 수 있어요</h3>
          <p>데모 세션에서는 게시글을 불러올 수 없어요.</p>
          <Link className="gs-primary-button" to="/signup">
            회원가입하기
            <GSIcon name="arrow" size={17} />
          </Link>
        </div>
      ) : (
        <>
          <div className="gs-catalog-toolbar">
            <div className="gs-genre-tabs" role="group" aria-label="게시판 카테고리">
              {['All', ...BOARD_CATEGORIES].map(item => (
                <button
                  key={item}
                  className={category === item ? 'active' : ''}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item === 'All' ? '전체' : item}
                </button>
              ))}
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

          {loading ? (
            <div className="gs-empty" role="status">
              <GSIcon name="search" size={38} />
              <h3>게시글을 불러오는 중이에요</h3>
            </div>
          ) : error && !posts.length ? (
            <div className="gs-empty" role="alert">
              <GSIcon name="info" size={38} />
              <h3>게시글을 불러오지 못했어요</h3>
              <p>{error}</p>
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
                <p className="gs-inline-note" role="alert">
                  <GSIcon name="info" size={20} />
                  {error}
                </p>
              )}
              {!last && (
                <div className="gs-load-more">
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
            <div className="gs-empty">
              <GSIcon name="search" size={38} />
              <h3>게시글이 없어요</h3>
              <p>첫 번째 글을 남겨보세요.</p>
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
