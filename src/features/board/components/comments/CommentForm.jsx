import { useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 댓글·답글 입력 칸. 등록이 끝나면 비우고 onCancel(있으면)로 닫는다.
export default function CommentForm({ onSubmit, onCancel, placeholder, submitLabel = '등록' }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent('')
      onCancel?.()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form className="flex flex-col gap-[10px] mt-[10px]" onSubmit={submit}>
      <textarea
        value={content}
        onChange={event => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        rows={2}
        required
        className="w-full resize-y px-[16px] py-[12px] border-0 rounded-[16px] bg-bg text-text text-[14px] [font-family:inherit]"
      />
      {error && <p className="text-[#e5484d] text-[13px] my-[4px]">{error}</p>}
      <div className="flex justify-end gap-[8px]">
        {onCancel && (
          <button type="button" className="gs-secondary-button" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="gs-primary-button" disabled={submitting} aria-busy={submitting}>
          {submitting ? '등록 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
