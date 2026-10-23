import { AnalysisPanel } from '@/shared/ui'
import { hl } from '@/shared/utils/headline'
import { hardwareFromSpecs, hasSpecs } from '../../model/pcSpecs'
import { usePcSpecs } from '../../hooks/usePcSpecs'
import HardwareCard from './HardwareCard'

const HOW_TO_STEPS = [
  '"내 사양 입력"을 누르세요.',
  '방법 1: PowerShell 명령어 결과 한 줄을 붙여넣고 "불러오기". 방법 2: 직접 입력. 방법 3: 시스템 정보 사진을 올리면 AI가 읽어줘요(로그인 필요).',
  '저장하면 AI가 입력한 사양 기준으로 내 PC를 진단해요.',
]

// 내 부품 정보: 입력한 사양이 있으면 부품 카드를, 없으면 사양을 입력하는 방법을 보여준다.
// 입력한 사양은 이 브라우저에 저장되고, 위의 AI 진단이 이 사양을 기준으로 분석한다.
export default function PcPartsPanel() {
  const { specs } = usePcSpecs()
  if (!hasSpecs(specs))
    return (
      <AnalysisPanel eyebrow="사양 입력 방법" headline="내 PC 부품을 알려주면 AI가 진단해요.">
        <ol className="grid gap-[12px] list-decimal pl-[22px] text-[15px] text-muted leading-[1.7]">
          {HOW_TO_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </AnalysisPanel>
    )
  const hardware = hardwareFromSpecs(specs)
  const cpu = hardware.find(item => item.id === 'cpu').model
  const gpu = hardware.find(item => item.id === 'gpu').model
  const headline = cpu && gpu ? ['내 PC는 ', hl(cpu), '와 ', hl(gpu), ' 구성이에요.'] : '입력한 부품 정보예요.'
  return (
    <AnalysisPanel eyebrow="내 부품 정보" headline={headline}>
      <div className="gs-stagger grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
        {hardware.map(item => (
          <HardwareCard key={item.id} item={item} />
        ))}
      </div>
    </AnalysisPanel>
  )
}
