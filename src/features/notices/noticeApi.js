// The injected client is the team's authenticated Axios client in production.
export function createNoticeApi(client) {
  async function request(config) {
    try {
      const response = await client.request(config)
      return response.status === 204 ? null : response.data
    } catch (cause) {
      if (cause.code === 'ERR_CANCELED' || cause.name === 'AbortError') {
        throw new DOMException('요청을 취소했습니다.', 'AbortError')
      }
      const data = cause.response?.data
      const error = new Error(data?.error || data?.message ||
        (cause.response ? '공지사항 요청을 처리하지 못했습니다.' : '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'), { cause })
      error.status = cause.response?.status
      error.code = data?.code
      error.fields = data?.errors || {}
      throw error
    }
  }
  return {
    page: (page = 0, signal) => request({ method:'GET', url:'/api/notices', params:{page,size:10},signal }),
    find: (id, signal) => request({ method:'GET',url:`/api/notices/${id}`,signal }),
    save: (id, data) => request({ method:id ? 'PUT':'POST',url:id ? `/api/notices/${id}`:'/api/notices',data }),
    remove: id => request({ method:'DELETE',url:`/api/notices/${id}` }),
  }
}
