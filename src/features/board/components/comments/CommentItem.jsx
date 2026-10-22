import { useState } from 'react'
import { dateTimeLabel } from '../../model/boardModel'
import CommentForm from './CommentForm'

// 댓글 아래 작은 글자 버튼 (답글 · 수정 · 삭제)
const COMMENT_ACTION = 'inline-flex items-center gap-[8px] text-muted whitespace-nowrap shrink-0 bg-transparent p-0 hover:text-text text-[13px]'

// 댓글 한 개: 작성자·시간·내용 + 답글/수정/삭제. 내 댓글이면 고칠 수 있고, 답글(isReply)은 들여 쓴다.
export default function CommentItem({ comment, isReply, userId, onReply, onEdit, onDelete, replyOpen, onToggleReply }) {
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
          <button type="button" className={COMMENT_ACTION} onClick={onToggleReply}>
            답글
          </button>
        )}
        {isOwner && !editing && (
          <>
            <button type="button" className={COMMENT_ACTION} onClick={() => setEditing(true)}>
              수정
            </button>
            <button type="button" className={COMMENT_ACTION} onClick={() => onDelete(comment.id)}>
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
