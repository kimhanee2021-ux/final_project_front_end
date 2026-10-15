import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { authLink } from '../../auth/authSession'
import { useMySpending } from '../../spending/hooks/useMySpending'
import { recentFocus } from '../../spending/spendingModel'
import { number } from '../../../utils/formatters'
import GSIcon from '../../../components/common/GSIcon'

function Shell({ children }) {
  return (
    <section
      className="min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] p-[15px_16px] min-[1600px]:p-[16px_18px] max-[1350px]:p-[13px] max-[1120px]:p-[18px] max-[600px]:p-[16px]"
      aria-labelledby="gs-recent-title"
    >
      <div className="flex items-center gap-[10px] mb-[12px] max-[1350px]:gap-[8px]">
        <span className="flex shrink-0 self-start pt-[1px]">
          <GSIcon name="clock" size={23} />
        </span>
        <h2 className="text-[14px] font-[660] tracking-[-0.3px] leading-[1.3]" id="gs-recent-title">최근 활동</h2>
      </div>
      {children}
    </section>
  )
}

// 홈의 "최근 활동" 위젯. 분석탭(MySpendingAnalysis)과 같은 recentFocus() 신호를 그대로 써서
// "요즘 가장 많이 플레이한 게임"을 보여준다. 로그인/스팀 연동이 안 돼 있으면 그 상태를 안내한다.
export default function HomeRecentFocus() {
  const { isAuthenticated, user, startSteamLink } = useAuth()
  const { data, loading, notLinked } = useMySpending(user?.id)

  if (!isAuthenticated) {
    return (
      <Shell>
        <p className="text-[11px] text-gs-muted leading-[1.7] mb-[12px]">로그인하면 최근 플레이한 게임을 보여드려요.</p>
        <Link
          to={authLink('login', '/')}
          className="inline-flex items-center gap-[8px] text-[11px] font-[650] text-gs-mint hover:underline"
        >
          로그인하기
          <GSIcon name="arrow" size={15} />
        </Link>
      </Shell>
    )
  }

  if (loading) {
    return (
      <Shell>
        <div className="h-[52px] rounded-[8px] bg-gs-raised animate-pulse" />
      </Shell>
    )
  }

  if (notLinked) {
    return (
      <Shell>
        <p className="text-[11px] text-gs-muted leading-[1.7] mb-[12px]">스팀 계정을 연동하면 최근 플레이한 게임을 보여드려요.</p>
        <button
          type="button"
          className="inline-flex items-center gap-[8px] bg-transparent p-0 text-[11px] font-[650] text-gs-mint hover:underline"
          onClick={startSteamLink}
        >
          Steam 계정 연동하기
          <GSIcon name="arrow" size={15} />
        </button>
      </Shell>
    )
  }

  const game = data ? recentFocus(data.games) : null
  if (!game) {
    return (
      <Shell>
        <p className="text-[11px] text-gs-muted leading-[1.7]">최근 2주 동안 플레이 기록이 없어요.</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <Link to="/analysis" className="group flex items-center gap-[13px] min-w-0">
        {game.thumbnailUrl && (
          <img
            className="w-[52px] h-[52px] rounded-[8px] object-cover shrink-0"
            src={game.thumbnailUrl}
            alt=""
            loading="lazy"
          />
        )}
        <span className="min-w-0">
          <strong className="block text-[12px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-gs-mint">
            {game.name}
          </strong>
          <span className="block text-[10px] text-gs-muted mt-[4px]">
            최근 2주 동안 {number(game.recentHours)}시간 플레이했어요
          </span>
        </span>
      </Link>
    </Shell>
  )
}
