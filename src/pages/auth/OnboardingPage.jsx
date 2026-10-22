import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useAuth, safeReturnTo } from '@/features/auth'
import { MySpendingProvider, useMySpendingContext, useSpendingStatus } from '@/features/spending'
import { PurchaseImportDialog } from '@/features/purchaseImport'
import { usePcSpecs } from '@/features/performance'
import AuthShell, { CARD, Stepper } from './AuthShell'
import { forgetOnboarding, isOnboardingDone, markOnboardingDone, rememberOnboarding } from './onboardingFlow'

// 가입 직후 "내 게임 라이프"를 시작하는 곳. 로그인 주소 '/'는 랜딩이라 기본 목적지는 내 라이브러리로 둔다.
const DEFAULT_NEXT = '/library'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-auth-mint focus-visible:outline-offset-[4px]'
const PRIMARY = `flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-auth-mint ${focusRing}`
const SECONDARY = `inline-flex items-center justify-center gap-[8px] min-h-[40px] px-[16px] rounded-[10px] border border-[#ffffff33] bg-[#ffffff0d] text-[13px] font-[600] text-auth-text hover:border-auth-mint hover:text-auth-mint ${focusRing}`
const TEXT = `bg-transparent text-[12px] text-auth-muted underline underline-offset-[4px] hover:text-auth-mint ${focusRing}`

function Intro({ eyebrow, title, children }) {
  return (
    <section className="auth-enter-copy max-[900px]:hidden" aria-label="안내">
      <p className="text-[#b9d5c5] text-[11px] font-[600] tracking-[3px]">{eyebrow}</p>
      <h2 className="mt-[22px] text-[clamp(34px,4vw,60px)] font-[400] leading-[1.35] tracking-[-2.6px] break-keep text-[#e8ece6] [text-shadow:0_2px_22px_#10171b55]">{title}</h2>
      <div className="mt-[24px] text-[14px] font-[300] leading-[2] text-[#d5ded6] break-keep">{children}</div>
    </section>
  )
}

function Benefit({ icon, children }) {
  return (
    <li className="flex items-start gap-[12px] text-[13px] leading-[1.7] text-[#c8d4cc]">
      <GSIcon name={icon} size={18} className="text-[#b9dcc8] mt-[3px] shrink-0" />
      <span>{children}</span>
    </li>
  )
}

// 선택 항목 한 줄. 끝낸 항목은 체크 표시로 바뀐다.
function OptionalRow({ icon, title, text, done, children }) {
  return (
    <div className="flex items-center gap-[14px] p-[16px] rounded-[14px] border border-[#ffffff1f] bg-[#ffffff08] max-[520px]:flex-wrap">
      <span className={`grid place-items-center w-[42px] h-[42px] rounded-[12px] shrink-0 ${done ? 'bg-auth-mint text-[#062c23]' : 'bg-[#ffffff12] text-[#b9dcc8]'}`}>
        <GSIcon name={done ? 'check' : icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-[650]">{title}</p>
        <p className="text-[12px] text-auth-muted leading-[1.6] mt-[3px] break-keep">{text}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// 2단계: 스팀 연동 (필수). 연동이 확인되기 전에는 다음 단계로 넘어갈 수 없다.
function SteamStep({ next, status, onRetry }) {
  const { startSteamLink, signOut } = useAuth()
  const loading = status === 'loading'
  const failed = status === 'error'
  const connect = () => {
    rememberOnboarding(next)
    startSteamLink()
  }
  return (
    <>
      <Intro eyebrow="STEP 2 · STEAM" title={<>보유 게임을 불러와야<br /><em className="not-italic text-[#b9d5c5]">분석이 시작돼요.</em></>}>
        GameSense의 소비 패턴 분석, AI 추천, 코치 노바는<br />모두 스팀 보유 게임과 플레이 시간을 바탕으로 해요.
      </Intro>
      <section className="flex items-center justify-center min-w-0" aria-labelledby="onboarding-title">
        <div className={CARD}>
          <Stepper current={2} />
          <p className="text-[#6af6d3] text-[11px] font-[750] tracking-[3px]">REQUIRED</p>
          <h1 className="text-[clamp(26px,2.2vw,34px)] leading-[1.3] tracking-[-1.3px] mt-[16px] mb-[12px] font-[650] break-keep max-[420px]:text-[26px]" id="onboarding-title">스팀 계정을 연동해 주세요</h1>
          <p className="text-[14px] text-auth-muted leading-[1.75] break-keep">스팀 로그인 창으로 이동했다가 돌아와요. 연동을 마쳐야 다음 단계로 넘어갈 수 있어요.</p>
          <ul className="list-none p-0 mt-[24px] grid gap-[12px]">
            <Benefit icon="library">내 보유 게임과 플레이 시간을 자동으로 불러와요.</Benefit>
            <Benefit icon="chart">시간당 비용, 안 해본 게임 등 소비 패턴을 분석해요.</Benefit>
            <Benefit icon="shield">스팀 비밀번호는 GameSense가 받지 않아요. 스팀 공식 로그인(OpenID)을 사용해요.</Benefit>
          </ul>
          <div className="mt-[28px] grid gap-[12px]">
            <button type="button" className={PRIMARY} onClick={connect} disabled={loading || failed}>
              <GSIcon name="steam" size={22} />
              {loading ? '연동 상태 확인 중...' : 'Steam 계정 연동하기'}
            </button>
            <button type="button" className={PRIMARY} disabled aria-disabled="true">
              다음 단계로<GSIcon name="arrow" size={20} />
            </button>
            <p className="flex items-start justify-center gap-[7px] text-[12px] text-[#8fa0b3]" role="status">
              <GSIcon name="lock" size={14} className="mt-[2px] shrink-0" />
              스팀 연동을 마치면 열려요
            </p>
          </div>
          {failed && (
            <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#5a3a3d] rounded-[9px] bg-[#2a1618] text-[12px] leading-[1.7] text-[#f0c4c6] mt-[18px]" role="alert">
              <GSIcon name="info" size={18} className="mt-[2px] shrink-0" />
              <span>연동 상태를 확인하지 못했어요. <button type="button" className="underline bg-transparent" onClick={onRetry}>다시 시도</button></span>
            </p>
          )}
          <p className="text-center mt-[22px]"><button type="button" className={TEXT} onClick={signOut}>다른 계정으로 로그인</button></p>
        </div>
      </section>
    </>
  )
}

// 3단계: 구매 내역과 PC 사양 (선택). 건너뛰어도 되지만, 넣으면 AI 분석이 늘어난다.
function ExtrasStep({ userId, next, hasHistory, onImported }) {
  const navigate = useNavigate()
  const { hasSavedSpecs, openSpecDialog } = usePcSpecs()
  const [importOpen, setImportOpen] = useState(false)
  const finish = () => {
    markOnboardingDone(userId)
    navigate(next, { replace: true })
  }
  return (
    <>
      <Intro eyebrow="STEP 3 · OPTIONAL" title={<>조금 더 알려주면,<br /><em className="not-italic text-[#b9d5c5]">AI가 더 깊이 봐요.</em></>}>
        구매 내역을 넣으면 실제 결제액 기준으로, PC 사양을 넣으면<br />내 컴퓨터에서 잘 돌아갈 게임까지 분석할 수 있어요.
      </Intro>
      <section className="flex items-center justify-center min-w-0" aria-labelledby="onboarding-title">
        <div className={CARD}>
          <Stepper current={3} />
          <p className="text-[#6af6d3] text-[11px] font-[750] tracking-[3px]">STEAM 연동 완료</p>
          <h1 className="text-[clamp(26px,2.2vw,34px)] leading-[1.3] tracking-[-1.3px] mt-[16px] mb-[12px] font-[650] break-keep max-[420px]:text-[26px]" id="onboarding-title">더 많은 AI 분석을 열어볼까요?</h1>
          <div className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] break-keep">
            <GSIcon name="spark" size={18} className="mt-[2px] shrink-0" />
            <div className="min-w-0">
              <p>구매 내역이나 PC 사양을 입력하면 더 많은 AI 분석 기능을 사용할 수 있어요.</p>
              <p className="mt-[2px] text-[#8fb5a8]">지금 건너뛰어도 나중에 언제든 추가할 수 있어요.</p>
            </div>
          </div>
          <div className="mt-[22px] grid gap-[12px]">
            <OptionalRow icon="wallet" title="스팀 구매 내역" text="실제 결제액과 구매일로 소비 분석이 정확해지고, 코치 노바가 가성비를 짚어 줘요." done={hasHistory}>
              <button type="button" className={SECONDARY} onClick={() => setImportOpen(true)}>{hasHistory ? '다시 가져오기' : '가져오기'}</button>
            </OptionalRow>
            <OptionalRow icon="monitor" title="내 PC 사양" text="내 PC에서 잘 돌아갈 게임과 업그레이드 추천을 받아요. 입력한 사양은 이 브라우저에만 저장돼요." done={hasSavedSpecs}>
              <button type="button" className={SECONDARY} onClick={openSpecDialog}>{hasSavedSpecs ? '수정하기' : '입력하기'}</button>
            </OptionalRow>
          </div>
          <div className="mt-[26px] grid gap-[10px]">
            <button type="button" className={PRIMARY} onClick={finish}>
              {hasHistory || hasSavedSpecs ? 'GameSense 시작하기' : '지금은 건너뛰고 시작하기'}<GSIcon name="arrow" size={20} />
            </button>
          </div>
        </div>
      </section>
      <PurchaseImportDialog open={importOpen} hasHistory={hasHistory} onClose={() => setImportOpen(false)} onImported={onImported} />
    </>
  )
}

function Onboarding() {
  const { user } = useAuth()
  const { reload, data } = useMySpendingContext()
  const { status } = useSpendingStatus()
  // 구매 내역을 가져오면 데이터를 다시 받는 동안 status가 잠깐 loading이 된다. 3단계에 한 번 들어왔으면 그대로 둔다.
  const [linked, setLinked] = useState(false)
  if (status === 'ready' && !linked) setLinked(true)
  const [params] = useSearchParams()
  const requested = safeReturnTo(params.get('next'))
  const next = requested === '/' ? DEFAULT_NEXT : requested

  useEffect(() => {
    const previous = document.title
    document.title = '시작하기 | GameSense'
    forgetOnboarding()
    return () => { document.title = previous }
  }, [])

  // 이미 연동과 추가 정보 단계를 마친 계정은 로그인하자마자 원래 가려던 곳으로 간다.
  if (status === 'ready' && isOnboardingDone(user.id)) return <Navigate to={next} replace />

  return (
    <AuthShell>
      {linked ? (
        <ExtrasStep userId={user.id} next={next} hasHistory={Boolean(data?.hasPurchaseHistory)} onImported={reload} />
      ) : (
        <SteamStep next={next} status={status} onRetry={reload} />
      )}
    </AuthShell>
  )
}

// 로그인한 사람만 들어오는 화면(RequireAuth 안). 스팀 연동 상태는 소비 분석 데이터에서 읽어 온다.
export default function OnboardingPage() {
  return (
    <MySpendingProvider>
      <Onboarding />
    </MySpendingProvider>
  )
}
