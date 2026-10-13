import { noticeDate } from '../noticeModel'

export default function NoticeList({result,page,loading,busy,canCreate,error,onCreate,onOpen,onPage,onRetry}) {
  return <>
    <div className="notice-toolbar"><span>전체 <strong>{result?.totalElements ?? 0}</strong>건</span>{canCreate && <button className="notice-primary" disabled={busy} onClick={onCreate}>공지사항 작성</button>}</div>
    <div className="notice-card notice-list" aria-busy={loading}>
      {loading || !result ? <p className="notice-empty" role="status">{error ? '목록을 불러오지 못했습니다.' : '공지사항을 불러오는 중…'}</p> : result.content.length === 0 ? <p className="notice-empty">등록된 공지사항이 없습니다.</p> : <table><thead><tr><th>번호</th><th>제목</th><th>작성일</th></tr></thead><tbody>{result.content.map(item => <tr key={item.id}><td>{item.id}</td><td><button className="notice-title" disabled={busy} onClick={() => onOpen(item.id)}>{item.title}</button></td><td>{noticeDate(item.createdAt)}</td></tr>)}</tbody></table>}
    </div>
    <nav className="notice-pagination" aria-label="공지사항 페이지"><button disabled={!result || page === 0 || loading || busy} onClick={() => onPage(page-1)}>이전</button><span>{result?.totalPages ? result.page+1 : 0} / {result?.totalPages || 0}</span><button disabled={!result || result.last || loading || busy} onClick={() => onPage(page+1)}>다음</button></nav>
    {error && <button disabled={busy} onClick={onRetry}>다시 시도</button>}
  </>
}
