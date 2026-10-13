import { Fragment, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useAuth } from '../../features/auth/context/AuthContext'
import { dateTimeLabel, postAuthorLabel } from '../../features/board/boardModel'
import { deletePost } from '../../features/board/api'
import { useBoardPost } from '../../features/board/hooks/useBoardPost'
import { getErrorMessage } from '../../utils/apiClient'
import '../../styles/community.css'

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
    <form className="cm-comment-form" onSubmit={submit}>
      <textarea
        value={content}
        onChange={event => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        rows={2}
        required
      />
      {error && <p className="cm-form-error">{error}</p>}
      <div className="cm-comment-form-actions">
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
    <li className={isReply ? 'cm-comment cm-reply' : 'cm-comment'}>
      <div className="cm-comment-head">
        <strong>{comment.authorNickname}</strong>
        <span>{dateTimeLabel(comment.createdAt)}</span>
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
        <p className="cm-comment-content">{comment.content}</p>
      )}
      <div className="cm-comment-actions">
        {!isReply && (
          <button type="button" className="gs-text-link" onClick={onToggleReply}>
            답글
          </button>
        )}
        {isOwner && !editing && (
          <>
            <button type="button" className="gs-text-link" onClick={() => setEditing(true)}>
              수정
            </button>
            <button type="button" className="gs-text-link" onClick={() => onDelete(comment.id)}>
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

  if (postLoading) {
    return (
      <div className="gs-empty" role="status">
        <GSIcon name="search" size={38} />
        <h3>게시글을 불러오는 중이에요</h3>
      </div>
    )
  }
  if (postError || !post) {
    return (
      <div className="gs-empty" role="alert">
        <GSIcon name="info" size={38} />
        <h3>게시글을 불러오지 못했어요</h3>
        <p>{postError}</p>
        <Link className="gs-primary-button" to="/community">
          목록으로
        </Link>
      </div>
    )
  }

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
    <article className="cm-post-detail">
      <Link to="/community" className="gs-text-link cm-back-link">
        <GSIcon name="arrowLeft" size={16} />
        목록으로
      </Link>
      <header className="cm-post-header">
        <span className="cm-post-category">{post.category}</span>
        {post.tag && <span className="cm-post-tag">#{post.tag}</span>}
        <h1>{post.title}</h1>
        <div className="cm-post-meta">
          <span>{postAuthorLabel(post)}</span>
          <span>{dateTimeLabel(post.createdAt)}</span>
          {post.updatedAt && <span>(수정됨 {dateTimeLabel(post.updatedAt)})</span>}
          <span className="cm-post-views">
            <GSIcon name="eye" size={13} />
            {post.viewCount}
          </span>
        </div>
      </header>
      {post.imageUrl && <img className="cm-post-image" src={post.imageUrl} alt="" />}
      <p className="cm-post-content">{post.content}</p>

      <div className="cm-post-toolbar">
        <button
          type="button"
          className={`gs-secondary-button ${like.liked ? 'is-active' : ''}`}
          onClick={toggleLike}
          disabled={!isAuthenticated || likeLoading}
        >
          <GSIcon name="heart" size={16} />
          좋아요 {like.likeCount}
        </button>
        {isOwner && (
          <div className="cm-post-owner-actions">
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
        <p className="cm-form-error" role="alert">
          {deleteError}
        </p>
      )}

      <section className="cm-comments" aria-labelledby="cm-comments-title">
        <h2 id="cm-comments-title">댓글 {comments.length > 0 ? comments.length : ''}</h2>
        {isAuthenticated ? (
          <CommentForm placeholder="댓글을 입력하세요" onSubmit={content => addComment(content)} />
        ) : (
          <p className="cm-login-note">로그인하면 댓글을 남길 수 있어요.</p>
        )}
        {commentError && (
          <p className="cm-form-error" role="alert">
            {commentError}
          </p>
        )}
        {commentsLoading && !comments.length ? (
          <p className="cm-login-note">댓글을 불러오는 중이에요...</p>
        ) : topLevelComments.length === 0 ? (
          <p className="cm-login-note">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="cm-comment-list">
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
          <div className="gs-load-more">
            <button className="gs-secondary-button" onClick={loadMoreComments} disabled={commentsLoading}>
              댓글 더 보기
            </button>
          </div>
        )}
      </section>
    </article>
  )
}
