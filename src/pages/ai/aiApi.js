export async function api(path, {token, method = 'GET', body, signal} = {}) {
  const multipart = body instanceof FormData
  let response
  try {
    response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || ''}/api${path}`, {method, signal, headers: {
      ...(token ? {Authorization: `Bearer ${token}`} : {}), ...(body && !multipart ? {'Content-Type':'application/json'} : {})
    }, ...(body ? {body:multipart ? body : JSON.stringify(body)} : {})})
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.', {cause:error})
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || data.message || '요청을 처리하지 못했습니다.')
    error.status = response.status
    throw error
  }
  return data
}
