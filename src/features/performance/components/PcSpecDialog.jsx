import { useEffect, useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { EMPTY_SPECS, SPEC_COMMAND, SPEC_FIELDS, parseSpecOutput } from '../model/pcSpecs'

const inputClass = 'w-full h-[44px] px-[16px] rounded-[14px] border-0 bg-bg text-text text-[14px]'

// 내 PC 사양 입력 창: ① 명령어 결과를 붙여넣어 자동 채우기 ② 직접 입력. 저장하면 PC 분석에 반영된다.
export default function PcSpecDialog({ open, specs, onSave, onReset, onClose }) {
  const ref = useRef(null)
  const [draft, setDraft] = useState(specs)
  const [pasted, setPasted] = useState('')
  const [message, setMessage] = useState({ text: '', error: false })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) {
      setDraft(specs)
      setPasted('')
      setMessage({ text: '', error: false })
      dialog.showModal()
    } else if (!open && dialog.open) dialog.close()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(SPEC_COMMAND)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage({ text: '복사하지 못했어요. 명령어를 직접 드래그해서 복사해 주세요.', error: true })
    }
  }

  const applyPasted = () => {
    try {
      setDraft(parseSpecOutput(pasted))
      setMessage({ text: '불러왔어요. 아래 내용을 확인하고 저장하세요.', error: false })
    } catch (error) {
      setMessage({ text: error.message, error: true })
    }
  }

  const submit = event => {
    event.preventDefault()
    onSave(draft)
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="pc-dialog"
      aria-labelledby="pc-spec-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form className="pc-dialog-inner" onSubmit={submit}>
        <div className="pc-dialog-top">
          <span className="pc-demo-badge">내 PC 사양</span>
          <button type="button" className="gs-icon-button" aria-label="사양 입력 닫기" onClick={onClose}>
            <GSIcon name="close" />
          </button>
        </div>
        <h2 id="pc-spec-title">내 PC 사양 입력</h2>
        <p className="pc-dialog-lead">브라우저는 내 PC 부품을 직접 읽을 수 없어서, 아래 두 방법 중 편한 쪽으로 알려주세요. 입력한 내용은 이 브라우저에만 저장돼요.</p>

        <h3>방법 1. 명령어 결과 붙여넣기</h3>
        <ol className="grid gap-[6px] mb-[10px] text-[13px] text-muted leading-[1.7] list-decimal pl-[20px]">
          <li>윈도우에서 PowerShell을 열고, 아래 명령어를 복사해 실행하세요.</li>
          <li>나온 결과 한 줄을 복사해서 아래 칸에 붙여넣고 &lsquo;불러오기&rsquo;를 누르세요.</li>
        </ol>
        <div className="flex items-start gap-[8px] mb-[10px]">
          <code className="flex-1 min-w-0 max-h-[84px] overflow-auto p-[12px] rounded-[12px] bg-bg text-[11px] leading-[1.6] break-all">{SPEC_COMMAND}</code>
          <button type="button" className="gs-secondary-button shrink-0" onClick={copyCommand}>
            <GSIcon name={copied ? 'check' : 'note'} size={15} />
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <textarea
          className={`${inputClass} h-[72px] py-[12px] resize-y`}
          value={pasted}
          onChange={event => setPasted(event.target.value)}
          aria-label="명령어 결과 붙여넣기"
          placeholder='{"cpu":"...","gpu":"...","ram":"16 GB","storage":"..."}'
        />
        <div className="flex items-center gap-[12px] mt-[8px]">
          <button type="button" className="gs-secondary-button" onClick={applyPasted} disabled={!pasted.trim()}>
            불러오기
          </button>
          {message.text && (
            <span className={`text-[13px] ${message.error ? 'text-[#e5484d]' : 'text-muted'}`} role={message.error ? 'alert' : 'status'}>
              {message.text}
            </span>
          )}
        </div>

        <h3>방법 2. 직접 입력</h3>
        <div className="grid grid-cols-2 gap-[12px] max-[480px]:grid-cols-1">
          {SPEC_FIELDS.map(field => (
            <label key={field.key} className="grid gap-[6px] text-[13px] text-muted">
              {field.label}
              <input
                className={inputClass}
                value={draft[field.key]}
                placeholder={field.placeholder}
                maxLength={120}
                onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))}
              />
            </label>
          ))}
        </div>
        <p className="mt-[14px] text-[12px] text-faint">입력하지 않은 부품은 예시 사양으로 표시돼요. 점수와 FPS는 사양을 정확히 분석한 값이 아니라 예시예요.</p>

        <div className="flex items-center justify-between gap-[10px] mt-[22px]">
          <button
            type="button"
            className="bg-transparent text-[13px] text-muted underline"
            onClick={() => {
              setDraft(EMPTY_SPECS)
              onReset()
              onClose()
            }}
          >
            입력한 사양 지우기
          </button>
          <button type="submit" className="gs-primary-button">
            저장하기
          </button>
        </div>
      </form>
    </dialog>
  )
}
