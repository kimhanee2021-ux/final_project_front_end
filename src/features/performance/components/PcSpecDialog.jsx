import { useEffect, useRef, useState } from 'react'
import { GSIcon, SegmentedControl } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { EMPTY_SPECS, SPEC_COMMAND, SPEC_FIELDS, parseSpecOutput, specsFromPhoto } from '../model/pcSpecs'
import SystemPhotoInput from './SystemPhotoInput'

const inputClass = 'w-full h-[44px] px-[16px] rounded-[14px] border-0 bg-bg text-text text-[14px]'

// 사양을 알려주는 세 가지 방법. 위쪽 태그로 하나씩 골라서 본다.
const METHODS = [
  { key: 'command', label: '방법 1 · 명령어 결과' },
  { key: 'manual', label: '방법 2 · 직접 입력' },
  { key: 'photo', label: '방법 3 · 사진' },
]
const NO_MESSAGE = { text: '', error: false }

// 내 PC 사양 입력 창: ① 명령어 결과 붙여넣기 ② 직접 입력 ③ 시스템 정보 사진. 저장하면 PC 분석에 반영된다.
export default function PcSpecDialog({ open, specs, onSave, onReset, onClose }) {
  const ref = useRef(null)
  const { isAuthenticated } = useAuth()
  const [method, setMethod] = useState('command')
  const [draft, setDraft] = useState(specs)
  const [pasted, setPasted] = useState('')
  const [message, setMessage] = useState(NO_MESSAGE)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) {
      setMethod('command')
      setDraft(specs)
      setPasted('')
      setMessage(NO_MESSAGE)
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

  // 명령어 결과나 사진으로 읽은 값은 직접 입력 칸에 채워 보여주고, 사용자가 확인한 뒤 저장한다.
  const fillDraft = (next, text) => {
    setDraft(next)
    setMessage({ text, error: false })
    setMethod('manual')
  }

  const applyPasted = () => {
    try {
      fillDraft(parseSpecOutput(pasted), '명령어 결과를 불러왔어요. 아래 내용을 확인하고 저장하세요.')
    } catch (error) {
      setMessage({ text: error.message, error: true })
    }
  }

  const changeMethod = next => {
    setMethod(next)
    setMessage(NO_MESSAGE)
  }

  const save = () => {
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
      <div className="pc-dialog-inner">
        <div className="pc-dialog-top">
          <span className="pc-demo-badge">내 PC 사양</span>
          <button type="button" className="gs-icon-button" aria-label="사양 입력 닫기" onClick={onClose}>
            <GSIcon name="close" />
          </button>
        </div>
        <h2 id="pc-spec-title">내 PC 사양 입력</h2>
        <p className="pc-dialog-lead">브라우저는 내 PC 부품을 직접 읽을 수 없어서, 아래 세 방법 중 편한 쪽으로 알려주세요.</p>

        <div className="mb-[18px] overflow-x-auto">
          <SegmentedControl label="사양 입력 방법" options={METHODS} value={method} onChange={changeMethod} />
        </div>

        {method === 'command' && (
          <section aria-label="명령어 결과 붙여넣기">
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
            </div>
          </section>
        )}

        {method === 'manual' && (
          <section aria-label="직접 입력">
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
          </section>
        )}

        {method === 'photo' && (
          <section aria-label="사진으로 입력">
            <p className="mb-[14px] text-[13px] text-muted leading-[1.7]">Windows 설정 → 시스템 → 정보 화면을 찍은 사진을 올리면 AI가 부품 정보를 읽어요. 읽은 값은 &lsquo;직접 입력&rsquo; 칸에 채워지니 확인하고 저장하세요.</p>
            <SystemPhotoInput
              signedIn={isAuthenticated}
              allowManual={false}
              onApply={pc => fillDraft(specsFromPhoto(pc), '사진에서 읽은 사양이에요. 틀린 곳은 고친 뒤 저장하세요.')}
            />
          </section>
        )}

        {message.text && (
          <p className={`mt-[12px] text-[13px] ${message.error ? 'text-[#e5484d]' : 'text-muted'}`} role={message.error ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}

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
          <button type="button" className="gs-primary-button" onClick={save}>
            저장하기
          </button>
        </div>
      </div>
    </dialog>
  )
}
