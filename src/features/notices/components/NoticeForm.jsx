export default function NoticeForm({ notice,busy,onSave,onCancel }) {
  return <form className="notice-card notice-form" onSubmit={onSave}>
    <h2>{notice.id ? '공지사항 수정' : '공지사항 작성'}</h2>
    <label>제목<input name="title" defaultValue={notice.title || ''} maxLength={255} required disabled={busy} placeholder="공지사항 제목을 입력하세요" /></label>
    <label>내용<textarea name="content" defaultValue={notice.content || ''} maxLength={10000} rows={12} required disabled={busy} placeholder="안내할 내용을 입력하세요" /></label>
    <div className="notice-actions"><button type="button" disabled={busy} onClick={onCancel}>취소</button><button className="notice-primary" disabled={busy}>{busy ? '저장 중…' : '저장'}</button></div>
  </form>
}
