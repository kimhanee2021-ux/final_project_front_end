import { PRIMARY_BUTTON, TEXT_BUTTON } from '@/shared/ui'
import { dateLabel, number } from '@/shared/utils/formatters'
import { EXCLUDED_LABELS, TYPE_LABELS, countBy, describe, paidText, range } from '../../model/importSummary'
import { ACTIONS, NOTE, PREVIEW_LIST, SAMPLE_LIST } from '../importStyles'

// 구매내역 페이지 미리보기: 거래 수·기간·통화·할인·제외 + 최근 5건, 그리고 가져오기 버튼
export default function HistoryPreview({ parsed, busy, onReset, onSubmit }) {
  const transactions = parsed.transactions
  return (
    <div>
      <dl className={PREVIEW_LIST}>
        <div>
          <dt>가져올 거래</dt>
          <dd>
            {number(transactions.length)}건 <small>({describe(countBy(transactions, 'type'), TYPE_LABELS)})</small>
          </dd>
        </div>
        <div>
          <dt>기간</dt>
          <dd>{range(transactions.map(t => t.purchasedAt))}</dd>
        </div>
        <div>
          <dt>결제 통화</dt>
          <dd>{Object.keys(countBy(transactions.filter(t => t.currency), 'currency')).join(', ') || '-'}</dd>
        </div>
        <div>
          <dt>할인 구매</dt>
          <dd>{number(transactions.filter(t => t.discountPercent).length)}건</dd>
        </div>
        {Object.keys(parsed.excluded).length > 0 && (
          <div>
            <dt>제외</dt>
            <dd>
              {describe(parsed.excluded, EXCLUDED_LABELS)} <small>(지출이 아니거나 중복 집계되는 기록)</small>
            </dd>
          </div>
        )}
      </dl>
      {parsed.warnings.map(warning => (
        <p key={warning} className={NOTE} role="alert">
          {warning}
        </p>
      ))}
      <ul className={SAMPLE_LIST} aria-label="최근 거래 미리보기">
        {transactions.slice(0, 5).map(t => (
          <li key={t.externalKey}>
            <span>{dateLabel(t.purchasedAt)}</span>
            <span>{t.items.join(' + ')}</span>
            <span>
              {TYPE_LABELS[t.type]} · {paidText(t.amount, t.currency)}
            </span>
          </li>
        ))}
      </ul>
      <p className={NOTE}>
        결제 금액은 구매일 환율로 원화로 바꿔 저장해요. 결제 수단, 지갑 잔액, 거래 번호는 서버로 보내지 않아요.
      </p>
      <div className={ACTIONS}>
        <button type="button" className={TEXT_BUTTON} onClick={onReset} disabled={busy}>
          다른 파일 선택
        </button>
        <button type="button" className={PRIMARY_BUTTON} onClick={onSubmit} disabled={busy}>
          {busy ? '가져오는 중... (환율·DLC 확인)' : `${number(transactions.length)}건 가져오기`}
        </button>
      </div>
    </div>
  )
}
