import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { SPEC_COMMAND } from '../../../model/pcSpecs'
import { SPEC_INPUT } from './specInputClass'

// ① 명령어 결과: PowerShell 명령어를 복사해 실행하고, 나온 결과를 붙여넣어 불러온다.
// onError: 복사가 막혔을 때 안내 문구
export default function CommandMethod({ pasted, onPastedChange, onApply, onError }) {
  const [copied, setCopied] = useState(false)
  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(SPEC_COMMAND)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      onError('복사하지 못했어요. 명령어를 직접 드래그해서 복사해 주세요.')
    }
  }
  return (
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
        className={`${SPEC_INPUT} !h-[76px] py-[12px] resize-y`}
        value={pasted}
        onChange={event => onPastedChange(event.target.value)}
        aria-label="명령어 결과 붙여넣기"
        placeholder='{"cpu":"...","gpu":"...","ram":"16 GB","storage":"..."}'
      />
      <div>
        <button type="button" className="gs-primary-button" onClick={onApply} disabled={!pasted.trim()}>
          불러오기
        </button>
      </div>
    </section>
  )
}
