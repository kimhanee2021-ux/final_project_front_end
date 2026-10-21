import { useEffect, useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { parseSteamHistory } from '../model/parseSteamHistory'
import { isLicensesPage, parseSteamLicenses } from '../model/parseSteamLicenses'
import { deletePurchases, importLicenses, importPurchases } from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { dateLabel, number } from '@/shared/utils/formatters'
import { METHOD_LABELS } from '../model/labels'
import { DANGER_TEXT_BUTTON, PRIMARY_BUTTON, TEXT_BUTTON } from '@/features/spending'

const HISTORY_URL = 'https://store.steampowered.com/account/history/'
const LICENSES_URL = 'https://store.steampowered.com/account/licenses/'
const TYPE_LABELS = { PURCHASE: '구매', REFUND: '환불', IN_GAME: '게임 내 구매', GIFT: '선물 구매' }
const NOTE = 'mt-[12px] text-[13px] leading-[1.6] text-muted'
const PREVIEW_LIST = 'grid gap-[8px] m-0 text-[14px] [&>div]:grid [&>div]:grid-cols-[90px_1fr] [&>div]:gap-[10px] max-[580px]:[&>div]:grid-cols-1 max-[580px]:[&>div]:gap-[2px] [&_dt]:text-muted [&_dd]:m-0 [&_dd]:font-semibold [&_small]:font-normal [&_small]:text-muted'
const SAMPLE_LIST = 'list-none mt-[16px] mb-0 p-0 grid gap-[6px] text-[13px] [&>li]:grid [&>li]:grid-cols-[80px_1fr_auto] [&>li]:gap-[10px] [&>li]:px-[10px] [&>li]:py-[8px] [&>li]:rounded-[8px] [&>li]:bg-surface-hover max-[580px]:[&>li]:grid-cols-1 [&>li>span:nth-child(2)]:truncate'
const ACTIONS = 'flex justify-between items-center mt-[18px]'
const EXCLUDED_LABELS = { WALLET_CREDIT: '지갑 충전', CONVERSION: '통화 변환', MARKET: '장터 거래', UNKNOWN: '기타' }

const countBy = (list, key) => list.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] ?? 0) + 1 }), {})
const describe = (counts, labels) =>
  Object.entries(counts).map(([key, count]) => `${labels[key] ?? key} ${number(count)}건`).join(' · ')
const range = dates => {
  const sorted = [...dates].sort()
  return `${dateLabel(sorted[0])} ~ ${dateLabel(sorted[sorted.length - 1])}`
}

function money(amount, currency) {
  if (amount == null) return '전액 환불'
  return `${currency ?? ''} ${amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`.trim()
}

// 스팀 구매내역 페이지 또는 라이선스 페이지를 저장한 HTML(또는 표를 복사한 내용)을 받아 브라우저에서 파싱하고,
// 미리보기로 확인한 뒤 정리한 목록만 서버로 보낸다. 어떤 페이지인지는 표 구조로 자동 판별한다.
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
    if (isLicensesPage(html)) {
      const licenses = parseSteamLicenses(html)
      if (!licenses.licenses.length) {
        setParsed(null)
        setError(licenses.warnings[0] ?? '가져올 라이선스를 찾지 못했어요.')
        return
      }
      setError('')
      setParsed({ kind: 'licenses', ...licenses })
      return
    }
    const history = parseSteamHistory(html)
    if (!history.transactions.length) {
      setParsed(null)
      setError(history.warnings[0] ?? '가져올 거래를 찾지 못했어요.')
      return
    }
    setError('')
    setParsed({ kind: 'history', ...history })
  }
  const onFile = async event => {
    const file = event.target.files?.[0]
    if (file) readHtml(await file.text())
  }
  const onPaste = event => {
    event.preventDefault()
    const html = event.clipboardData.getData('text/html')
    if (html) readHtml(html)
    else setError('표 모양 그대로 복사되지 않았어요. 페이지에서 표를 드래그해 복사하거나 HTML 파일을 올려 주세요.')
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const response =
        parsed.kind === 'licenses' ? await importLicenses(parsed.licenses) : await importPurchases(parsed.transactions)
      setResult({ kind: parsed.kind, ...response })
      setParsed(null)
    } catch (err) {
      setError(getErrorMessage(err, '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setBusy(false)
    }
  }
  const removeAll = async () => {
    if (!window.confirm('가져온 구매내역과 라이선스를 모두 지울까요? 소비 분석은 다시 정가 추정으로 돌아가요.')) return
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

  const transactions = parsed?.kind === 'history' ? parsed.transactions : []
  const licenses = parsed?.kind === 'licenses' ? parsed.licenses : []
  return (
    <dialog
      ref={ref}
      className="m-auto p-0 border-0 max-h-[calc(100vh-32px)] rounded-[24px] w-[560px] max-w-[calc(100vw-32px)] bg-surface text-text shadow-[0_24px_80px_#0004] backdrop:bg-[#11102199] backdrop:backdrop-blur-[4px]"
      aria-label="스팀 구매내역 가져오기"
      onCancel={close}
      onClick={e => {
        if (e.target === e.currentTarget && !busy) close()
      }}
    >
      <div className="relative p-[30px]">
        <button className="w-[34px] h-[34px] bg-transparent grid place-items-center rounded-[8px] hover:bg-surface-hover absolute top-[15px] right-[15px]" aria-label="닫기" onClick={close} disabled={busy}>
          <GSIcon name="close" size={20} />
        </button>
        <span className="text-[12px] font-bold tracking-[1.9px] text-primary-text">PURCHASE HISTORY</span>
        <h2 className="mt-[6px] mb-[18px] text-[19px] font-bold">스팀 구매내역 가져오기</h2>

        {result?.kind === 'licenses' ? (
          <div className="text-[13px] leading-[1.7]" role="status">
            <p>
              라이선스 <strong>{number(result.imported)}건</strong>을 가져와 보유 게임 {number(result.matched)}개에 획득일과 획득
              방법을 붙였어요.
              {result.duplicates > 0 && <> 이미 가져온 {number(result.duplicates)}건은 건너뛰었어요.</>}
            </p>
            <p className={NOTE}>데모·도구·옛 패키지처럼 지금 보유 게임이 아닌 라이선스는 연결되지 않아도 정상이에요.</p>
            <button type="button" className={PRIMARY_BUTTON + ' mt-[16px]'} onClick={close}>
              소비 분석 보기
            </button>
          </div>
        ) : result ? (
          <div className="text-[13px] leading-[1.7]" role="status">
            <p>
              <strong>{number(result.imported)}건</strong>을 가져왔어요.
              {result.duplicates > 0 && <> 이미 가져온 {number(result.duplicates)}건은 건너뛰었어요.</>}
            </p>
            {result.unsupportedCurrencies.length > 0 && (
              <p className={NOTE}>
                원화 환율을 구하지 못한 통화({result.unsupportedCurrencies.join(', ')})는 지출 합계에서 빠져요.
              </p>
            )}
            {result.unmatchedItems.length > 0 && (
              <details className={NOTE}>
                <summary className="cursor-pointer">게임과 연결하지 못한 상품 {number(result.unmatchedItems.length)}개 (지출 합계에는 포함)</summary>
                <ul className="mt-[6px] pl-[18px]">
                  {result.unmatchedItems.slice(0, 20).map(name => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </details>
            )}
            <button type="button" className={PRIMARY_BUTTON + ' mt-[16px]'} onClick={close}>
              소비 분석 보기
            </button>
          </div>
        ) : parsed?.kind === 'licenses' ? (
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
              <button type="button" className={TEXT_BUTTON} onClick={reset} disabled={busy}>
                다른 파일 선택
              </button>
              <button type="button" className={PRIMARY_BUTTON} onClick={submit} disabled={busy}>
                {busy ? '가져오는 중...' : `라이선스 ${number(licenses.length)}건 가져오기`}
              </button>
            </div>
          </div>
        ) : parsed ? (
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
                    {TYPE_LABELS[t.type]} · {money(t.amount, t.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className={NOTE}>
              결제 금액은 구매일 환율로 원화로 바꿔 저장해요. 결제 수단, 지갑 잔액, 거래 번호는 서버로 보내지 않아요.
            </p>
            <div className={ACTIONS}>
              <button type="button" className={TEXT_BUTTON} onClick={reset} disabled={busy}>
                다른 파일 선택
              </button>
              <button type="button" className={PRIMARY_BUTTON} onClick={submit} disabled={busy}>
                {busy ? '가져오는 중... (환율·DLC 확인)' : `${number(transactions.length)}건 가져오기`}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ol className="mb-[16px] pl-[18px] text-[14px] leading-[1.9] list-decimal [&_a]:text-primary-text [&_a]:underline">
              <li>
                크롬에서 스팀에 로그인한 뒤{' '}
                <a href={HISTORY_URL} target="_blank" rel="noreferrer">
                  구매내역 페이지
                </a>
                를 엽니다.
              </li>
              <li>
                맨 아래 <strong>"더 보기"</strong>가 안 나올 때까지 누릅니다.
              </li>
              <li>
                <strong>Ctrl + S</strong> → <strong>"웹페이지, 전체"</strong>로 저장하고 아래에 올립니다.
              </li>
              <li>
                (선택){' '}
                <a href={LICENSES_URL} target="_blank" rel="noreferrer">
                  라이선스 페이지
                </a>
                도 같은 방법으로 올리면, 선물·무료로 받은 게임의 획득일과 방법까지 보여줘요.
              </li>
            </ol>
            <label className="flex items-center gap-[10px] px-[16px] py-[14px] border border-dashed border-border rounded-[12px] cursor-pointer text-[14px] font-[650] hover:bg-surface-hover focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2">
              <GSIcon name="library" size={18} />
              <span>저장한 HTML 파일 선택 (구매내역 또는 라이선스)</span>
              <input className="sr-only" ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={onFile} />
            </label>
            <textarea
              className="block w-full mt-[10px] px-[14px] py-[12px] border border-dashed border-border rounded-[12px] bg-transparent text-text text-[14px] resize-none placeholder:text-muted"
              aria-label="구매내역 또는 라이선스 표 붙여넣기"
              placeholder="또는 구매내역·라이선스 표를 복사해서 여기에 붙여넣기 (Ctrl + V)"
              value=""
              onChange={() => {}}
              onPaste={onPaste}
              rows={2}
            />
            <p className={NOTE}>파일은 이 브라우저 안에서만 읽어요. 실제 결제 금액과 구매일로 소비 분석이 바뀝니다.</p>
            {hasHistory && (
              <button type="button" className={DANGER_TEXT_BUTTON + ' mt-[14px]'} onClick={removeAll} disabled={busy}>
                가져온 구매내역·라이선스 모두 지우기
              </button>
            )}
          </div>
        )}
        {error && (
          <p className="mt-[14px] text-[14px] text-[#e8590c]" role="alert">
            {error}
          </p>
        )}
      </div>
    </dialog>
  )
}
