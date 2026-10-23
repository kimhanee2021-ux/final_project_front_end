import { GSIcon } from '@/shared/ui'
import { STEPS } from '../../model/recommendLayout'

// 단계 목록. active가 없으면 순서 안내로, 있으면 그 단계까지 진행 중인 모습으로 그린다.
export default function Steps({ active }) {
  return (
    <ol className="list-none m-0 p-0 flex flex-wrap gap-[10px]">
      {STEPS.map((step, index) => {
        const done = active !== undefined && index < active
        const current = index === active
        return (
          <li
            key={step}
            className={`inline-flex items-center gap-[8px] h-[36px] px-[14px] rounded-full text-[13px] font-[600] transition-colors ${
              current ? 'bg-primary text-on-primary' : done ? 'bg-primary-soft text-primary-text' : 'bg-surface text-muted'
            }`}
          >
            {done ? <GSIcon name="check" size={14} /> : <span className="tabular-nums">{index + 1}</span>}
            {step}
            {current && <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
