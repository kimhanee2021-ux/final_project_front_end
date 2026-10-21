import { PageHeading, PanelPage, Panel, AnalysisPanel, EmptyState } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { hardwareFromSpecs, hasSpecs, usePcSpecs, HardwareCard, PcSpecButton } from '@/features/performance'
import '@/features/performance/styles/performance.css'

const HOW_TO_STEPS = [
  '"내 사양 입력"을 누르세요.',
  '방법 1: PowerShell 명령어 결과 한 줄을 붙여넣고 "불러오기". 방법 2: 직접 입력. 방법 3: 시스템 정보 사진을 올리면 AI가 읽어줘요(로그인 필요).',
  '저장하면 내 PC 종합평가가 입력한 사양 기준으로 분석돼요.',
]

// 내 PC 사양: 입력한 부품 정보를 보고, 사양을 입력하는 곳. 입력한 사양은 이 브라우저에 저장되고 종합평가가 이어서 보여준다.
export default function PcSpecPage() {
  const { specs } = usePcSpecs()
  const hardware = hardwareFromSpecs(specs)
  const entered = hasSpecs(specs)
  const cpu = hardware.find(item => item.id === 'cpu').model
  const gpu = hardware.find(item => item.id === 'gpu').model
  const headline = cpu && gpu ? ['내 PC는 ', hl(cpu), '와 ', hl(gpu), ' 구성이에요.'] : '입력한 부품 정보예요.'
  return (
    <PanelPage>
      <Panel id="spec">
        <PageHeading
          title="내 PC 사양"
          description={entered ? '입력한 사양을 보여주고 있어요.' : '아직 입력한 사양이 없어요. 사양을 입력하면 부품 정보가 여기에 나와요.'}
          action={<PcSpecButton />}
        />
        {entered ? (
          <AnalysisPanel eyebrow="부품 정보" headline={headline}>
            <div className="gs-stagger grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
              {hardware.map(item => (
                <HardwareCard key={item.id} item={item} />
              ))}
            </div>
          </AnalysisPanel>
        ) : (
          <EmptyState title="입력한 사양이 없어요" description="위의 “내 사양 입력” 버튼으로 CPU, GPU, RAM, 저장장치를 알려주세요." />
        )}
      </Panel>
      <Panel id="how-to">
        <AnalysisPanel eyebrow="사양 입력 방법" headline="내 PC 부품을 알려주는 방법이에요.">
          <ol className="grid gap-[12px] list-decimal pl-[22px] text-[15px] text-muted leading-[1.7]">
            {HOW_TO_STEPS.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </AnalysisPanel>
      </Panel>
    </PanelPage>
  )
}
