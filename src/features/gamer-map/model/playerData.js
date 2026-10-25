import source from './data/playerSeries.js'

// JSON은 백만 명 단위로 보존합니다. 셀을 계산할 때만 정확히 명 단위로 환산합니다.
// 소수점 오차로 2.3백만 명이 2,299,999.999…명이 되지 않도록 정수로 반올림합니다.
function millionToPeople(value) {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(Math.round(value * 1_000_000)))
    throw new RangeError('백만 명 수치는 0 이상의 유한수여야 합니다.')
  return Math.round(value * 1_000_000)
}

// 연도별 제공값을 그대로 사용합니다. 2010년 절반 가정이나 연도 사이 보간은 하지 않습니다.
// 세계 게임 지도는 PC 이용자 데이터만 생성합니다.
function createPlayerSeries(dataset) {
  if (dataset.metadata.unit !== 'million_mau')
    throw new TypeError('지원하는 입력 단위는 million_mau(백만 명)입니다.')
  return Object.fromEntries(
    dataset.metadata.years.map((year) => [
      year,
      {
        year,
        label: '연도별 제공값 · MAU',
        records: dataset.countries.flatMap((country) =>
          ['PC'].map((platform) => {
            const sourceValue = country[platform].yearly_mau_m[year] ?? null
            return {
              iso2: country.country_iso2,
              iso3: country.country_code,
              region: country.region,
              name: country.country_name,
              platform,
              players: millionToPeople(sourceValue),
              sourceValueMillion: sourceValue,
              sourceYear: year,
              basis: sourceValue === null ? 'missing' : 'user-provided',
              topGames: country[platform].top_5_games,
            }
          }),
        ),
      },
    ]),
  )
}

const PLAYER_SERIES = createPlayerSeries(source)

export function getAvailableYears(series = PLAYER_SERIES) {
  return Object.keys(series)
    .map(Number)
    .sort((a, b) => a - b)
}
