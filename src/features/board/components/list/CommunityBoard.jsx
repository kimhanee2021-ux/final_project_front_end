import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GSIcon, PageHeading } from '@/shared/ui'
import { CatalogMessage } from '@/features/games'
import { useAuth } from '@/features/auth'
import { BOARD_CATEGORIES } from '../../model/boardModel'
import { useBoardPosts } from '../../hooks/useBoardPosts'
import BoardFilters, { ALL_CATEGORY } from './BoardFilters'
import PostListItem from './PostListItem'

// 커뮤니티 게시판: 카테고리(주소의 ?category=)·검색으로 거른 글 목록. 로그인해야 글을 볼 수 있다.
export default function CommunityBoard() {
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const category = BOARD_CATEGORIES.includes(params.get('category')) ? params.get('category') : ALL_CATEGORY
  const [keyword, setKeyword] = useState('')
  const { posts, total, last, error, loading, loadingMore, loadMore, retry } = useBoardPosts({
    category: category === ALL_CATEGORY ? '' : category,
    query: keyword,
    enabled: isAuthenticated,
  })
  const setCategory = value =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous)
        if (value === ALL_CATEGORY) next.delete('category')
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
          <BoardFilters category={category} setCategory={setCategory} keyword={keyword} setKeyword={setKeyword} />
          {loading ? (
            <CatalogMessage icon="search" title="게시글을 불러오는 중이에요" role="status" />
          ) : error && !posts.length ? (
            <CatalogMessage icon="info" title="게시글을 불러오지 못했어요" description={error} action={{ label: '다시 시도', onClick: retry }} role="alert" />
          ) : posts.length > 0 ? (
            <>
              <ul>
                {posts.map(post => (
                  <PostListItem key={post.id} post={post} />
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
