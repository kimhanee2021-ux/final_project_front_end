import { Navigate, useNavigate } from 'react-router-dom'
import { PageHeading } from '@/shared/ui'
import { CatalogMessage } from '@/features/games'
import { useAuth } from '@/features/auth'
import { BOARD_CATEGORIES } from '../../model/boardModel'
import { usePostEditor } from '../../hooks/usePostEditor'

const fieldClass = 'px-[16px] py-[12px] border-0 rounded-[14px] bg-bg text-text text-[15px] [font-family:inherit]'
const labelClass = 'flex flex-col gap-[8px] text-[13px] text-muted'

// 글쓰기(postId 없음) · 글 수정(postId 있음) 화면. 저장하면 그 글로 이동한다.
// 로그인하지 않았으면 목록으로, 남의 글을 고치려 하면 그 글로 돌려보낸다.
export default function PostEditor({ postId }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isEdit, form, update, loading, forbidden, submitting, error, submit } = usePostEditor(postId, user?.id, savedId =>
    navigate(`/community/${savedId}`)
  )

  if (forbidden) return <Navigate to={`/community/${postId}`} replace />
  if (!isAuthenticated) return <Navigate to="/community" replace />
  if (loading) return <CatalogMessage icon="search" title="불러오는 중이에요" role="status" />

  return (
    <section className="max-w-[640px] mx-auto">
      <PageHeading title={isEdit ? '글 수정' : '글쓰기'} />
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
        <label className="flex items-center gap-[9px] text-[14px] text-muted">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={event => update({ isAnonymous: event.target.checked })}
            className="w-auto p-0"
          />
          <span>익명으로 작성</span>
        </label>
        {error && (
          <p className="text-[#e5484d] text-[13px] my-[4px]" role="alert">
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
