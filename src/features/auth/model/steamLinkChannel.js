// 스팀 연동을 새 창(팝업)으로 띄웠을 때, 팝업이 끝났다는 소식을 원래 창에 전하는 통로.
// 팝업은 스팀 사이트를 다녀오면서 원래 창과의 연결(window.opener)이 끊길 수 있어서, 같은 사이트 안의 창끼리 쓰는 BroadcastChannel로 알린다.
const CHANNEL = 'gamesense-steam-link'

// 원래 창 안에서 "스팀 연동이 끝났어요"를 알리는 브라우저 이벤트 이름. 소비 분석·라이브러리처럼 연동 여부에 따라 달라지는 화면이 이걸 듣고 다시 불러온다.
export const STEAM_LINKED_EVENT = 'gamesense:steam-linked'

let announced = false

// 팝업에서 호출: 원래 창들에 연동이 끝났다고 알린다 (개발 모드에서 effect가 두 번 돌아도 한 번만 보낸다).
export function announceSteamLinked() {
  if (announced || typeof BroadcastChannel === 'undefined') return
  announced = true
  const channel = new BroadcastChannel(CHANNEL)
  channel.postMessage({ type: 'linked' })
  channel.close()
}

// 원래 창에서 호출: 팝업이 연동을 마치면 callback을 부른다. 반환값은 듣기를 멈추는 함수.
export function listenSteamLinked(callback) {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const channel = new BroadcastChannel(CHANNEL)
  channel.onmessage = event => {
    if (event.data?.type === 'linked') callback()
  }
  return () => channel.close()
}

// 연동 창을 화면 가운데에 띄운다. 팝업이 차단되면 null.
export function openSteamPopup(url) {
  const width = 520
  const height = 760
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
  return window.open(url, 'gamesense-steam-link', `popup=yes,width=${width},height=${height},left=${left},top=${top}`)
}
