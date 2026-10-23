import { NEWS_CATEGORIES, freshnessMessage } from './newsQuery'
import { spokenNewsDate } from './newsPronunciation'

const CATEGORY_WORDS = {
  NOTICE: /공지|운영\s*안내|운영\s*소식|노티스/,
  PATCH: /패치|업데이트|밸런스|업뎃/,
  EVENT: /이벤트|행사/,
  MAINTENANCE: /점검|장애|서버\s*(상태|소식|문제)|서버\s*터/,
  DEV_NEWS: /개발|데브/,
  OTHER: /기타|그\s*밖의\s*소식/,
}

export function parseVoiceNewsIntent(input) {
  const text = input.normalize('NFKC').trim().replace(/[.!?。]+$/, '')
  if (/^(중지|그만|멈춰|정지)(\s*(해\s*)?(줘|주세요))?$/.test(text)) return { action: 'STOP' }
  if (/^(다시\s*(읽어|들려|재생)(\s*줘|\s*주세요)?|다시\s*듣기)$/.test(text)) return { action: 'REPLAY' }
  if (/^(처음부터|초기화)(\s*해\s*줘|\s*해\s*주세요)?$/.test(text)) return { action: 'RESET' }
  if (/^(다른\s*게임|게임\s*(바꾸기|바꿔\s*줘|변경))$/.test(text)) return { action: 'CHANGE_GAME' }
  const matches = Object.entries(CATEGORY_WORDS).filter(([, pattern]) => pattern.test(text)).map(([category]) => category)
  const all = /전체\s*(소식|뉴스)?|모든\s*(소식|뉴스)/.test(text)
  if (matches.length + Number(all) > 1) return { action: 'CLARIFY', message: '한 번에 한 분류를 골라 주세요. 예를 들어 “패치 소식”이라고 말씀해 주세요.' }
  if (all || matches.length === 1) return { action: 'CATEGORY', category: all ? '' : matches[0] }
  return { action: 'CLARIFY', message: '공지, 패치, 이벤트, 점검, 개발 소식, 기타 또는 전체 소식 중 하나를 말씀해 주세요.' }
}

export function categoryPrompt(gameName) {
  return `${gameName ? `${gameName}. ` : ''}어떤 소식을 들을까요? 파동을 누르고 패치, 이벤트 또는 전체 소식처럼 말씀해 주세요.`
}

export function storedBriefingScript(item) {
  if (!item?.summary?.trim()) return null
  const warning = freshnessMessage(item)
  const category = NEWS_CATEGORIES.find(value => value.value === item.category)?.label || '소식'
  const scope = item.category === 'MAINTENANCE' ? '저장된 공지 기준이며 현재 장애 여부는 확인할 수 없습니다. '
    : item.category === 'EVENT' ? '이벤트 진행 여부와 기간은 공식 원문에서 확인해 주세요. ' : ''
  return `${warning ? `${warning} ` : ''}${scope}${item.gameName}. ${spokenNewsDate(item.publishedAt)} 게시된 ${category}입니다. ${item.title}. ${item.summary.trim()}`
}
