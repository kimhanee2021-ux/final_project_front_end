// AI 분석 결과를 브라우저에 저장해 두고, 같은 찜 목록·같은 날이면 다시 쓴다.
const STORAGE_KEY = 'gamesense-ai-analysis' // 브라우저에 저장할 때 쓰는 키

// 오늘 날짜를 YYYY-MM-DD 형식으로 (지역 날짜 기준)
function todayStr() {
  return new Date().toLocaleDateString('sv-SE')
}

// 찜 목록 묶음을 비교용 문자열로 바꾼다 (순서가 달라도 같은 묶음이면 같은 키)
export function idsKeyOf(appIds) {
  return [...appIds].sort((a, b) => a - b).join(',')
}

// 저장된 분석을 읽는다. 찜 목록과 날짜가 모두 같을 때만 돌려준다 ({ items, message })
export function readSaved(idsKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    return saved.idsKey === idsKey && saved.date === todayStr() ? saved : null
  } catch {
    return null
  }
}

// 분석 결과를 저장한다 (찜 목록 묶음, 오늘 날짜, 전체 요약을 함께)
export function writeSaved(idsKey, items, message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ idsKey, date: todayStr(), items, message }))
  } catch {
    // 저장소를 쓸 수 없으면 조용히 넘어간다 (화면 상태로는 계속 동작)
  }
}
