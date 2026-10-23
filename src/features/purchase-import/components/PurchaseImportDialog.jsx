import { GSIcon } from '@/shared/ui'
import { useModalDialog } from '@/shared/hooks'
import { usePurchaseImport } from '../hooks/usePurchaseImport'
import ImportGuide from './steps/ImportGuide'
import HistoryPreview from './steps/HistoryPreview'
import LicensesPreview from './steps/LicensesPreview'
import ImportResult from './steps/ImportResult'

// 스팀 구매내역 페이지 또는 라이선스 페이지를 저장한 HTML(또는 표를 복사한 내용)을 받아 브라우저에서 파싱하고,
// 미리보기로 확인한 뒤 정리한 목록만 서버로 보낸다. 단계: 안내(파일 고르기) → 미리보기 → 결과
export default function PurchaseImportDialog({ open, hasHistory, onClose, onImported }) {
  const ref = useModalDialog(open)
  const { fileRef, parsed, result, error, busy, reset, close, onFile, onPaste, submit, removeAll } = usePurchaseImport({ onClose, onImported })

  let step
  if (result) step = <ImportResult result={result} onClose={close} />
  else if (parsed?.kind === 'licenses') step = <LicensesPreview parsed={parsed} busy={busy} onReset={reset} onSubmit={submit} />
  else if (parsed) step = <HistoryPreview parsed={parsed} busy={busy} onReset={reset} onSubmit={submit} />
  else step = <ImportGuide fileRef={fileRef} onFile={onFile} onPaste={onPaste} hasHistory={hasHistory} busy={busy} onRemoveAll={removeAll} />

  return (
    <dialog
      ref={ref}
      className="gs-mint-dark m-auto p-0 border-0 max-h-[calc(100vh-32px)] rounded-[24px] w-[560px] max-w-[calc(100vw-32px)] bg-surface text-text shadow-[0_24px_80px_#0004] backdrop:bg-[#11102199] backdrop:backdrop-blur-[4px]"
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
        {step}
        {error && (
          <p className="mt-[14px] text-[14px] text-[#e8590c]" role="alert">
            {error}
          </p>
        )}
      </div>
    </dialog>
  )
}
