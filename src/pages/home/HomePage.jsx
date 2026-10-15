import { useAuth } from '../../features/auth/context/AuthContext'
import { useMySpending } from '../../features/spending/hooks/useMySpending'
import HomeHero from '../../features/games/components/HomeHero'
import HomeGameList from '../../features/games/components/HomeGameList'
import { Recommendations } from '../../features/games/components/HomeWidgets'
import HomeRecentFocus from '../../features/games/components/HomeRecentFocus'
import HomeSpendingPattern from '../../features/games/components/HomeSpendingPattern'

export default function HomePage() {
  const { isAuthenticated, user, startSteamLink } = useAuth()
  // HomeSpendingPattern과 HomeRecentFocus가 같은 실제 소비 데이터를 쓰므로 여기서 한 번만 받아와 내려보낸다
  // (각자 따로 부르면 /api/analysis/spending을 홈 진입마다 두 번 호출하게 된다).
  const { data, loading, notLinked } = useMySpending(user?.id)
  const spendingProps = { isAuthenticated, data, loading, notLinked, startSteamLink }

  return (
    <>
      <HomeHero />
      <div className="grid grid-cols-[minmax(0,1.24fr)_minmax(0,1fr)] gap-[20px] mt-[19px] items-start min-[1600px]:gap-[21px] min-[1600px]:mt-[18px] max-[1350px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] max-[1350px]:gap-[16px] max-[1120px]:grid-cols-1 max-[1120px]:gap-[24px]">
        <HomeGameList />
        <aside className="grid gap-[12px] min-w-0" aria-label="나의 게임 인사이트">
          <HomeSpendingPattern {...spendingProps} />
          <Recommendations />
          <HomeRecentFocus {...spendingProps} />
        </aside>
      </div>
    </>
  )
}
