import { GSIcon } from '@/shared/ui'

const STEPS = ['계정', '스팀 연동', '추가 정보']

// 1 계정 → 2 스팀 연동 → 3 추가 정보. current는 지금 단계 번호(1~3).
export default function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-[10px] list-none p-0 m-0 mb-[26px] text-[12px]" aria-label="가입 진행 단계">
      {STEPS.map((label, index) => {
        const number = index + 1
        const done = number < current
        const active = number === current
        return (
          <li key={label} className="flex items-center gap-[10px]" aria-current={active ? 'step' : undefined}>
            <span className={`grid place-items-center w-[24px] h-[24px] rounded-full text-[11px] font-[700] ${done ? 'bg-auth-mint text-[#062c23]' : active ? 'border border-auth-mint text-auth-mint' : 'border border-[#ffffff33] text-[#8fa0b3]'}`}>
              {done ? <GSIcon name="check" size={13} /> : number}
            </span>
            <span className={active ? 'text-auth-text font-[600]' : 'text-[#8fa0b3]'}>{label}</span>
            {number < STEPS.length && <span className="w-[18px] h-px bg-[#ffffff2a] max-[420px]:w-[8px]" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
