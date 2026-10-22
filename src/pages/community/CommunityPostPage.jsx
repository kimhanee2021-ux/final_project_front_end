import { useParams } from 'react-router-dom'
import { BoardPost } from '@/features/board'

// 게시글 보기 (/community/:id)
export default function CommunityPostPage() {
  const { id } = useParams()
  return <BoardPost postId={id} />
}
