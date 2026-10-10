import apiClient from '../../utils/apiClient'

// 백엔드 UserController(/api/users/me) 연동. 대상은 항상 JWT의 본인 계정이다.

export async function getMyInfo() {
  const { data } = await apiClient.get('/api/users/me')
  return data
}

// null(또는 생략)인 필드는 변경하지 않는다. 비밀번호 변경 시 currentPassword가 필수.
export async function updateMyInfo({ nickname, currentPassword, newPassword }) {
  const { data } = await apiClient.patch('/api/users/me', {
    nickname: nickname ?? null,
    currentPassword: currentPassword ?? null,
    newPassword: newPassword ?? null,
  })
  return data
}

export async function deleteMyAccount() {
  await apiClient.delete('/api/users/me')
}
