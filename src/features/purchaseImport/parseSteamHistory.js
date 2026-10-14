// 스팀 구매내역 페이지(store.steampowered.com/account/history)를 저장한 HTML에서 거래를 뽑아낸다.
// 브라우저 안에서만 실행되고, 결제 수단·지갑 잔액·거래 ID 원문은 결과에 담지 않는다(거래 ID는 해시로만 사용).
// DOM API 없이 문자열로 처리해서 브라우저와 node 테스트에서 똑같이 동작한다.

// 거래 유형 표기(영어/한국어) -> 저장할 유형. 여기에 없는 유형은 제외 목록으로 보낸다.
const TYPE_MAP = [
  [/^(in-game purchase|게임 내 구매)$/i, 'IN_GAME'],
  [/^(gift purchase|선물 구매)$/i, 'GIFT'],
  [/^(purchase|구매)$/i, 'PURCHASE'],
  [/^(refund|환불)$/i, 'REFUND'],
]
const EXCLUDED_TYPES = [
  [/conversion|변환/i, 'CONVERSION'],
  [/market|장터/i, 'MARKET'],
]
// 지갑 충전은 그 돈으로 게임을 사면 이중 집계되므로 지출에서 뺀다
const WALLET_CREDIT = /wallet credit|지갑 자금|지갑 충전/i

// 금액 앞뒤에 붙는 통화 표기 -> ISO 통화 코드 (긴 표기부터 검사)
const CURRENCY_SYMBOLS = [
  ['CDN$', 'CAD'], ['A$', 'AUD'], ['NZ$', 'NZD'], ['HK$', 'HKD'], ['S$', 'SGD'], ['Mex$', 'MXN'], ['R$', 'BRL'],
  ['NT$', 'TWD'], ['CHF', 'CHF'], ['zł', 'PLN'], ['pуб.', 'RUB'], ['руб.', 'RUB'], ['TL', 'TRY'], ['Rp', 'IDR'],
  ['RM', 'MYR'], ['₩', 'KRW'], ['₹', 'INR'], ['€', 'EUR'], ['£', 'GBP'], ['¥', 'JPY'], ['₴', 'UAH'], ['₸', 'KZT'],
  ['₫', 'VND'], ['฿', 'THB'], ['₪', 'ILS'], ['₱', 'PHP'], ['$', 'USD'],
]

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }

const decodeEntities = text =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))

export const textOf = html => decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

function cell(row, className) {
  const match = row.match(new RegExp(`<td[^>]*class="${className}[^"]*"[^>]*>([\\s\\S]*?)</td>`))
  return match ? match[1] : ''
}

const withoutPayment = html => html.replace(/<div class="wth_payment"[\s\S]*?<\/div>/g, '')

// "7 Jan, 2026" / "Jan 7, 2026" / "2026년 1월 7일" -> "2026-01-07"
export function parseDate(text) {
  const pad = n => String(n).padStart(2, '0')
  let m = text.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/)
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`
  m = text.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})/)
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(m[1])}`
  m = text.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/)
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(m[2])}`
  return null
}

// "₹ 1,234.56" / "₩ 50,000" / "12,99€" -> { amount: 1234.56, currency: 'INR' }
export function parseMoney(text) {
  const raw = text.replace(/credit|크레딧/gi, '').trim()
  if (!raw) return null
  const symbol = CURRENCY_SYMBOLS.find(([s]) => raw.includes(s))
  const digits = raw.match(/\d[\d.,\s]*/)
  if (!digits) return null
  let number = digits[0].replace(/\s/g, '')
  const lastDot = number.lastIndexOf('.')
  const lastComma = number.lastIndexOf(',')
  if (lastDot >= 0 && lastComma >= 0) {
    // 둘 다 있으면 나중에 나온 쪽이 소수점
    number = lastComma > lastDot ? number.replace(/\./g, '').replace(',', '.') : number.replace(/,/g, '')
  } else if (lastComma >= 0) {
    // 쉼표만 있으면 뒤가 두 자리일 때만 소수점 (12,99), 아니면 천 단위 구분 (50,000)
    number = /,\d{2}$/.test(number) ? number.replace(',', '.') : number.replace(/,/g, '')
  }
  const amount = Number.parseFloat(number)
  if (!Number.isFinite(amount)) return null
  return { amount, currency: symbol ? symbol[1] : null }
}

// 거래 ID를 그대로 보내지 않기 위한 짧은 해시 (중복 가져오기 판별용, 보안 용도 아님). FNV-1a 64bit.
export function hashKey(text) {
  let hash = 0xcbf29ce484222325n
  for (const char of text) {
    hash ^= BigInt(char.codePointAt(0))
    hash = BigInt.asUintN(64, hash * 0x100000001b3n)
  }
  return hash.toString(16).padStart(16, '0')
}

function classifyType(typeText, itemsText) {
  if (WALLET_CREDIT.test(itemsText)) return { excluded: 'WALLET_CREDIT' }
  const kept = TYPE_MAP.find(([pattern]) => pattern.test(typeText))
  if (kept) return { type: kept[1] }
  const excluded = EXCLUDED_TYPES.find(([pattern]) => pattern.test(typeText))
  return { excluded: excluded ? excluded[1] : 'UNKNOWN' }
}

function parseItems(itemsHtml) {
  const cleaned = withoutPayment(itemsHtml).replace(/<div class="wth_item_refunded"[\s\S]*?<\/div>/g, '')
  const divs = [...cleaned.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/g)].map(m => textOf(m[1])).filter(Boolean)
  return divs.length ? divs : [textOf(cleaned)].filter(Boolean)
}

function parseDiscount(basePriceHtml) {
  if (!basePriceHtml.includes('wht_discount_pct')) return {}
  const pct = basePriceHtml.match(/wht_discount_pct[^>]*>\s*-?(\d+)%/)
  const original = basePriceHtml.match(/wht_original_price[^>]*>([\s\S]*?)<\/span>/)
  const originalMoney = original ? parseMoney(textOf(original[1])) : null
  return {
    discountPercent: pct ? Number(pct[1]) : null,
    originalAmount: originalMoney ? originalMoney.amount : null,
  }
}

// 반환: { transactions, excluded: { WALLET_CREDIT: n, ... }, warnings: [...] }
// transaction: { externalKey, groupKey, purchasedAt, type, items, appId, amount, currency, discountPercent?, originalAmount? }
export function parseSteamHistory(html) {
  const tableStart = html.indexOf('wallet_history_table')
  if (tableStart < 0) {
    return { transactions: [], excluded: {}, warnings: ['스팀 구매내역 표를 찾지 못했어요. 구매내역 페이지를 저장했는지 확인해 주세요.'] }
  }
  const tableEnd = html.indexOf('</table>', tableStart)
  const table = html.slice(tableStart, tableEnd < 0 ? undefined : tableEnd)
  const rows = table.match(/<tr[^>]*class="wallet_table_row[^"]*"[^>]*>[\s\S]*?<\/tr>/g) ?? []

  const transactions = []
  const excluded = {}
  const warnings = []
  rows.forEach((row, index) => {
    const purchasedAt = parseDate(textOf(cell(row, 'wht_date')))
    const items = parseItems(cell(row, 'wht_items'))
    const typeText = textOf(withoutPayment(cell(row, 'wht_type')))
    const kind = classifyType(typeText, items.join(' '))
    if (kind.excluded) {
      excluded[kind.excluded] = (excluded[kind.excluded] ?? 0) + 1
      return
    }
    const money = parseMoney(textOf(cell(row, 'wht_total')))
    // 원래 결제 수단으로 환불되면 금액 칸이 비어 있다 -> 같은 거래의 구매를 전액 환불한 것으로 본다(amount=null)
    const fullRefund = kind.type === 'REFUND' && !money
    if (!purchasedAt || (!money && !fullRefund) || !items.length) {
      warnings.push(`${index + 1}번째 거래를 읽지 못해 건너뛰었어요.`)
      return
    }
    const opener = row.match(/<tr[^>]*>/)[0]
    const transId = opener.match(/transid=(\d+)/)
    const appId = opener.match(/[?&](?:amp;)?appid=(\d+)/)
    // 환불은 원래 구매와 같은 거래 ID를 쓴다: groupKey로 둘을 잇고, externalKey는 유형까지 넣어 구분한다
    const groupSource = transId ? `t:${transId[1]}` : `r:${purchasedAt}|${items.join('|')}`
    transactions.push({
      externalKey: hashKey(`${groupSource}|${kind.type}|${money ? money.amount : ''}`),
      groupKey: hashKey(groupSource),
      purchasedAt,
      type: kind.type,
      items,
      appId: appId ? Number(appId[1]) : null,
      amount: money ? money.amount : null,
      currency: money ? money.currency : null,
      ...parseDiscount(cell(row, 'wht_base_price')),
    })
  })
  if (rows.length && html.includes('id="load_more_button"') && !/load_more_button[^>]*style="[^"]*display:\s*none/.test(html)) {
    // 저장한 페이지에 "더 보기"가 남아 있으면 오래된 거래가 빠졌을 수 있다
    const area = html.slice(html.indexOf('load_more_history_area'), html.indexOf('load_more_history_area') + 600)
    if (!/display:\s*none/.test(area)) warnings.push('"더 보기"를 끝까지 누르지 않은 것 같아요. 오래된 거래가 빠졌을 수 있어요.')
  }
  return { transactions, excluded, warnings }
}
