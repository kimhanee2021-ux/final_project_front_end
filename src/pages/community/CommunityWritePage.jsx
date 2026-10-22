import { useParams } from 'react-router-dom'
import { PostEditor } from '@/features/board'

// 글쓰기 (/community/new) · 글 수정 (/community/:id/edit)
export default function CommunityWritePage() {
  const { id } = useParams()
  return <PostEditor postId={id} />
}
