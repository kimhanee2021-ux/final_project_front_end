import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { createPost, fetchPost, updatePost } from '../api'
import { emptyForm, toForm, toPayload } from '../model/postForm'

// 글쓰기·수정 폼 상태. postId가 있으면 그 글을 불러와 채우고, 내 글이 아니면 forbidden.
// submit은 저장한 글의 id를 onSaved로 넘긴다.
export function usePostEditor(postId, userId, onSaved) {
  const isEdit = Boolean(postId)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [forbidden, setForbidden] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    let active = true
    fetchPost(postId)
      .then(post => {
        if (!active) return
        if (post.authorId !== userId) {
          setForbidden(true)
          return
        }
        setForm(toForm(post))
      })
      .catch(err => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [postId, isEdit, userId])

  const update = patch => setForm(current => ({ ...current, ...patch }))

  const submit = async event => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = toPayload(form)
      const result = isEdit ? await updatePost(postId, payload) : await createPost(payload)
      onSaved(isEdit ? postId : result.id)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return { isEdit, form, update, loading, forbidden, submitting, error, submit }
}
