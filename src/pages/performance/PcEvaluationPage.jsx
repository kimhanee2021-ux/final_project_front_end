import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon, PageHeading, PanelPage, Panel, AnalysisPanel } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { hardware as sampleHardware, performanceSummary, hasSpecs, mergeHardware, usePcSpecs, ScorePanel, UpgradeList, GamePerformance, DetailsDialog } from '@/features/performance'
import '@/features/performance/styles/performance.css'

// 내 PC 종합평가: 종합 점수, 게임별 성능, 추천 업그레이드를 패널 하나씩 보여준다.
// 점수와 FPS는 사양을 정확히 분석한 값이 아니라 예시라서, 사양을 입력하지 않았다면 먼저 입력하라고 안내한다.
export default function PcEvaluationPage() {
  const [details, setDetails] = useState(null)
  const { specs } = usePcSpecs()
  const hardware = useMemo(() => mergeHardware(sampleHardware, specs), [specs])
  const custom = hasSpecs(specs)
  return (
    <PanelPage>
      <Panel id="score">
        <PageHeading
          title="내 PC 종합평가"
          description={custom ? '입력한 사양 기준이에요. 점수와 FPS는 예시 계산값입니다.' : '점수와 FPS는 예시 값입니다.'}
        />
        {!custom && (
          <div className="flex items-center justify-between gap-[16px] mb-[32px] p-[20px] rounded-[16px] bg-primary-soft max-[600px]:flex-col max-[600px]:items-start">
            <p className="text-[14px] text-primary-text">아직 내 사양을 입력하지 않아 예시 PC 기준으로 보여주고 있어요. 먼저 사양을 입력해 보세요.</p>
            <Link to="/pc-check" className="gs-primary-button shrink-0">
              <GSIcon name="monitor" size={16} />
              사양 입력하러 가기
            </Link>
          </div>
        )}
        <AnalysisPanel eyebrow="종합 점수" headline={['종합 성능은 ', hl(performanceSummary.label), ' 수준이에요.']}>
          <ScorePanel hardware={hardware} />
        </AnalysisPanel>
      </Panel>
      <Panel id="games">
        <AnalysisPanel eyebrow="게임별 성능" headline={['주요 게임 대부분을 ', hl('60 FPS 이상'), '으로 즐길 수 있어요.']}>
          <GamePerformance onDetails={setDetails} />
        </AnalysisPanel>
      </Panel>
      <Panel id="upgrade">
        <AnalysisPanel eyebrow="추천 업그레이드" headline="더 나은 게임 경험을 위한 제안이에요.">
          <UpgradeList onSelect={item => setDetails({ type: 'upgrade', item })} />
        </AnalysisPanel>
      </Panel>
      <DetailsDialog details={details} onClose={() => setDetails(null)} />
    </PanelPage>
  )
}
