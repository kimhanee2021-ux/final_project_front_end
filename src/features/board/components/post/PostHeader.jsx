import { GSIcon } from '@/shared/ui'
import { dateTimeLabel, postAuthorLabel } from '../../model/boardModel'

// 게시글 머리: 카테고리·태그, 제목, 작성자·작성(수정) 시간·조회수
export default function PostHeader({ post }) {
  return (
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
  )
}
