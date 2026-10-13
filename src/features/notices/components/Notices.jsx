import { useEffect } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { authLink } from '../../auth/authSession'
import { useNotices } from '../hooks/useNotices'
import NoticeForm from './NoticeForm'
import NoticeDetail from './NoticeDetail'
import NoticeList from './NoticeList'
import '../../../styles/notices.css'

export default function Notices() {
  const {user,isAuthenticated,isAuthLoading} = useAuth()
  const [search] = useSearchParams()
  const preview = import.meta.env.DEV && search.get('preview') === '1'
  useEffect(()=>{document.title='공지사항'},[])
  return <NoticeWorkspace key={preview ? 'preview' : isAuthenticated ? `user-${user.id}` : 'guest'} preview={preview} user={isAuthenticated ? user : null} authLoading={isAuthLoading} />
}

function NoticeWorkspace({preview,user,authLoading}) {
  const enabled = preview || Boolean(user)
  const state = useNotices({preview,user,enabled})
  return <section className="notice-page">
    <header className="notice-header"><div><span className="notice-eyebrow">NOTICE</span><h1>공지사항</h1><p>서비스 소식과 안내를 확인하세요.</p></div>{preview && <div className="notice-account"><span className="notice-badge">샘플 데이터 · 읽기 전용</span><Link to={authLink('login','/notices')}>로그인해서 이용</Link></div>}</header>
    {state.error && <p className="notice-alert" role="alert">{state.error}</p>}
    {state.message && <p className="notice-success" role="status">{state.message}</p>}
    {!preview && authLoading ? <p role="status">로그인을 확인하고 있어요.</p> : !enabled ? <div className="notice-login"><h2>로그인 후 이용해주세요</h2><p>팀 공통 계정으로 공지사항을 확인하고 작성할 수 있어요.</p><Link className="notice-primary notice-login-link" to={authLink('login','/notices')}>로그인</Link>{import.meta.env.DEV && <Link className="notice-preview-link" to="/notices?preview=1">샘플로 둘러보기</Link>}</div> : state.editing ? <NoticeForm key={state.editing.id || 'new'} notice={state.editing} busy={state.busy} onSave={state.save} onCancel={state.cancelEdit} /> : state.selected ? <NoticeDetail notice={state.selected} owner={state.owner} busy={state.busy} onBack={state.showList} onEdit={state.startEdit} onRemove={state.remove} /> : <NoticeList result={state.result} page={state.page} loading={state.loading} busy={state.busy} canCreate={!preview && Boolean(user)} error={state.error} onCreate={state.startCreate} onOpen={state.openNotice} onPage={state.changePage} onRetry={state.retry} />}
  </section>
}
