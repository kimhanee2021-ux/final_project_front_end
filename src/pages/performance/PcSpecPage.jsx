import { useMemo } from 'react'
import { PageHeading, PanelPage, Panel, AnalysisPanel } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { hardware as sampleHardware, hasSpecs, mergeHardware, usePcSpecs, HardwareCard, PcSpecButton } from '@/features/performance'
import '@/features/performance/styles/performance.css'

const HOW_TO_STEPS = [
  '"내 사양 입력"을 누르세요.',
  '방법 1: PowerShell 명령어 결과 한 줄을 붙여넣고 "불러오기". 방법 2: 직접 입력. 방법 3: 시스템 정보 사진을 올리면 AI가 읽어줘요(로그인 필요).',
  '저장하면 부품 정보와 종합평가가 내 PC 기준으로 바뀌어요.',
]

// 내 PC 사양: 부품 정보를 보고, 사양을 입력하는 곳. 입력한 사양은 이 브라우저에 저장되고 종합평가가 이어서 보여준다.
export default function PcSpecPage() {
  const { specs } = usePcSpecs()
  const hardware = useMemo(() => mergeHardware(sampleHardware, specs), [specs])
  const custom = hasSpecs(specs)
  const cpu = hardware.find(item => item.id === 'cpu')
  const gpu = hardware.find(item => item.id === 'gpu')
  return (
    <PanelPage>
      <Panel id="spec">
        <PageHeading
          title="내 PC 사양"
          description={custom ? '입력한 사양을 보여주고 있어요.' : '아직 입력한 사양이 없어서 예시 사양을 보여주고 있어요.'}
          action={<PcSpecButton />}
        />
        <AnalysisPanel eyebrow="부품 정보" headline={['내 PC는 ', hl(cpu.model), '와 ', hl(gpu.model), ' 구성이에요.']}>
          <div className="gs-stagger grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
            {hardware.map(item => (
              <HardwareCard key={item.id} item={item} />
            ))}
          </div>
        </AnalysisPanel>
      </Panel>
      <Panel id="how-to">
        <AnalysisPanel eyebrow="사양 입력 방법" headline="내 PC 부품을 알려주는 방법이에요.">
          <ol className="grid gap-[12px] list-decimal pl-[22px] text-[15px] text-muted leading-[1.7]">
            {HOW_TO_STEPS.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-[20px] text-[13px] text-faint">브라우저는 내 PC의 부품을 직접 읽을 수 없어서 이 방식으로 받아요. 입력한 내용은 이 브라우저에만 저장돼요.</p>
        </AnalysisPanel>
      </Panel>
    </PanelPage>
  )
}
