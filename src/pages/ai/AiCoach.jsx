import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import { useAuth } from '../../features/auth/context/AuthContext'
import CoachChat from '../../features/ai-coach/components/CoachChat'
import BudgetCard from '../../features/ai-coach/components/BudgetCard'
import { TEXT_BUTTON } from '../../features/spending/styles'

// AI 게임 소비 코치 (/ai-coach). 실제 회원만 이용한다 (데모 체험은 소비 데이터가 없어 안내만).
export default function AiCoach() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      <div className="pt-[26px] mb-[26px] max-[600px]:pt-[22px]">
        <span className="text-primary-text text-[9px] tracking-[2px] font-[650]">AI SPENDING COACH</span>
        <h1>AI 게임 소비 코치</h1>
        <p className="text-muted text-[11px]">내 스팀 소비와 플레이 기록을 아는 코치에게 지출, 가성비, 다음에 할 게임을 물어보세요.</p>
      </div>
      {!isAuthenticated ? (
        <EmptyState
          title="로그인하면 코치를 만날 수 있어요"
          description="스팀 계정을 연동한 회원의 실제 소비 기록으로 답해요. 데모 체험에서는 이용할 수 없어요."
          action={<Link to="/login?next=/ai-coach" className={TEXT_BUTTON}>로그인하기</Link>}
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-[20px] items-start max-[1000px]:grid-cols-1">
          <CoachChat />
          <div className="grid gap-[20px]">
            <BudgetCard />
            <Card title="이렇게 활용해 보세요">
              <ul className="list-none m-0 mt-[14px] p-0 grid gap-[10px] text-[12px] leading-[1.6]">
                <li>💸 예산을 정하고 "이번 달 예산 안에서 쓰고 있어?"</li>
                <li>🎮 "주말에 할 만한 거, 안 한 게임 중에서 골라 줘"</li>
                <li>🔁 "지금 환불할 수 있는 게임 있어?" (14일·2시간 기준)</li>
              </ul>
              <Link to="/analysis" className={TEXT_BUTTON + ' mt-[14px]'}>소비 패턴 차트로 보기 →</Link>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
