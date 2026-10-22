import { GSIcon } from '@/shared/ui'
import { SPEC_FIELDS } from '../../../model/pcSpecs'
import { SPEC_INPUT } from './specInputClass'

// ② 직접 입력: 부품마다 한 칸. 명령어·사진으로 읽은 값도 여기 채워서 확인한다.
export default function ManualMethod({ draft, setDraft }) {
  return (
    <section aria-label="직접 입력">
      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        {SPEC_FIELDS.map(field => (
          <label key={field.key} className="grid gap-[8px] text-[13px] font-[600] text-muted">
            <span className="flex items-center gap-[8px]">
              <GSIcon name={field.hardwareId} size={16} />
              {field.label}
            </span>
            <input
              className={SPEC_INPUT}
              value={draft[field.key]}
              placeholder={field.placeholder}
              maxLength={120}
              onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))}
            />
          </label>
        ))}
      </div>
      <p className="mt-[16px] text-[12px] text-faint leading-[1.6]">
        입력하지 않은 부품은 예시 사양으로 표시돼요. 예시 점수와 FPS는 사양을 정확히 분석한 값이 아니에요.
      </p>
    </section>
  )
}
