import { hashKey, parseDate, textOf } from './parseSteamHistory.js'

// 스팀 "라이선스 및 제품 키 활성화" 페이지(store.steampowered.com/account/licenses/)를 저장한 HTML에서
// 게임(라이선스)을 계정에 추가한 날짜와 획득 방법을 뽑는다. 금액 정보는 없다.
// 구매내역에 결제 기록이 없는 게임(선물·무료 배포·제품 키)의 날짜와 이유를 알려주는 용도.

// 획득 방법 표기(영어/한국어) -> 저장할 값
const METHODS = [
  [/gift|guest pass|선물|게스트/i, 'GIFT'],
  [/complimentary|무료/i, 'COMPLIMENTARY'],
  [/retail|product key|cd key|소매|제품 키/i, 'KEY'],
  [/store|상점/i, 'STORE'],
]

// 라이선스 표에만 있는 열 클래스로 판별한다 (구매내역 페이지에도 라이선스 페이지 링크는 있을 수 있음)
export const isLicensesPage = html => html.includes('license_date_col')

function classifyMethod(text) {
  const found = METHODS.find(([pattern]) => pattern.test(text))
  return found ? found[1] : 'OTHER'
}

// 반환: { licenses: [{ externalKey, acquiredAt, name, method, freeLicense }], warnings }
export function parseSteamLicenses(html) {
  const start = html.indexOf('account_table')
  if (start < 0 || !html.includes('license_date_col')) {
    return { licenses: [], warnings: ['라이선스 표를 찾지 못했어요. 라이선스 페이지를 저장했는지 확인해 주세요.'] }
  }
  const end = html.indexOf('</table>', start)
  const table = html.slice(start, end < 0 ? undefined : end)
  const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []

  const licenses = []
  const warnings = []
  const seen = new Map()
  rows.forEach((row, index) => {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1])
    if (cells.length < 3) return // 머리글 줄
    const freeLicense = row.includes('free_license_remove_link')
    // 무료 라이선스에는 "Remove" 링크가 붙어 있어 이름에서 뺀다
    const name = textOf(cells[1].replace(/<div class="free_license_remove_link"[\s\S]*?<\/div>/g, ''))
    const acquiredAt = parseDate(textOf(cells[0]))
    if (!acquiredAt || !name) {
      warnings.push(`${index + 1}번째 라이선스를 읽지 못해 건너뛰었어요.`)
      return
    }
    const base = `${acquiredAt}|${name}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    licenses.push({
      externalKey: hashKey(`l:${base}|${count}`),
      acquiredAt,
      name,
      method: classifyMethod(textOf(cells[2])),
      freeLicense,
    })
  })
  return { licenses, warnings }
}
