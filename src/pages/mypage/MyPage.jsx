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
  // 수정 창에서 예산을 저장하면 프로필 요약이 새 값을 다시 읽도록 ProfileHero를 새로 그린다.
  const [heroKey, setHeroKey] = useState(0)
  return (
    <PanelPage>
      <Panel id="profile">
        <ProfileHero key={heroKey} onEdit={type => setDialog({ type })} />
      </Panel>
      <Panel id="games">
        <GameOverview />
      </Panel>
      <Panel id="environment">
        <GamingEnvironment />
      </Panel>
      {isAuthenticated && <AccountSettings />}
      <PlayerDialog dialog={dialog} onBudgetSaved={() => setHeroKey(key => key + 1)} onClose={() => setDialog(null)} />
    </PanelPage>
  )
}
