import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'

// 좋아요 버튼 + (내 글이면) 수정 · 삭제
export default function PostActions({ post, like, likeLoading, toggleLike, isAuthenticated, isOwner, deleting, onDelete }) {
  return (
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
          <button type="button" className="gs-secondary-button" onClick={onDelete} disabled={deleting}>
            <GSIcon name="close" size={16} />
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
