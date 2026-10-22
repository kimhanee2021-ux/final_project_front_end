// 내 PC 종합평가 결과를 계정별로 이 브라우저(localStorage)에 보관한다.
// 같은 계정이 같은 사양으로 다시 들어오면 새로고침·재방문해도 AI를 다시 부르지 않고 저장된 평가를 그대로 보여준다.
// 사양이 바뀌면 저장본을 버리고 새로 평가하고, 보유 게임이 바뀌면(종합 설명의 key가 달라짐) 종합평가만 새로 받는다.
// 게임별 성능은 게임마다 따로 저장해 두어서 새로 생긴 게임만 평가한다. 실패·한도 초과·미완료 결과는 저장하지 않는다.
const VERSION = 'v1'
const storageKey = userId => `gamesense-pc-evaluation-${VERSION}:${userId}`

function read(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)))
  } catch {
    return null
  }
}

function readyOnly(results) {
  return Object.fromEntries(Object.entries(results ?? {}).filter(([, result]) => result?.explanationStatus === 'READY'))
}

// 저장된 평가를 꺼낸다. 이 사양(pc)으로 저장한 것이 아니면 빈 값. overview는 { key, result } 모양이다.
export function loadEvaluation(userId, pc) {
  const saved = userId == null ? null : read(userId)
  if (!saved || saved.pcKey !== JSON.stringify(pc)) return { overview: null, results: {} }
  const overview = saved.overview?.key && saved.overview.result?.explanationStatus === 'READY' ? saved.overview : null
  return { overview, results: readyOnly(saved.results) }
}

// patch: { overview } 또는 { results }. 같은 사양의 저장본에 합치고, 다른 사양이면 새로 시작한다.
export function saveEvaluation(userId, pc, patch) {
  if (userId == null) return
  const pcKey = JSON.stringify(pc)
  const saved = read(userId)
  const base = saved?.pcKey === pcKey ? saved : { pcKey, overview: null, results: {} }
  const next = { ...base, ...patch, pcKey, results: patch.results ? readyOnly(patch.results) : readyOnly(base.results) }
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(next))
  } catch {
    /* 저장소가 가득 찼거나 막혀 있어도 이번 화면에서는 결과를 그대로 쓴다. */
  }
}
