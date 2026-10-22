import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { EMPTY_SPECS, SPEC_COMMAND, SPEC_FIELDS, parseSpecOutput, specsFromPhoto } from '../model/pcSpecs'
import SystemPhotoInput from './SystemPhotoInput'

const inputClass =
  'w-full h-[46px] px-[16px] rounded-[14px] border-0 bg-surface text-text text-[14px] placeholder:text-faint'

// 사양을 알려주는 세 가지 방법. 위쪽 탭으로 하나씩 골라서 본다.
const METHODS = [
  { key: 'command', number: 1, label: '명령어 결과' },
  { key: 'manual', number: 2, label: '직접 입력' },
  { key: 'photo', number: 3, label: '사진' },
]
const NO_MESSAGE = { text: '', error: false }

// 사양 입력 창은 앱에 하나만 있고(PcSpecProvider), 어느 화면의 버튼이든 이 창을 그 자리에서 연다.
// ① 명령어 결과 붙여넣기 ② 직접 입력 ③ 시스템 정보 사진. 읽어온 값은 ② 칸에 채워서 확인한 뒤 저장한다.
export default function PcSpecDialog({ open, saved, onSave, onReset, onClose }) {
  const ref = useRef(null)
  const { isAuthenticated } = useAuth()
  const [method, setMethod] = useState('command')
  const [draft, setDraft] = useState(saved.specs)
  const [detail, setDetail] = useState(saved.detail)
  const [aiConsent, setAiConsent] = useState(saved.aiConsent)
  const [pasted, setPasted] = useState('')
  const [message, setMessage] = useState(NO_MESSAGE)
  const [copied, setCopied] = useState(false)
  const [consentWarning, setConsentWarning] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) {
      // 이미 입력한 사양이 있으면 바로 고칠 수 있게 ② 직접 입력 탭에서 시작한다.
      setMethod(saved.specs.cpu || saved.specs.gpu || saved.specs.ram || saved.specs.storage ? 'manual' : 'command')
      setDraft(saved.specs)
      setDetail(saved.detail)
      setAiConsent(saved.aiConsent)
      setPasted('')
      setMessage(NO_MESSAGE)
      setConsentWarning(false)
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
  const fillDraft = (next, text, nextDetail = null) => {
    setDraft(next)
    setDetail(nextDetail)
    setMessage({ text, error: false })
    setMethod('manual')
  }

  const applyPasted = () => {
    try {
      fillDraft(parseSpecOutput(pasted), '명령어 결과를 불러왔어요. 내용을 확인하고 저장하세요.')
    } catch (error) {
      setMessage({ text: error.message, error: true })
    }
  }

  const changeMethod = next => {
    setMethod(next)
    setMessage(NO_MESSAGE)
  }

  const save = () => {
    if (!aiConsent) {
      setMessage({ text: 'AI 분석 동의에 체크해야 사양을 저장할 수 있어요.', error: true })
      setConsentWarning(true)
      return
    }
    onSave(draft, { detail, aiConsent })
    onClose()
  }

  const reset = () => {
    setDraft(EMPTY_SPECS)
    onReset()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="pc-dialog pc-spec-dialog gs-mint-dark"
      aria-labelledby="pc-spec-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pc-dialog-inner">
        <header className="flex items-start gap-[14px] mb-[22px]">
          <span className="grid place-items-center w-[48px] h-[48px] rounded-[16px] bg-primary-soft text-primary-text shrink-0">
            <GSIcon name="monitor" size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="pc-spec-title" className="!m-0 !text-[22px]">
              내 PC 사양 입력
            </h2>
            <p className="!m-0 mt-[4px] text-[13px] text-muted leading-[1.6]">
              내 PC 부품을 알려주면 평가와 진단이 내 PC 기준으로 바뀌어요.
            </p>
          </div>
          <button type="button" className="gs-icon-button" aria-label="사양 입력 닫기" onClick={onClose}>
            <GSIcon name="close" />
          </button>
        </header>

        <div
          className="grid grid-cols-3 gap-[4px] p-[4px] mb-[18px] rounded-[18px] bg-bg"
          role="tablist"
          aria-label="사양 입력 방법"
        >
          {METHODS.map(item => {
            const active = item.key === method
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`flex items-center justify-center gap-[8px] h-[44px] rounded-[14px] text-[13px] whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-surface text-text font-[650] shadow-[var(--shadow)]'
                    : 'bg-transparent text-muted hover:text-text'
                }`}
                onClick={() => changeMethod(item.key)}
              >
                <span
                  className={`grid place-items-center w-[20px] h-[20px] rounded-full text-[11px] font-[700] ${active ? 'bg-primary text-on-primary' : 'bg-surface text-muted'}`}
                >
                  {item.number}
                </span>
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="min-h-[300px] p-[18px] rounded-[18px] bg-bg" role="tabpanel">
          {method === 'command' && (
            <section aria-label="명령어 결과 붙여넣기" className="grid gap-[14px]">
              <ol className="grid gap-[10px] text-[13px] text-muted leading-[1.6]">
                {[
                  '윈도우에서 PowerShell을 열고 아래 명령어를 복사해 실행하세요.',
                  '나온 결과 한 줄을 아래 칸에 붙여넣고 “불러오기”를 누르세요.',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-[10px]">
                    <span className="grid place-items-center w-[22px] h-[22px] rounded-full bg-surface text-[12px] font-[700] text-primary-text shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="flex items-start gap-[8px]">
                <code className="flex-1 min-w-0 max-h-[84px] overflow-auto p-[12px] rounded-[12px] bg-surface text-[11px] leading-[1.6] break-all">
                  {SPEC_COMMAND}
                </code>
                <button type="button" className="gs-secondary-button shrink-0 !bg-surface" onClick={copyCommand}>
                  <GSIcon name={copied ? 'check' : 'note'} size={15} />
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>
              <textarea
                className={`${inputClass} !h-[76px] py-[12px] resize-y`}
                value={pasted}
                onChange={event => setPasted(event.target.value)}
                aria-label="명령어 결과 붙여넣기"
                placeholder='{"cpu":"...","gpu":"...","ram":"16 GB","storage":"..."}'
              />
              <div>
                <button type="button" className="gs-primary-button" onClick={applyPasted} disabled={!pasted.trim()}>
                  불러오기
                </button>
              </div>
            </section>
          )}

          {method === 'manual' && (
            <section aria-label="직접 입력">
              <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
                {SPEC_FIELDS.map(field => (
                  <label key={field.key} className="grid gap-[8px] text-[13px] font-[600] text-muted">
                    <span className="flex items-center gap-[8px]">
                      <GSIcon name={field.hardwareId} size={16} />
                      {field.label}
                    </span>
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
              <p className="mt-[16px] text-[12px] text-faint leading-[1.6]">
                입력하지 않은 부품은 예시 사양으로 표시돼요. 예시 점수와 FPS는 사양을 정확히 분석한 값이 아니에요.
              </p>
            </section>
          )}

          {method === 'photo' && (
            <section aria-label="사진으로 입력">
              <p className="mb-[14px] text-[13px] text-muted leading-[1.7]">
                Windows 설정 → 시스템 → 정보 화면을 찍은 사진을 올리면 AI가 부품 정보를 읽어요. 읽은 값은 “직접 입력”
                칸에 채워지니 확인하고 저장하세요.
              </p>
              <SystemPhotoInput
                signedIn={isAuthenticated}
                allowManual={false}
                onApply={pc =>
                  fillDraft(specsFromPhoto(pc), '사진에서 읽은 사양이에요. 틀린 곳은 고친 뒤 저장하세요.', pc)
                }
              />
            </section>
          )}
        </div>

        {message.text && (
          <p
            className={`mt-[12px] text-[13px] ${message.error ? 'text-[#e5484d]' : 'text-primary-text'}`}
            role={message.error ? 'alert' : 'status'}
          >
            {message.text}
          </p>
        )}

        <label
          className={`flex items-start gap-[10px] mt-[16px] p-[12px] rounded-[14px] text-[12px] leading-[1.6] cursor-pointer transition-colors ${consentWarning && !aiConsent ? 'bg-peach-bg text-peach-text' : 'text-muted'}`}
        >
          <input
            type="checkbox"
            className="mt-[3px] w-[16px] h-[16px] accent-primary shrink-0"
            checked={aiConsent}
            onChange={event => {
              setAiConsent(event.target.checked)
              if (event.target.checked) {
                setConsentWarning(false)
                setMessage(NO_MESSAGE)
              }
            }}
          />
          <span>
            입력한 사양을 AI 분석(Gemini·Groq)에 전송해 PC 평가에 쓰는 데 동의해요. (필수)
            {!isAuthenticated && (
              <>
                {' '}
                분석은{' '}
                <Link to="/login?next=%2Fpc-check" className="text-primary-text underline">
                  로그인
                </Link>{' '}
                후에 진행돼요.
              </>
            )}
          </span>
        </label>

        <div className="flex items-center justify-between gap-[10px] mt-[20px]">
          <button type="button" className="bg-transparent text-[13px] text-muted underline" onClick={reset}>
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
