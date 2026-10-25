import common from './playerSeries.source.json' with { type: 'json' }
import americas from './playerSeries.americas.source.json' with { type: 'json' }
import northAsia from './playerSeries.north-asia.source.json' with { type: 'json' }
import southAsia from './playerSeries.south-asia.source.json' with { type: 'json' }
import europe from './playerSeries.europe.source.json' with { type: 'json' }
import africa from './playerSeries.africa.source.json' with { type: 'json' }

// 프로젝트의 관리 영역입니다. 호주는 South Asia, 이집트·남아공은 Africa에 포함합니다.
const PLAYER_REGIONS = [americas, northAsia, southAsia, europe, africa]

// 국가 수치의 원본은 지역별 JSON 한 곳에만 둡니다.
// 지역 사이 이동 중 중복 등록되면 합계가 부풀려지므로 즉시 알립니다.
const seen = new Set()
const countries = PLAYER_REGIONS.flatMap((region) =>
  region.countries.map((country) => {
    if (seen.has(country.country_iso2))
      throw new RangeError(`여러 지역에 중복 등록된 국가: ${country.country_iso2}`)
    seen.add(country.country_iso2)
    return { ...country, region: region.region_id }
  }),
)

export default { ...common, countries }
