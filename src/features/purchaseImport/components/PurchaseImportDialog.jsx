import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { parseSteamHistory } from '../parseSteamHistory'
import { deletePurchases, importPurchases } from '../api'
import { getErrorMessage } from '../../../utils/apiClient'
import { dateLabel, number } from '../../../utils/formatters'

const HISTORY_URL = 'https://store.steampowered.com/account/history/'
const TYPE_LABELS = { PURCHASE: '구매', REFUND: '환불', IN_GAME: '게임 내 구매', GIFT: '선물 구매' }
const EXCLUDED_LABELS = { WALLET_CREDIT: '지갑 충전', CONVERSION: '통화 변환', MARKET: '장터 거래', UNKNOWN: '기타' }

const countBy = (list, key) => list.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] ?? 0) + 1 }), {})
const describe = (counts, labels) =>
  Object.entries(counts).map(([key, count]) => `${labels[key] ?? key} ${number(count)}건`).join(' · ')

function money(amount, currency) {
  if (amount == null) return '전액 환불'
  return `${currency ?? ''} ${amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`.trim()
}

// 스팀 구매내역 페이지를 저장한 HTML(또는 표를 복사한 내용)을 받아 브라우저에서 파싱하고,
// 미리보기로 확인한 뒤 거래 목록만 서버로 보낸다.
export default function PurchaseImportDialog({ open, hasHistory, onClose, onImported }) {
  const ref = useRef(null)
  const fileRef = useRef(null)
  const [parsed, setParsed] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const reset = () => {
    setParsed(null)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }
  const close = () => {
    const imported = Boolean(result)
    reset()
    onClose()
    if (imported) onImported()
  }

  const readHtml = html => {
    const parsedHistory = parseSteamHistory(html)
    if (!parsedHistory.transactions.length) {
      setParsed(null)
      setError(parsedHistory.warnings[0] ?? '가져올 거래를 찾지 못했어요.')
      return
    }
    setError('')
    setParsed(parsedHistory)
  }
  const onFile = async event => {
    const file = event.target.files?.[0]
    if (file) readHtml(await file.text())
  }
  const onPaste = event => {
    event.preventDefault()
    const html = event.clipboardData.getData('text/html')
    if (html) readHtml(html)
    else setError('표 모양 그대로 복사되지 않았어요. 구매내역 페이지에서 표를 드래그해 복사하거나 HTML 파일을 올려 주세요.')
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      setResult(await importPurchases(parsed.transactions))
      setParsed(null)
    } catch (err) {
      setError(getErrorMessage(err, '구매내역을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setBusy(false)
    }
  }
  const removeAll = async () => {
    if (!window.confirm('가져온 구매내역을 모두 지울까요? 소비 분석은 다시 정가 추정으로 돌아가요.')) return
    setBusy(true)
    try {
      await deletePurchases()
      reset()
      onClose()
      onImported()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const list = parsed?.transactions ?? []
  const dates = list.map(t => t.purchasedAt).sort()
  return (
    <dialog
      ref={ref}
      className="detail-dialog import-dialog"
      aria-label="스팀 구매내역 가져오기"
      onCancel={close}
      onClick={e => {
        if (e.target === e.currentTarget && !busy) close()
      }}
    >
      <div className="dialog-content">
        <button className="icon-button dialog-close" aria-label="닫기" onClick={close} disabled={busy}>
          <GSIcon name="close" size={20} />
        </button>
        <span className="eyebrow">PURCHASE HISTORY</span>
        <h2>스팀 구매내역 가져오기</h2>

        {result ? (
          <div className="import-result" role="status">
            <p>
              <strong>{number(result.imported)}건</strong>을 가져왔어요.
              {result.duplicates > 0 && <> 이미 가져온 {number(result.duplicates)}건은 건너뛰었어요.</>}
            </p>
            {result.unsupportedCurrencies.length > 0 && (
              <p className="import-note">
                원화 환율을 구하지 못한 통화({result.unsupportedCurrencies.join(', ')})는 지출 합계에서 빠져요.
              </p>
            )}
            {result.unmatchedItems.length > 0 && (
              <details className="import-note">
                <summary>게임과 연결하지 못한 상품 {number(result.unmatchedItems.length)}개 (지출 합계에는 포함)</summary>
                <ul>
                  {result.unmatchedItems.slice(0, 20).map(name => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </details>
            )}
            <button type="button" className="primary-button" onClick={close}>
              소비 분석 보기
            </button>
          </div>
        ) : parsed ? (
          <div className="import-preview">
            <dl>
              <div>
                <dt>가져올 거래</dt>
                <dd>
                  {number(list.length)}건 <small>({describe(countBy(list, 'type'), TYPE_LABELS)})</small>
                </dd>
              </div>
              <div>
                <dt>기간</dt>
                <dd>
                  {dateLabel(dates[0])} ~ {dateLabel(dates[dates.length - 1])}
                </dd>
              </div>
              <div>
                <dt>결제 통화</dt>
                <dd>{Object.keys(countBy(list.filter(t => t.currency), 'currency')).join(', ') || '-'}</dd>
              </div>
              <div>
                <dt>할인 구매</dt>
                <dd>{number(list.filter(t => t.discountPercent).length)}건</dd>
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
              <p key={warning} className="import-note" role="alert">
                {warning}
              </p>
            ))}
            <ul className="import-sample" aria-label="최근 거래 미리보기">
              {list.slice(0, 5).map(t => (
                <li key={t.externalKey}>
                  <span>{dateLabel(t.purchasedAt)}</span>
                  <span>{t.items.join(' + ')}</span>
                  <span>
                    {TYPE_LABELS[t.type]} · {money(t.amount, t.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="import-note">
              결제 금액은 구매일 환율로 원화로 바꿔 저장해요. 결제 수단, 지갑 잔액, 거래 번호는 서버로 보내지 않아요.
            </p>
            <div className="import-actions">
              <button type="button" className="text-button" onClick={reset} disabled={busy}>
                다른 파일 선택
              </button>
              <button type="button" className="primary-button" onClick={submit} disabled={busy}>
                {busy ? '가져오는 중... (환율·DLC 확인)' : `${number(list.length)}건 가져오기`}
              </button>
            </div>
          </div>
        ) : (
          <div className="import-guide">
            <ol>
              <li>
                크롬에서 스팀에 로그인한 뒤{' '}
                <a href={HISTORY_URL} target="_blank" rel="noreferrer">
                  구매내역 페이지
                </a>
                를 엽니다.
              </li>
              <li>맨 아래 <strong>"더 보기"</strong>가 안 나올 때까지 누릅니다.</li>
              <li>
                <strong>Ctrl + S</strong> → <strong>"웹페이지, 전체"</strong>로 저장하고 아래에 올립니다.
              </li>
            </ol>
            <label className="import-file">
              <GSIcon name="library" size={18} />
              <span>저장한 HTML 파일 선택</span>
              <input ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={onFile} />
            </label>
            <textarea
              className="import-paste"
              aria-label="구매내역 표 붙여넣기"
              placeholder="또는 구매내역 표를 복사해서 여기에 붙여넣기 (Ctrl + V)"
              value=""
              onChange={() => {}}
              onPaste={onPaste}
              rows={2}
            />
            <p className="import-note">파일은 이 브라우저 안에서만 읽어요. 실제 결제 금액과 구매일로 소비 분석이 바뀝니다.</p>
            {hasHistory && (
              <button type="button" className="text-button danger" onClick={removeAll} disabled={busy}>
                가져온 구매내역 모두 지우기
              </button>
            )}
          </div>
        )}
        {error && (
          <p className="import-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </dialog>
  )
}
