export async function request(path, { token, method = 'GET', body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method, signal,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || data.message || ({ 401: '로그인이 필요합니다.', 403: '작성자만 수정하거나 삭제할 수 있습니다.', 404: '공지사항을 찾을 수 없습니다.' }[response.status]) || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.')
    error.status = response.status
    throw error
  }
  return data
}
