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

// 스팀 연동을 끊는다. 연동한 계정에서 동기화한 보유 게임은 서버가 지우고, 직접 가져온 구매내역은 남긴다.
export async function unlinkSteam() {
  await apiClient.delete('/api/users/me/steam')
}
