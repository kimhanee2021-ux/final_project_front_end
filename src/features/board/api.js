import apiClient from '../../utils/apiClient'

// 백엔드 BoardController/BoardCommentController/BoardLikeController(/api/board/**) 연동.
// 게시글 조회를 포함한 모든 /api/board/** 엔드포인트가 로그인(JWT)을 요구한다.
export const BOARD_PAGE_SIZE = 20
export const COMMENT_PAGE_SIZE = 20

export async function fetchPosts({ page = 0, category, keyword, signal } = {}) {
  const { data } = await apiClient.get('/api/board', {
    params: { page, size: BOARD_PAGE_SIZE, category: category || undefined, keyword: keyword || undefined },
    signal,
  })
  return data
}

export async function fetchPost(postId, signal) {
  const { data } = await apiClient.get(`/api/board/${postId}`, { signal })
  return data
}

export async function createPost(payload) {
  const { data } = await apiClient.post('/api/board', payload)
  return data
}

export async function updatePost(postId, payload) {
  const { data } = await apiClient.put(`/api/board/${postId}`, payload)
  return data
}

export async function deletePost(postId) {
  await apiClient.delete(`/api/board/${postId}`)
}

export async function fetchComments(postId, { page = 0, size = COMMENT_PAGE_SIZE, signal } = {}) {
  const { data } = await apiClient.get(`/api/board/${postId}/comments`, { params: { page, size }, signal })
  return data
}

export async function createComment(postId, { content, parentId }) {
  const { data } = await apiClient.post(`/api/board/${postId}/comments`, { content, parentId })
  return data
}

export async function updateComment(postId, commentId, content) {
  const { data } = await apiClient.put(`/api/board/${postId}/comments/${commentId}`, { content })
  return data
}

export async function deleteComment(postId, commentId) {
  await apiClient.delete(`/api/board/${postId}/comments/${commentId}`)
}

export async function fetchLikeStatus(postId) {
  const { data } = await apiClient.get(`/api/board/${postId}/likes`)
  return data
}

export async function likePost(postId) {
  const { data } = await apiClient.put(`/api/board/${postId}/likes`)
  return data
}

export async function cancelLike(postId) {
  const { data } = await apiClient.delete(`/api/board/${postId}/likes`)
  return data
}
