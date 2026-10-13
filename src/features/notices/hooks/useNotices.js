import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { noticeApi } from '../api'
import { mockNotices, mockNoticePage } from '../mocks/noticeMock'
import { normalizeNotice, noticeOwner } from '../noticeModel'

export function useNotices({ preview, user, enabled }) {
  const { signOut } = useAuth()
  const [page, setPage] = useState(0)
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const pending = useRef(false)
  const generation = useRef(0)

  useEffect(() => () => { generation.current++ }, [])
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const source = preview ? Promise.resolve(mockNoticePage(page)) : noticeApi.page(page,controller.signal)
    source.then(data => {
      if (controller.signal.aborted) return
      setResult(data); setLoading(false)
    }).catch(e => {
      if (controller.signal.aborted || e.name === 'AbortError') return
      if (e.status === 401) signOut()
      setResult(null); setError(e.message); setLoading(false)
    })
    return () => controller.abort()
  }, [enabled,preview,page,revision,signOut])

  async function perform(task) {
    if (pending.current || !enabled) return
    pending.current = true; setBusy(true); setError(''); setMessage('')
    const version = generation.current
    const current = () => version === generation.current
    try { await task(current) }
    catch(e) {
      if (current() && e.name !== 'AbortError') {
        if (e.status === 401) signOut()
        setError(e.message)
      }
    } finally { if (current()) { pending.current = false; setBusy(false) } }
  }
  const owner = !preview && noticeOwner(selected,user)
  function openNotice(id) {
    perform(async current => {
      const data = preview ? mockNotices.find(n=>n.id===id) : await noticeApi.find(id)
      if (current()) { setSelected(data); setEditing(null) }
    })
  }
  function save(event) {
    event.preventDefault()
    if (preview || !user || !editing) return
    const form = new FormData(event.currentTarget)
    perform(async current => {
      const body = normalizeNotice(form.get('title'),form.get('content'))
      const saved = await noticeApi.save(editing.id,body)
      if (current()) {
        setSelected(saved); setEditing(null); setPage(0); setLoading(true)
        setRevision(n=>n+1); setMessage('공지사항을 저장했습니다.')
      }
    })
  }
  function remove() {
    if (!owner || !selected) return
    perform(async current => {
      await noticeApi.remove(selected.id)
      if (current()) {
        setSelected(null); setPage(0); setLoading(true); setRevision(n=>n+1)
        setMessage('공지사항을 삭제했습니다.')
      }
    })
  }
  function startCreate() { if (!preview && user && !pending.current) { setEditing({}); setError(''); setMessage('') } }
  function startEdit() { if (owner && !pending.current) setEditing(selected) }
  function cancelEdit() { if (!pending.current) setEditing(null) }
  function showList() { if (!pending.current) { setSelected(null); setMessage('') } }
  function changePage(next) { if (!pending.current) { setLoading(true); setPage(next); setError('') } }
  function retry() { if (!pending.current) { setError(''); setLoading(true); setRevision(n=>n+1) } }
  return { page,result,selected,editing,busy,loading,error,message,owner,openNotice,save,remove,startCreate,startEdit,cancelEdit,showList,changePage,retry }
}
