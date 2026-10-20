import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GSIcon, PageHeading, FilterChips } from '@/shared/ui'
import { CatalogMessage } from '@/features/games'
import { useAuth } from '@/features/auth'
import { BOARD_CATEGORIES, dateTimeLabel, postAuthorLabel, useBoardPosts } from '@/features/board'

const CATEGORY_OPTIONS = ['All', ...BOARD_CATEGORIES].map(item => ({ key: item, label: item === 'All' ? '전체' : item }))

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
    <section className="min-w-0" aria-labelledby="gs-community-title">
      <PageHeading
        id="gs-community-title"
        title="커뮤니티"
        description={`솔직한 후기와 꿀팁을 나눠보세요.${isAuthenticated && !loading && !error ? ` · 글 ${total.toLocaleString()}개` : ''}`}
        action={
          isAuthenticated && (
            <Link to="/community/new" className="gs-primary-button">
              글쓰기
              <GSIcon name="edit" size={16} />
            </Link>
          )
        }
      />

      {!isAuthenticated ? (
        <CatalogMessage icon="users" title="로그인하면 커뮤니티를 이용할 수 있어요" description="데모 세션에서는 게시글을 불러올 수 없어요.">
          <Link className="gs-primary-button mt-[16px]" to="/signup">
            회원가입하기
            <GSIcon name="arrow" size={17} />
          </Link>
        </CatalogMessage>
      ) : (
        <>
          <div className="flex items-center justify-between gap-[16px] mb-[12px] min-w-0 max-[760px]:flex-col max-[760px]:items-stretch">
            <FilterChips label="게시판 카테고리" options={CATEGORY_OPTIONS} activeKey={category} onSelect={setCategory} />
            <label className="flex items-center gap-[9px] w-[240px] h-[38px] px-[16px] rounded-full bg-bg text-muted shrink-0 max-[760px]:w-full">
              <GSIcon name="search" size={16} className="shrink-0" />
              <input
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder="제목, 내용 검색"
                aria-label="게시글 검색"
                className="w-full bg-transparent border-0 outline-none text-text text-[14px]"
              />
            </label>
          </div>

          {loading ? (
            <CatalogMessage icon="search" title="게시글을 불러오는 중이에요" role="status" />
          ) : error && !posts.length ? (
            <CatalogMessage icon="info" title="게시글을 불러오지 못했어요" description={error} action={{ label: '다시 시도', onClick: retry }} role="alert" />
          ) : posts.length > 0 ? (
            <>
              <ul>
                {posts.map(post => (
                  <li key={post.id} className="border-b border-border last:border-0">
                    <Link to={`/community/${post.id}`} className="flex items-center gap-[16px] py-[18px] min-w-0 hover:opacity-80">
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" loading="lazy" className="w-[56px] h-[56px] rounded-[12px] object-cover shrink-0" />
                      )}
                      <div className="flex flex-col gap-[6px] min-w-0 flex-1">
                        <strong className="text-[16px] font-[600] whitespace-nowrap overflow-hidden text-ellipsis">{post.title}</strong>
                        <div className="flex items-center gap-[10px] text-faint text-[13px]">
                          <span>{post.category}</span>
                          <span>{postAuthorLabel(post)}</span>
                          <span>{dateTimeLabel(post.createdAt)}</span>
                          <span className="inline-flex items-center gap-[4px]">
                            <GSIcon name="eye" size={14} />
                            {post.viewCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {error && (
                <p className="mt-[16px] text-muted text-[13px]" role="alert">
                  {error}
                </p>
              )}
              {!last && (
                <div className="flex justify-center pt-[28px]">
                  <button className="gs-secondary-button" onClick={loadMore} disabled={loadingMore} aria-busy={loadingMore}>
                    {loadingMore ? '불러오는 중...' : `더 보기 (${posts.length.toLocaleString()} / ${total.toLocaleString()})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <CatalogMessage icon="search" title="게시글이 없어요" description="첫 번째 글을 남겨보세요.">
              <Link className="gs-primary-button mt-[16px]" to="/community/new">
                글쓰기
                <GSIcon name="arrow" size={17} />
              </Link>
            </CatalogMessage>
          )}
        </>
      )}
    </section>
  )
}
