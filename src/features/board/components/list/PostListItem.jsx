import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { dateTimeLabel, postAuthorLabel } from '../../model/boardModel'

// 게시글 목록 한 줄: (있으면) 사진 + 제목 + 카테고리·작성자·시간·조회수
export default function PostListItem({ post }) {
  return (
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
  )
}
