import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useAuth } from '../../features/auth/context/AuthContext'
import { BOARD_CATEGORIES } from '../../features/board/boardModel'
import { createPost, fetchPost, updatePost } from '../../features/board/api'
import { getErrorMessage } from '../../utils/apiClient'

const emptyForm = { category: BOARD_CATEGORIES[0], tag: '', title: '', content: '', isAnonymous: false }

function toForm(post) {
  return {
    category: post.category,
    tag: post.tag ?? '',
    title: post.title,
    content: post.content,
    isAnonymous: post.isAnonymous,
  }
}

function toPayload(form) {
  return {
    category: form.category,
    appId: null,
    tag: form.tag.trim() || null,
    title: form.title.trim(),
    content: form.content.trim(),
    isAnonymous: form.isAnonymous,
    expiresAt: null,
  }
}

export default function CommunityWritePage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [forbidden, setForbidden] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    let active = true
    fetchPost(id)
      .then(post => {
        if (!active) return
        if (post.authorId !== user?.id) {
          setForbidden(true)
          return
        }
        setForm(toForm(post))
      })
      .catch(err => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id, isEdit, user?.id])

  if (forbidden) return <Navigate to={`/community/${id}`} replace />
  if (!isAuthenticated) return <Navigate to="/community" replace />

  const update = patch => setForm(current => ({ ...current, ...patch }))

  const submit = async event => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = toPayload(form)
      const result = isEdit ? await updatePost(id, payload) : await createPost(payload)
      navigate(`/community/${isEdit ? id : result.id}`)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="gs-empty" role="status">
        <GSIcon name="search" size={38} />
        <h3>불러오는 중이에요</h3>
      </div>
    )
  }

  const fieldClass = 'px-[14px] py-[11px] border border-gs-border rounded-[10px] bg-gs-panel text-gs-text text-[13px] [font-family:inherit]'
  const labelClass = 'flex flex-col gap-[7px] text-[12px] text-gs-muted'

  return (
    <section className="max-w-[640px] mx-auto">
      <div className="gs-section-heading">
        <div>
          <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
          <h1>{isEdit ? '글 수정' : '글쓰기'}</h1>
        </div>
      </div>
      <form className="flex flex-col gap-[16px]" onSubmit={submit}>
        <label className={labelClass}>
          <span>카테고리</span>
          <select value={form.category} onChange={event => update({ category: event.target.value })} required className={fieldClass}>
            {BOARD_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <span>태그 (선택)</span>
          <input
            value={form.tag}
            onChange={event => update({ tag: event.target.value })}
            maxLength={50}
            placeholder="예: 세일정보"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span>제목</span>
          <input
            value={form.title}
            onChange={event => update({ title: event.target.value })}
            maxLength={255}
            required
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          <span>내용</span>
          <textarea
            value={form.content}
            onChange={event => update({ content: event.target.value })}
            rows={10}
            required
            className={`${fieldClass} resize-y`}
          />
        </label>
        <label className="flex items-center gap-[9px] text-[12px] text-gs-muted">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={event => update({ isAnonymous: event.target.checked })}
            className="w-auto p-0"
          />
          <span>익명으로 작성</span>
        </label>
        {error && (
          <p className="text-[#e45a67] text-[12px] my-[4px]" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-[10px] mt-[6px]">
          <button type="button" className="gs-secondary-button" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="gs-primary-button" disabled={submitting} aria-busy={submitting}>
            {submitting ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </section>
  )
}
