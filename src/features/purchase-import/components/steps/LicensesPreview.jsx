import { PRIMARY_BUTTON, TEXT_BUTTON } from '@/shared/ui'
import { dateLabel, number } from '@/shared/utils/formatters'
import { METHOD_LABELS } from '../../model/labels'
import { countBy, describe, range } from '../../model/importSummary'
import { ACTIONS, NOTE, PREVIEW_LIST, SAMPLE_LIST } from '../importStyles'

// 라이선스 페이지 미리보기: 건수·방법·기간 + 최근 5건, 그리고 가져오기 버튼
export default function LicensesPreview({ parsed, busy, onReset, onSubmit }) {
  const licenses = parsed.licenses
  return (
    <div>
      <dl className={PREVIEW_LIST}>
        <div>
          <dt>라이선스</dt>
          <dd>
            {number(licenses.length)}건 <small>({describe(countBy(licenses, 'method'), METHOD_LABELS)})</small>
          </dd>
        </div>
        <div>
          <dt>기간</dt>
          <dd>{range(licenses.map(l => l.acquiredAt))}</dd>
        </div>
      </dl>
      {parsed.warnings.map(warning => (
        <p key={warning} className={NOTE} role="alert">
          {warning}
        </p>
      ))}
      <ul className={SAMPLE_LIST} aria-label="최근 라이선스 미리보기">
        {licenses.slice(0, 5).map(l => (
          <li key={l.externalKey}>
            <span>{dateLabel(l.acquiredAt)}</span>
            <span>{l.name}</span>
            <span>{METHOD_LABELS[l.method]}</span>
          </li>
        ))}
      </ul>
      <p className={NOTE}>
        라이선스에는 금액이 없어요. 구매내역에 결제 기록이 없는 게임(선물·무료 배포·제품 키)의 획득일과 이유를 보여줘요.
      </p>
      <div className={ACTIONS}>
        <button type="button" className={TEXT_BUTTON} onClick={onReset} disabled={busy}>
          다른 파일 선택
        </button>
        <button type="button" className={PRIMARY_BUTTON} onClick={onSubmit} disabled={busy}>
          {busy ? '가져오는 중...' : `라이선스 ${number(licenses.length)}건 가져오기`}
        </button>
      </div>
    </div>
  )
}
