import { GSIcon } from '@/shared/ui'
import { usePcSpecs } from '@/features/performance'
import { ACTION_BUTTON } from './accountStyles'

// PC 사양 입력 / 바꾸기 (사양 입력 창을 연다)
export default function PcSpecSetting() {
  const { hasSavedSpecs, openSpecDialog } = usePcSpecs()
  return (
    <section>
      <div>
        <h3>PC 사양</h3>
        <small>사양을 입력하면 내 PC 기준으로 평가하고, 더 많은 AI 분석을 쓸 수 있어요. 이 브라우저에만 저장돼요.</small>
      </div>
      <div>
        <button type="button" className={ACTION_BUTTON} onClick={openSpecDialog}>
          <GSIcon name="monitor" size={17} />
          {hasSavedSpecs ? '내 PC 사양 바꾸기' : '내 PC 사양 입력'}
        </button>
      </div>
    </section>
  )
}
