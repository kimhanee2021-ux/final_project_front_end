import { GSIcon } from '@/shared/ui'
import { RESOLUTIONS } from '../../model/pcResolutions'

// 평가 기준(해상도) 고르기: FHD · QHD · 4K 중 하나
export default function ResolutionPicker({ resolution, onChange }) {
  return (
    <div
      className="mb-[20px] p-[20px] rounded-[20px] bg-primary-soft"
      role="radiogroup"
      aria-label="게임 성능 평가 기준"
    >
      <p className="mb-[12px] text-[14px] font-[650] text-primary-text">평가 기준을 선택하세요</p>
      <div className="grid grid-cols-3 gap-[10px] max-[600px]:grid-cols-1">
        {RESOLUTIONS.map(item => {
          const active = resolution === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`flex items-center gap-[12px] p-[14px] rounded-[16px] text-left transition-[background,box-shadow,transform] duration-200 ${
                active
                  ? 'bg-surface shadow-[var(--shadow)] ring-2 ring-primary'
                  : 'bg-surface/60 hover:bg-surface hover:-translate-y-[2px]'
              }`}
              onClick={() => onChange(item.id)}
            >
              <span
                className={`grid place-items-center w-[40px] h-[40px] rounded-full shrink-0 ${active ? 'bg-primary text-on-primary' : 'bg-primary-soft text-primary-text'}`}
              >
                <GSIcon name={active ? 'check' : 'monitor'} size={18} />
              </span>
              <span className="min-w-0">
                <strong className="block text-[16px] font-[700]">
                  {item.label} <small className="text-[12px] font-[500] text-muted">{item.pixels}</small>
                </strong>
                <small className="block text-[12px] text-muted">{item.hint}</small>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
