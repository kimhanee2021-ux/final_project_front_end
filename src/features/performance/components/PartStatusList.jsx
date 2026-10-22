import { GSIcon } from '@/shared/ui'

// 판정 이름별 색 점. 교체를 검토할 부품만 눈에 띄게 한다.
const DOT = { '유지 가능': '#3dbb8a', '확인 필요': '#e0a43a', '교체 검토': '#e5484d' }

// 부품별 AI 판정을 한 줄씩: 아이콘 · 부품 이름 · 판정(색 점). 레이더를 읽지 않아도 어느 부품이 문제인지 바로 보인다.
export default function PartStatusList({ judgements }) {
  return (
    <ul className="gs-stagger list-none m-0 mt-[20px] p-0 grid gap-[8px]" aria-label="부품별 AI 판정">
      {judgements.map(item => {
        const label = item.verdict?.label ?? '분석 전'
        const urgent = label === '교체 검토'
        return (
          <li key={item.category} className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[12px] bg-bg">
            <GSIcon name={item.icon} size={18} className="text-muted shrink-0" />
            <span className="text-[14px] font-[600]">{item.label}</span>
            <span className={`ml-auto inline-flex items-center gap-[8px] text-[13px] ${urgent ? 'font-[700] text-text' : 'text-muted'}`}>
              <span className="w-[9px] h-[9px] rounded-full" style={{ background: DOT[label] ?? '#a0a0b2' }} aria-hidden="true" />
              {label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
