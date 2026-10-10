import { useEffect, useState } from 'react'
import { request } from './noticeApi'
import './notices.css'

const date = value => value ? new Date(value).toLocaleDateString('ko-KR') : '—'

export default function Notices() {
  const [token, setToken] = useState(() => sessionStorage.getItem('noticeToken') || '')
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(0)
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function logout() {
    sessionStorage.removeItem('noticeToken')
    setToken(''); setUser(null); setResult(null); setSelected(null); setEditing(null)
  }

  function handleError(error) {
    if (error.status === 401) logout()
    setError(error.message)
  }

  useEffect(() => {
    document.title = '공지사항 게시판'
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    Promise.all([
      request('/me', { token, signal: controller.signal }),
      request(`/notices?page=${page}&size=10`, { token, signal: controller.signal }),
    ]).then(([me, notices]) => {
      setUser(me); setResult(notices); setLoading(false)
    }).catch(err => {
      if (err.name === 'AbortError') return
      if (err.status === 401) {
        sessionStorage.removeItem('noticeToken'); setToken(''); setUser(null); setResult(null)
      }
      setResult(null); setError(err.message); setLoading(false)
    })
    return () => controller.abort()
  }, [token, page, revision])

  async function login(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const auth = await request('/auth/login', { method: 'POST', body: { email: form.get('email'), password: form.get('password') } })
      sessionStorage.setItem('noticeToken', auth.token)
      setLoading(true); setToken(auth.token); setPage(0)
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }

  async function openNotice(id) {
    setBusy(true); setError(''); setMessage('')
    try { setSelected(await request(`/notices/${id}`, { token })); setEditing(null) }
    catch (err) { handleError(err) } finally { setBusy(false) }
  }

  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const form = new FormData(event.currentTarget)
    const body = { title: String(form.get('title')).trim(), content: String(form.get('content')).trim() }
    if (!body.title || !body.content) { setError('제목과 내용을 입력해주세요.'); setBusy(false); return }
    try {
      const saved = await request(editing.id ? `/notices/${editing.id}` : '/notices', { token, method: editing.id ? 'PUT' : 'POST', body })
      setSelected(saved); setEditing(null); setPage(0); setRevision(v => v + 1); setMessage('공지사항을 저장했습니다.')
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }

  async function remove() {
    if (!window.confirm('이 공지사항을 삭제할까요? 삭제한 글은 복구할 수 없습니다.')) return
    setBusy(true); setError('')
    try {
      await request(`/notices/${selected.id}`, { token, method: 'DELETE' })
      setSelected(null); setPage(0); setRevision(v => v + 1); setMessage('공지사항을 삭제했습니다.')
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }

  const owner = selected && user && selected.authorId === user.id
  return <section className="notice-page">
    <header className="notice-header"><div><span className="notice-eyebrow">NOTICE</span><h1>공지사항 게시판</h1><p>서비스 소식과 안내를 확인하세요.</p></div>
      {token && <div className="notice-account"><span>{user?.nickname}</span><button onClick={logout}>로그아웃</button></div>}
    </header>
    {error && <p className="notice-alert" role="alert">{error}</p>}
    {message && <p className="notice-success" role="status">{message}</p>}
    {!token ? <form className="notice-login" onSubmit={login}><h2>로그인</h2><p>공지사항을 확인하려면 로그인해주세요.</p>
      <label>이메일<input name="email" type="email" autoComplete="username" required /></label>
      <label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="notice-primary" disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
    </form> : editing ? <form className="notice-card notice-form" onSubmit={save}>
      <h2>{editing.id ? '공지사항 수정' : '공지사항 작성'}</h2>
      <label>제목<input name="title" defaultValue={editing.title || ''} maxLength={255} required placeholder="공지사항 제목을 입력하세요" /></label>
      <label>내용<textarea name="content" defaultValue={editing.content || ''} maxLength={10000} rows={12} required placeholder="안내할 내용을 입력하세요" /></label>
      <div className="notice-actions"><button type="button" disabled={busy} onClick={() => setEditing(null)}>취소</button><button className="notice-primary" disabled={busy}>{busy ? '저장 중…' : '저장'}</button></div>
    </form> : selected ? <article className="notice-card">
      <div className="notice-detail-heading"><span className="notice-badge">공지사항</span><h2>{selected.title}</h2><p>작성일 {date(selected.createdAt)}{selected.updatedAt && ` · 수정일 ${date(selected.updatedAt)}`}</p></div>
      <div className="notice-body">{selected.content}</div>
      <div className="notice-actions"><button disabled={busy} onClick={() => setSelected(null)}>목록으로</button>{owner && <><button disabled={busy} onClick={() => setEditing(selected)}>수정</button><button className="notice-danger" disabled={busy} onClick={remove}>삭제</button></>}</div>
    </article> : <>
      <div className="notice-toolbar"><span>전체 <strong>{result?.totalElements ?? 0}</strong>건</span><button className="notice-primary" disabled={busy || !user} onClick={() => { setEditing({}); setError(''); setMessage('') }}>공지사항 작성</button></div>
      <div className="notice-card notice-list" aria-busy={loading}>
        {loading || !result ? <p className="notice-empty">{error ? '목록을 불러오지 못했습니다.' : '공지사항을 불러오는 중…'}</p> : result.content.length === 0 ? <p className="notice-empty">등록된 공지사항이 없습니다.</p> : <table><thead><tr><th>번호</th><th>제목</th><th>작성일</th></tr></thead><tbody>{result.content.map(item => <tr key={item.id}><td>{item.id}</td><td><button className="notice-title" disabled={busy} onClick={() => openNotice(item.id)}>{item.title}</button></td><td>{date(item.createdAt)}</td></tr>)}</tbody></table>}
      </div>
      <nav className="notice-pagination" aria-label="공지사항 페이지"><button disabled={!result || page === 0 || loading || busy} onClick={() => { setLoading(true); setPage(p => p - 1) }}>이전</button><span>{result?.totalPages ? result.page + 1 : 0} / {result?.totalPages || 0}</span><button disabled={!result || result.last || loading || busy} onClick={() => { setLoading(true); setPage(p => p + 1) }}>다음</button></nav>
      {error && <button onClick={() => { setError(''); setLoading(true); setRevision(v => v + 1) }}>다시 시도</button>}
    </>}
  </section>
}
