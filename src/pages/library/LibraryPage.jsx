import { PanelPage } from '@/shared/ui'
import { SteamLibraryPanel } from '@/features/library'

// 내 스팀 라이브러리: 제목·필터·목록을 각각 카드로 보여준다. 로그인은 라우터의 RequireAuth가 확인한다.
export default function LibraryPage() {
  return (
    <PanelPage>
      <SteamLibraryPanel />
    </PanelPage>
  )
}
