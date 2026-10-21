export function createAiRequest(client) {
  return async function request(path, {
    token,
    method = 'GET',
    body,
    signal
  } = {}) {
    const multipart = body instanceof FormData;
    try {
      const response = await client.request({
        url: `/api${path}`,
        method,
        signal,
        timeout: 0,
        headers: {
          ...(token ? {
            Authorization: `Bearer ${token}`
          } : {}),
          ...(multipart ? {
            'Content-Type': undefined
          } : {})
        },
        ...(body ? {
          data: body
        } : {})
      });
      return response.status === 204 ? null : response.data;
    } catch (cause) {
      if (signal?.aborted || cause.name === 'AbortError' || cause.code === 'ERR_CANCELED') {
        throw new DOMException('요청을 취소했습니다.', 'AbortError');
      }
      const error = new Error(cause.response?.data?.error || cause.response?.data?.message || (cause.response ? '요청을 처리하지 못했습니다.' : '서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'), {
        cause
      });
      error.status = cause.response?.status;
      throw error;
    }
  };
}
