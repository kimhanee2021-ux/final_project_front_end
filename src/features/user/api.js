import apiClient from '@/shared/lib/apiClient'


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
