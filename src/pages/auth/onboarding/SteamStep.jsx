import { GSIcon } from '@/shared/ui'
import { rememberOnboarding, useAuth } from '@/features/auth'
import { CARD } from '../shell/authStyles'
import Stepper from '../shell/Stepper'
import Benefit from './Benefit'
import Intro from './Intro'
import { PRIMARY, TEXT } from './onboardingStyles'

// 2단계: 스팀 연동 (필수). 연동이 확인되기 전에는 다음 단계로 넘어갈 수 없다.
export default function SteamStep({ next, status, onRetry }) {
  const { startSteamLink, signOut } = useAuth()
  const loading = status === 'loading'
  const failed = status === 'error'
  // 새 창으로 열리면 이 화면이 그대로여서 따로 기억할 게 없다. 팝업이 막혀 이 창이 스팀으로 넘어가는 경우에만 돌아올 곳을 남긴다.
  const connect = () => startSteamLink({ beforeRedirect: () => rememberOnboarding(next) })
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
