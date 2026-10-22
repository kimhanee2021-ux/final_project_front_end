import { Fragment, useState } from 'react'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

// 게시글 댓글 영역: 댓글 쓰기(로그인 시) + 댓글과 그 답글 목록 + 더 보기. 답글 입력 칸은 한 번에 하나만 연다.
// board: useBoardPost가 돌려준 댓글 상태와 동작
export default function CommentSection({ board, user, isAuthenticated }) {
  const { comments, commentsLast, commentsLoading, commentError, loadMoreComments, addComment, editComment, removeComment } = board
  const [replyTargetId, setReplyTargetId] = useState(null)
  const topLevelComments = comments.filter(comment => !comment.parentId)
  const repliesOf = parentId => comments.filter(comment => comment.parentId === parentId)
  return (
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
  )
}
