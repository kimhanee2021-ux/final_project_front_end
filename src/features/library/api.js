import apiClient from '../../utils/apiClient'

// 백엔드 LibraryController(/api/library) 연동.
// 조회 전용 API가 없어 동기화(POST) 응답을 그대로 보유 게임 목록으로 사용한다.
// 항목: { appId, name, playtimeForever(분), playtime2Weeks(분), lastPlayedAt, iconUrl }
export async function syncSteamLibrary() {
  // 스팀 API를 거치므로 일반 요청보다 오래 걸릴 수 있다.
  const { data } = await apiClient.post('/api/library/steam/sync', null, { timeout: 30000 })
  return data
}

export const STEAM_NOT_LINKED_MESSAGE = '스팀 계정이 연동되어 있지 않습니다'
