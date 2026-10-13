import { noticeDate } from '../noticeModel'

export default function NoticeDetail({notice,owner,busy,onBack,onEdit,onRemove}) {
  function confirmDelete() {
    if (window.confirm('이 공지사항을 삭제할까요? 삭제한 글은 복구할 수 없습니다.')) onRemove()
  }
  return <article className="notice-card">
    <div className="notice-detail-heading"><span className="notice-badge">공지사항</span><h2>{notice.title}</h2><p>작성일 {noticeDate(notice.createdAt)}{notice.updatedAt && ` · 수정일 ${noticeDate(notice.updatedAt)}`}</p></div>
    <div className="notice-body">{notice.content}</div>
    <div className="notice-actions"><button disabled={busy} onClick={onBack}>목록으로</button>{owner && <><button disabled={busy} onClick={onEdit}>수정</button><button className="notice-danger" disabled={busy} onClick={confirmDelete}>삭제</button></>}</div>
  </article>
}
