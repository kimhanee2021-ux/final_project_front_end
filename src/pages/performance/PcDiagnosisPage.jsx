import { useEffect, useState } from 'react'
import { PageHeading, PanelPage, Panel, AnalysisPanel } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { useSharedPcEvaluation, PcPartsPanel, PcSpecButton, ScorePanel, UpgradeList, GamePerformance, DetailsDialog } from '@/features/performance'
import '@/features/performance/styles/performance.css'
import '@/features/performance/styles/pcDiagnosis.css'

// AI PC 진단: 맨 위에 AI가 진단한 종합 등급, 그 아래로 내 부품 정보(입력한 사양) → 게임별 성능 → 개선 방향이 이어진다.
// 사양 입력 버튼은 제목 줄에 한 번만 둔다. 사양이 없으면 부품 정보 칸이 입력 방법을 안내한다.
// 입력한 사양을 AI가 분석한 결과이고, 로그인·동의가 없으면 각 칸에서 확인할 수 없다고 안내한다.
export default function PcDiagnosisPage() {
  const [details, setDetails] = useState(null)
  // 분석 결과는 PcEvaluationProvider가 들고 있어서 이 화면을 다시 열어도 그대로 보인다.
  const evaluation = useSharedPcEvaluation()
  const { ready, grade, judgements, activate } = evaluation
  useEffect(() => {
    activate()
  }, [activate])
  const upgradeCount = judgements.filter(item => item.verdict?.label === '교체 검토').length

  return (
    <PanelPage>
      <Panel id="score">
        <PageHeading
          title="AI PC 진단"
          description={ready ? undefined : '사양을 입력하고 로그인하면 AI가 내 PC를 진단해요.'}
          action={<PcSpecButton />}
        />
        <AnalysisPanel
          eyebrow="종합 등급"
          headline={ready && grade.grade ? ['내 PC의 종합 등급은 ', hl(`${grade.grade} · ${grade.band.status}`), '이에요.'] : '내 PC의 종합 등급이에요.'}
        >
          <ScorePanel evaluation={evaluation} />
        </AnalysisPanel>
      </Panel>
      <Panel id="parts">
        <PcPartsPanel />
      </Panel>
      <Panel id="games">
        <AnalysisPanel eyebrow="게임별 성능" headline="내 PC로 게임을 얼마나 즐길 수 있는지 살펴봐요.">
          <GamePerformance evaluation={evaluation} onDetails={setDetails} />
        </AnalysisPanel>
      </Panel>
      <Panel id="upgrade">
        <AnalysisPanel
          eyebrow="개선·업그레이드"
          headline={ready && upgradeCount ? ['교체를 검토할 부품이 ', hl(`${upgradeCount}개`), ' 있어요.'] : '부품별 개선 방향이에요.'}
        >
          <UpgradeList evaluation={evaluation} onSelect={item => setDetails({ type: 'upgrade', item })} />
        </AnalysisPanel>
      </Panel>
      <DetailsDialog details={details} evaluation={evaluation} onClose={() => setDetails(null)} />
    </PanelPage>
  )
}
