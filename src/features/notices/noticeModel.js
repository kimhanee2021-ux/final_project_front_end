export function normalizeNotice(title, content) {
  const result = { title:String(title || '').trim(),content:String(content || '').trim() }
  if (!result.title || !result.content) throw new Error('제목과 내용을 입력해주세요.')
  if (result.title.length > 255) throw new Error('제목은 255자 이내로 입력해주세요.')
  if (result.content.length > 10000) throw new Error('내용은 10000자 이내로 입력해주세요.')
  return result
}

export const noticeOwner = (notice, user) => Boolean(notice && user && notice.authorId != null && notice.authorId === user.id)
export const noticeDate = value => value ? new Date(value).toLocaleDateString('ko-KR') : '—'
