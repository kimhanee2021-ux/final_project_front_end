import { Fragment, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { CatalogMessage } from '@/features/games'
import { useAuth } from '@/features/auth'
import { dateTimeLabel, postAuthorLabel, deletePost, useBoardPost } from '@/features/board'
import { getErrorMessage } from '@/shared/lib/apiClient'

function CommentForm({ onSubmit, onCancel, placeholder, submitLabel = '등록' }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent('')
      onCancel?.()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form className="flex flex-col gap-[10px] mt-[10px]" onSubmit={submit}>
      <textarea
        value={content}
        onChange={event => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        rows={2}
        required
        className="w-full resize-y px-[16px] py-[12px] border-0 rounded-[16px] bg-bg text-text text-[14px] [font-family:inherit]"
      />
      {error && <p className="text-[#e5484d] text-[13px] my-[4px]">{error}</p>}
      <div className="flex justify-end gap-[8px]">
        {onCancel && (
          <button type="button" className="gs-secondary-button" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="gs-primary-button" disabled={submitting} aria-busy={submitting}>
          {submitting ? '등록 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function CommentItem({ comment, isReply, userId, onReply, onEdit, onDelete, replyOpen, onToggleReply }) {
  const [editing, setEditing] = useState(false)
  const isOwner = userId != null && comment.authorId === userId
  return (
    <li
      className={`py-[18px] border-b border-border last:border-0 ${isReply ? 'ml-[28px]' : ''}`}
    >
      <div className="flex items-center gap-[10px] mb-[6px]">
        <strong className="text-[14px]">{comment.authorNickname}</strong>
        <span className="text-[12px] text-faint">{dateTimeLabel(comment.createdAt)}</span>
      </div>
      {editing ? (
        <CommentForm
          submitLabel="수정"
          placeholder="댓글을 입력하세요"
          onSubmit={async content => {
            await onEdit(comment.id, content)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p className="text-[15px] leading-[1.7] whitespace-pre-wrap">{comment.content}</p>
      )}
      <div className="flex gap-[12px] mt-[8px]">
        {!isReply && (
          <button type="button" className="inline-flex items-center gap-[8px] text-muted whitespace-nowrap shrink-0 bg-transparent p-0 hover:text-text text-[13px]" onClick={onToggleReply}>
            답글
          </button>
        )}
        {isOwner && !editing && (
          <>
            <button type="button" className="inline-flex items-center gap-[8px] text-muted whitespace-nowrap shrink-0 bg-transparent p-0 hover:text-text text-[13px]" onClick={() => setEditing(true)}>
              수정
            </button>
            <button type="button" className="inline-flex items-center gap-[8px] text-muted whitespace-nowrap shrink-0 bg-transparent p-0 hover:text-text text-[13px]" onClick={() => onDelete(comment.id)}>
              삭제
            </button>
          </>
        )}
      </div>
      {replyOpen && (
        <CommentForm placeholder="답글을 입력하세요" onSubmit={onReply} onCancel={onToggleReply} />
      )}
    </li>
  )
}

export default function CommunityPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const {
    post,
    postLoading,
    postError,
    comments,
    commentsLast,
    commentsLoading,
    commentError,
    loadMoreComments,
    addComment,
    editComment,
    removeComment,
    like,
    likeLoading,
    toggleLike,
  } = useBoardPost(id, { canLike: isAuthenticated })
  const [replyTargetId, setReplyTargetId] = useState(null)
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
  const topLevelComments = comments.filter(comment => !comment.parentId)
  const repliesOf = parentId => comments.filter(comment => comment.parentId === parentId)

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
      <header className="flex flex-col gap-[10px] mb-[18px]">
        <p className="text-[13px] text-muted">
          {post.category}
          {post.tag && <span className="ml-[8px] text-faint">#{post.tag}</span>}
        </p>
        <h1 className="!m-0 text-[28px] font-[750] tracking-[-0.8px] leading-[1.35]">{post.title}</h1>
        <div className="flex items-center gap-[10px] text-faint text-[13px]">
          <span>{postAuthorLabel(post)}</span>
          <span>{dateTimeLabel(post.createdAt)}</span>
          {post.updatedAt && <span>(수정됨 {dateTimeLabel(post.updatedAt)})</span>}
          <span className="inline-flex items-center gap-[4px]">
            <GSIcon name="eye" size={13} />
            {post.viewCount}
          </span>
        </div>
      </header>
      {post.imageUrl && <img className="w-full rounded-xl mb-[18px]" src={post.imageUrl} alt="" />}
      <p className="whitespace-pre-wrap leading-[1.8] text-[16px] mb-[32px]">{post.content}</p>

      <div className="flex items-center justify-between gap-[12px] py-[16px] border-t border-b border-border mb-[36px]">
        <button
          type="button"
          className={`gs-secondary-button ${like.liked ? 'bg-gs-accent! text-gs-on-accent!' : ''}`}
          onClick={toggleLike}
          disabled={!isAuthenticated || likeLoading}
        >
          <GSIcon name="heart" size={16} className={like.liked ? 'fill-gs-on-accent' : ''} />
          좋아요 {like.likeCount}
        </button>
        {isOwner && (
          <div className="flex gap-[8px]">
            <Link to={`/community/${post.id}/edit`} className="gs-secondary-button">
              <GSIcon name="edit" size={16} />
              수정
            </Link>
            <button type="button" className="gs-secondary-button" onClick={handleDeletePost} disabled={deleting}>
              <GSIcon name="close" size={16} />
              삭제
            </button>
          </div>
        )}
      </div>
      {deleteError && (
        <p className="text-[#e5484d] text-[13px] my-[4px]" role="alert">
          {deleteError}
        </p>
      )}

      <section aria-labelledby="cm-comments-title">
        <h2 id="cm-comments-title" className="text-[18px] font-[700] mb-[16px]">댓글 {comments.length > 0 ? comments.length : ''}</h2>
        {isAuthenticated ? (
          <CommentForm placeholder="댓글을 입력하세요" onSubmit={content => addComment(content)} />
        ) : (
          <p className="text-muted text-[14px] py-[10px]">로그인하면 댓글을 남길 수 있어요.</p>
        )}
        {commentError && (
          <p className="text-[#e5484d] text-[13px] my-[4px]" role="alert">
            {commentError}
          </p>
        )}
        {commentsLoading && !comments.length ? (
          <p className="text-muted text-[14px] py-[10px]">댓글을 불러오는 중이에요...</p>
        ) : topLevelComments.length === 0 ? (
          <p className="text-muted text-[14px] py-[10px]">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="flex flex-col mt-[8px] list-none p-0">
            {topLevelComments.map(comment => (
              <Fragment key={comment.id}>
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  userId={user?.id}
                  replyOpen={replyTargetId === comment.id}
                  onToggleReply={() => setReplyTargetId(current => (current === comment.id ? null : comment.id))}
                  onReply={content => addComment(content, comment.id)}
                  onEdit={editComment}
                  onDelete={removeComment}
                />
                {repliesOf(comment.id).map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply
                    userId={user?.id}
                    onEdit={editComment}
                    onDelete={removeComment}
                  />
                ))}
              </Fragment>
            ))}
          </ul>
        )}
        {!commentsLast && (
          <div className="flex justify-center p-[26px_0_8px]">
            <button className="gs-secondary-button" onClick={loadMoreComments} disabled={commentsLoading}>
              댓글 더 보기
            </button>
          </div>
        )}
      </section>
    </article>
  )
}
