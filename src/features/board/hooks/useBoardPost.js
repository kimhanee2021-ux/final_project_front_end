import { useCallback, useEffect, useState } from 'react'
import {
  cancelLike,
  deleteComment as deleteCommentApi,
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  fetchComments,
  fetchLikeStatus,
  fetchPost,
  likePost,
} from '../api'
import { getErrorMessage } from '@/shared/lib/apiClient'

const emptyComments = { items: [], page: 0, last: true, total: 0 }

// 게시글 상세 + 댓글 + 좋아요를 한 화면에서 쓰기 위해 모아둔 훅.
export function useBoardPost(postId, { canLike } = {}) {
  const [post, setPost] = useState(null)
  const [postLoading, setPostLoading] = useState(true)
  const [postError, setPostError] = useState('')
  const [comments, setComments] = useState(emptyComments)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentError, setCommentError] = useState('')
  const [like, setLike] = useState({ likeCount: 0, liked: false })
  const [likeLoading, setLikeLoading] = useState(false)

  // 최초 진입 시 불러오기: setState는 promise 콜백 안에서만 호출한다 (effect 본문에서 동기 호출 금지).
  useEffect(() => {
    let active = true
    fetchPost(postId)
      .then(data => { if (active) setPost(data) })
      .catch(error => { if (active) setPostError(getErrorMessage(error)) })
      .finally(() => { if (active) setPostLoading(false) })
    return () => { active = false }
  }, [postId])

  useEffect(() => {
    let active = true
    fetchComments(postId, { page: 0 })
      .then(data => {
        if (!active) return
        setComments({ items: data.content, page: data.page, last: data.last, total: data.totalElements })
      })
      .catch(error => { if (active) setCommentError(getErrorMessage(error)) })
      .finally(() => { if (active) setCommentsLoading(false) })
    return () => { active = false }
  }, [postId])

  useEffect(() => {
    if (!canLike) return
    fetchLikeStatus(postId).then(setLike).catch(() => {})
  }, [postId, canLike])

  // 재조회용(더보기/글 수정 후 등 사용자 동작으로 호출되는 함수들). effect 밖에서만 쓴다.
  const reloadPost = useCallback(async () => {
    setPostLoading(true)
    try {
      setPost(await fetchPost(postId))
      setPostError('')
    } catch (error) {
      setPostError(getErrorMessage(error))
    } finally {
      setPostLoading(false)
    }
  }, [postId])

  const loadComments = useCallback(async (page = 0) => {
    setCommentsLoading(true)
    try {
      const data = await fetchComments(postId, { page })
      setComments(current => ({
        items: page === 0 ? data.content : [...current.items, ...data.content],
        page: data.page,
        last: data.last,
        total: data.totalElements,
      }))
      setCommentError('')
    } catch (error) {
      setCommentError(getErrorMessage(error))
    } finally {
      setCommentsLoading(false)
    }
  }, [postId])

  const addComment = async (content, parentId) => {
    await createCommentApi(postId, { content, parentId })
    await loadComments(0)
  }

  const editComment = async (commentId, content) => {
    const updated = await updateCommentApi(postId, commentId, content)
    setComments(current => ({
      ...current,
      items: current.items.map(item => (item.id === commentId ? updated : item)),
    }))
  }

  const removeComment = async commentId => {
    await deleteCommentApi(postId, commentId)
    setComments(current => ({
      ...current,
      items: current.items.filter(item => item.id !== commentId),
      total: Math.max(0, current.total - 1),
    }))
  }

  const toggleLike = async () => {
    setLikeLoading(true)
    try {
      setLike(await (like.liked ? cancelLike(postId) : likePost(postId)))
    } finally {
      setLikeLoading(false)
    }
  }

  return {
    post,
    postLoading,
    postError,
    reloadPost,
    comments: comments.items,
    commentsTotal: comments.total,
    commentsLast: comments.last,
    commentsLoading,
    commentError,
    loadMoreComments: () => loadComments(comments.page + 1),
    addComment,
    editComment,
    removeComment,
    like,
    likeLoading,
    toggleLike,
  }
}
