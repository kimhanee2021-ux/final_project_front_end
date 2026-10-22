import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnalysisPanel, EmptyState, PageHeading, Panel, PanelPage, TEXT_BUTTON } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { BudgetCard, CoachChat } from '@/features/ai-coach'
import { useMySpendingContext } from '@/features/spending'

const TIPS = [
  '예산을 정하고 "이번 달 예산 안에서 쓰고 있어?"',
  '"주말에 할 만한 거, 안 한 게임 중에서 골라 줘"',
  '"지금 환불할 수 있는 게임 있어?" (14일·2시간 기준)',
]

// AI 게임 소비 코치(/ai-coach): 코치와 대화하는 패널 → 예산 패널 순서. 실제 회원만 이용한다 (데모 체험은 소비 데이터가 없어 안내만).
export default function AiCoachPage() {
  const { isAuthenticated } = useAuth()
  const { data } = useMySpendingContext()
  const hasHistory = Boolean(data?.hasPurchaseHistory)
  // 다른 화면에서 /ai-coach?q=질문 으로 오면 그 질문을 바로 보내고, 새로고침해도 다시 보내지 않게 주소에서 지운다
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuestion = searchParams.get('q')?.trim() || null
  const clearQuestion = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams])

  if (!isAuthenticated) {
    return (
      <PanelPage>
        <Panel>
          <PageHeading title="AI 소비 코치" description="내 스팀 소비와 플레이 기록을 아는 코치에게 물어보세요." />
          <EmptyState
            title="로그인하면 코치를 만날 수 있어요"
            description="스팀 계정을 연동한 회원의 실제 소비 기록으로 답해요. 데모 체험에서는 이용할 수 없어요."
            action={<Link to="/login?next=/ai-coach" className={TEXT_BUTTON}>로그인하기</Link>}
          />
        </Panel>
      </PanelPage>
    )
  }

  return (
    <PanelPage>
      <Panel>
        <PageHeading title="AI 소비 코치" description="지출, 가성비, 다음에 할 게임을 코치 노바에게 물어보세요." />
        <CoachChat
          initialQuestion={initialQuestion}
          onInitialQuestionSent={clearQuestion}
          hasHistory={hasHistory}
        />
      </Panel>
      <Panel>
        <AnalysisPanel eyebrow="이번 달 예산" headline="예산을 정해 두면 노바가 남은 금액을 알려 줘요.">
          <div className="grid grid-cols-2 gap-[32px] items-start max-[760px]:grid-cols-1">
            <BudgetCard />
            <div>
              <h3 className="text-[16px] font-[700]">이렇게 활용해 보세요</h3>
              <ul className="list-none m-0 mt-[14px] p-0 grid gap-[10px] text-[13px] leading-[1.6] text-muted">
                {TIPS.map(tip => <li key={tip}>{tip}</li>)}
              </ul>
              <Link to="/analysis" className={TEXT_BUTTON + ' mt-[14px]'}>AI 분석으로 보기 →</Link>
            </div>
          </div>
        </AnalysisPanel>
      </Panel>
    </PanelPage>
  )
}
