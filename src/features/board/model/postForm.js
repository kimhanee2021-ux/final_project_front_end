import { BOARD_CATEGORIES } from './boardModel.js'

// 글쓰기 폼 값 ↔ 서버 요청 본문

// 새 글의 처음 값
export const emptyForm = { category: BOARD_CATEGORIES[0], tag: '', title: '', content: '', isAnonymous: false }

// 불러온 글 → 폼 값
export function toForm(post) {
  return {
    category: post.category,
    tag: post.tag ?? '',
    title: post.title,
    content: post.content,
    isAnonymous: post.isAnonymous,
  }
}

// 폼 값 → 저장 요청 (앞뒤 공백을 지우고, 빈 태그는 null)
export function toPayload(form) {
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
