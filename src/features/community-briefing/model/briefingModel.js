const labels = { SCHEDULE: '안내된 일정', CHANGE: '중요한 변화', CAUTION: '주의할 내용', PROGRESS: '문제의 진행 상태', CORRECTION: '변경·정정', TOPIC: '함께 알아둘 소식' }
export const BRIEFING_GROUPS = [
  { id: 'NOTICE', label: '공지·운영 안내' },
  { id: 'UPDATE', label: '업데이트·패치' },
  { id: 'EVENT', label: '이벤트·행사' },
]
const groupTopics = {
  NOTICE: [['OPERATION', '운영'], ['MAINTENANCE', '점검'], ['INCIDENT', '장애'], ['CORRECTION', '정정']],
  UPDATE: [['CONTENT', '콘텐츠'], ['BALANCE', '밸런스'], ['FIX', '수정'], ['DEVELOPMENT', '개발']],
  EVENT: [['EVENT', '행사'], ['BENEFIT', '혜택'], ['TRIAL', '체험'], ['RECRUITMENT', '모집']],
}
export const topicLabel = id => Object.values(groupTopics).flat().find(topic => topic[0] === id)?.[1] || '소식'
export const categoryLabel = kind => labels[kind] || '공식 소식'
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
