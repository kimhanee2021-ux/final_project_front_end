import { PanelPage } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { useSteamLibrary } from '@/features/library'
import { AiRecommendsPanel } from '@/features/ai-recommends'

// AI 게임 추천: AI가 읽은 취향 · TOP 3 영역과 나머지 추천 목록 카드. 로그인은 라우터의 RequireAuth가 확인한다.
// 취향을 만든 게임(플레이시간 상위)을 보여주려고 내 스팀 라이브러리를 함께 넘긴다.
export default function AiRecommendsPage() {
  const { user } = useAuth()
  const { games } = useSteamLibrary(user?.id)
  return (
    <PanelPage>
      <AiRecommendsPanel libraryGames={games} />
    </PanelPage>
  )
}
