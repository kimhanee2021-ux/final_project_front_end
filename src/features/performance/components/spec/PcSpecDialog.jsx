import { useEffect, useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { EMPTY_SPECS, parseSpecOutput, specsFromPhoto } from '../../model/pcSpecs'
import SpecMethodTabs from './methods/SpecMethodTabs'
import CommandMethod from './methods/CommandMethod'
import ManualMethod from './methods/ManualMethod'
import PhotoMethod from './methods/PhotoMethod'
import AiConsentField from './AiConsentField'

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

  // 동의에 체크하면 막혀 있던 경고와 안내를 지운다
  const changeConsent = checked => {
    setAiConsent(checked)
    if (checked) {
      setConsentWarning(false)
      setMessage(NO_MESSAGE)
    }
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

        <SpecMethodTabs method={method} onChange={changeMethod} />

        <div className="min-h-[300px] p-[18px] rounded-[18px] bg-bg" role="tabpanel">
          {method === 'command' && (
            <CommandMethod
              pasted={pasted}
              onPastedChange={setPasted}
              onApply={applyPasted}
              onError={text => setMessage({ text, error: true })}
            />
          )}

          {method === 'manual' && <ManualMethod draft={draft} setDraft={setDraft} />}

          {method === 'photo' && (
            <PhotoMethod
              signedIn={isAuthenticated}
              onApply={pc => fillDraft(specsFromPhoto(pc), '사진에서 읽은 사양이에요. 틀린 곳은 고친 뒤 저장하세요.', pc)}
            />
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

        <AiConsentField checked={aiConsent} onChange={changeConsent} warning={consentWarning} signedIn={isAuthenticated} />

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
