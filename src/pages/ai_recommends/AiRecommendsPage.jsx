import { PanelPage } from '@/shared/ui'
import { AiRecommendsPanel } from '@/features/ai_recommends'

// AI 게임 추천: 제목·개수 선택 카드와 추천 게임 목록 카드. 로그인은 라우터의 RequireAuth가 확인한다.
export default function AiRecommendsPage() {
  return (
    <PanelPage>
      <AiRecommendsPanel />
    </PanelPage>
  )
}
