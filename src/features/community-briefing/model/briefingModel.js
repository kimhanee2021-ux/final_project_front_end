const labels = { SCHEDULE: '안내된 일정', CHANGE: '중요한 변화', CAUTION: '주의할 내용', PROGRESS: '문제의 진행 상태', CORRECTION: '변경·정정', TOPIC: '함께 알아둘 소식' }
export const BRIEFING_GROUPS = [
  { id: 'NOTICE', label: '공지·운영 안내', mark: '◎', description: '알아둘 안내와 달라진 일정' },
  { id: 'UPDATE', label: '업데이트·패치', mark: '✦', description: '새로운 콘텐츠와 바뀐 플레이' },
  { id: 'EVENT', label: '이벤트·행사', mark: '◇', description: '참여할 기회와 놓치기 쉬운 혜택' },
]
const groupTopics = {
  NOTICE: [['OPERATION', '운영'], ['MAINTENANCE', '점검'], ['INCIDENT', '장애'], ['CORRECTION', '정정']],
  UPDATE: [['CONTENT', '콘텐츠'], ['BALANCE', '밸런스'], ['FIX', '수정'], ['DEVELOPMENT', '개발']],
  EVENT: [['EVENT', '행사'], ['BENEFIT', '혜택'], ['TRIAL', '체험'], ['RECRUITMENT', '모집']],
}
export const topicsForGroup = group => (groupTopics[group] || []).map(([id, label]) => ({ id, label }))
export const topicLabel = id => Object.values(groupTopics).flat().find(topic => topic[0] === id)?.[1] || '소식'
export const categoryLabel = kind => labels[kind] || '공식 소식'
export const readableText = value => typeof value === 'string' ? value : ''
export function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && ['steamcommunity.com', 'store.steampowered.com', 'steamstore-a.akamaihd.net'].includes(url.hostname) ? url.href : null
  } catch { return null }
}
export function timeLabel(value) {
  const date = new Date(value)
  return value && Number.isFinite(date.getTime()) ? date.toLocaleString('ko-KR') : '확인 전'
}

export function sourcePeriod(item, sources, now = Date.now()) {
  const dates = sources.filter(source => item.sourceIds.includes(source.gid)).map(source => Date.parse(source.publishedAt)).filter(Number.isFinite)
  if (!dates.length) return '원문 시점 확인 필요 · 현재 상태 미확인'
  const latest = Math.max(...dates)
  return now - latest > 30 * 86400000 ? '30일 이전 발표 · 현재 상태 미확인' : '최근 30일 발표 · 현재 상태는 원문 확인'
}
