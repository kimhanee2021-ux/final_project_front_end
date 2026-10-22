import { GSIcon } from '@/shared/ui'
import { ACTION_BUTTON } from './accountStyles'

// 구매 내역 가져오기 (스팀 연동 후에만)
export default function PurchaseHistorySetting({ steamLinked, hasHistory, onOpenImport }) {
  return (
    <section>
      <div>
        <h3>구매 내역</h3>
        <small>스팀 구매내역을 가져오면 실제 결제액으로 분석하고, 더 많은 AI 분석을 쓸 수 있어요.</small>
      </div>
      <div className="flex flex-wrap items-center gap-[8px]">
        <button type="button" className={ACTION_BUTTON} onClick={onOpenImport} disabled={!steamLinked}>
          <GSIcon name="wallet" size={17} />
          {hasHistory ? '구매 내역 바꾸기' : '구매 내역 가져오기'}
        </button>
        {!steamLinked && <p className="basis-full text-[13px] text-muted">스팀 연동 후에 가져올 수 있어요.</p>}
      </div>
    </section>
  )
}
