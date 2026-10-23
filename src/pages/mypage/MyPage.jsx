import { useState } from 'react'
import { PanelPage, Panel } from '@/shared/ui'
import { ProfileHero, PlayerDialog } from '@/features/player'
import { AccountSettings } from '@/features/user'
import { useAuth } from '@/features/auth'
import GameOverview from './sections/GameOverview'
import GamingEnvironment from './sections/GamingEnvironment'

// 마이페이지: 프로필 · 내 게임 현황 · 게임 환경 · (로그인했으면) 계정 설정. 편집 창은 PlayerDialog 하나를 type으로 바꿔 연다.
export default function MyPage() {
  const [dialog, setDialog] = useState(null)
  const { isAuthenticated } = useAuth()
  return (
    <PanelPage>
      <Panel id="profile">
        <ProfileHero onEdit={type => setDialog({ type })} />
      </Panel>
      <Panel id="games">
        <GameOverview />
      </Panel>
      <Panel id="environment">
        <GamingEnvironment />
      </Panel>
      {isAuthenticated && <AccountSettings />}
      <PlayerDialog dialog={dialog} onClose={() => setDialog(null)} />
    </PanelPage>
  )
}
