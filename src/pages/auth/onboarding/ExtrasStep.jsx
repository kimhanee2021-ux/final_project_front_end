import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { markOnboardingDone } from '@/features/auth'
import { PurchaseImportDialog } from '@/features/purchase-import'
import { usePcSpecs } from '@/features/performance'
import { CARD } from '../shell/authStyles'
import Stepper from '../shell/Stepper'
import Intro from './Intro'
import OptionalRow from './OptionalRow'
import { PRIMARY, SECONDARY } from './onboardingStyles'

// 3단계: 구매 내역과 PC 사양 (선택). 건너뛰어도 되지만, 넣으면 AI 분석이 늘어난다.
export default function ExtrasStep({ userId, next, hasHistory, onImported }) {
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
