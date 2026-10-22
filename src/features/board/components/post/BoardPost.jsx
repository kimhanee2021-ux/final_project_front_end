import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { CatalogMessage } from '@/features/games'
import { useAuth } from '@/features/auth'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { deletePost } from '../../api'
import { useBoardPost } from '../../hooks/useBoardPost'
import CommentSection from '../comments/CommentSection'
import PostActions from './PostActions'
import PostHeader from './PostHeader'

// 게시글 한 개 화면: 머리 · 본문 · 좋아요/수정/삭제 · 댓글. 삭제하면 목록으로 돌아간다.
export default function BoardPost({ postId }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const board = useBoardPost(postId, { canLike: isAuthenticated })
  const { post, postLoading, postError, like, likeLoading, toggleLike } = board
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (postLoading) return <CatalogMessage icon="search" title="게시글을 불러오는 중이에요" role="status" />
  if (postError || !post)
    return (
      <CatalogMessage icon="info" title="게시글을 불러오지 못했어요" description={postError} role="alert">
        <Link className="gs-primary-button mt-[16px]" to="/community">
          목록으로
        </Link>
      </CatalogMessage>
    )

  const isOwner = isAuthenticated && user?.id === post.authorId

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return
    setDeleting(true)
    try {
      await deletePost(post.id)
      navigate('/community')
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="max-w-[760px] mx-auto">
      <Link to="/community" className="inline-flex items-center gap-[8px] text-muted whitespace-nowrap text-[13px] shrink-0 bg-transparent p-0 hover:text-text mb-[24px]">
        <GSIcon name="arrowLeft" size={16} />
        목록으로
      </Link>
      <PostHeader post={post} />
      {post.imageUrl && <img className="w-full rounded-xl mb-[18px]" src={post.imageUrl} alt="" />}
      <p className="whitespace-pre-wrap leading-[1.8] text-[16px] mb-[32px]">{post.content}</p>

      <PostActions
        post={post}
        like={like}
        likeLoading={likeLoading}
        toggleLike={toggleLike}
        isAuthenticated={isAuthenticated}
        isOwner={isOwner}
        deleting={deleting}
        onDelete={handleDeletePost}
      />
      {deleteError && (
        <p className="text-[#e5484d] text-[13px] my-[4px]" role="alert">
          {deleteError}
        </p>
      )}

      <CommentSection board={board} user={user} isAuthenticated={isAuthenticated} />
    </article>
  )
}
