// 이전 PC 게이머 지도에서 선택한 19개국. 지도와 주간 차트가 같은 ISO 3166-1 alpha-2 코드를 쓴다.
// 국가 선택 목록이며, 각 국가의 수치나 Steam 주간 데이터 확보를 의미하지 않는다.
export const GAMER_COUNTRIES = [
  { code: 'US', name: '미국', englishName: 'United States', region: '아메리카' },
  { code: 'CN', name: '중국', englishName: 'China', region: '아시아' },
  { code: 'GB', name: '영국', englishName: 'United Kingdom', region: '유럽' },
  { code: 'FR', name: '프랑스', englishName: 'France', region: '유럽' },
  { code: 'JP', name: '일본', englishName: 'Japan', region: '아시아' },
  { code: 'KR', name: '한국', englishName: 'South Korea', region: '아시아' },
  { code: 'AU', name: '호주', englishName: 'Australia', region: '오세아니아' },
  { code: 'AE', name: '아랍에미리트', englishName: 'United Arab Emirates', region: '아시아' },
  { code: 'NO', name: '노르웨이', englishName: 'Norway', region: '유럽' },
  { code: 'IT', name: '이탈리아', englishName: 'Italy', region: '유럽' },
  { code: 'ES', name: '스페인', englishName: 'Spain', region: '유럽' },
  { code: 'DE', name: '독일', englishName: 'Germany', region: '유럽' },
  { code: 'IL', name: '이스라엘', englishName: 'Israel', region: '아시아' },
  { code: 'ID', name: '인도네시아', englishName: 'Indonesia', region: '아시아' },
  { code: 'IN', name: '인도', englishName: 'India', region: '아시아' },
  { code: 'BR', name: '브라질', englishName: 'Brazil', region: '아메리카' },
  { code: 'CL', name: '칠레', englishName: 'Chile', region: '아메리카' },
  { code: 'EG', name: '이집트', englishName: 'Egypt', region: '아프리카' },
  { code: 'ZA', name: '남아프리카공화국', englishName: 'South Africa', region: '아프리카' },
]

export function findGamerCountry(code) {
  return GAMER_COUNTRIES.find(country => country.code === String(code ?? '').toUpperCase())
}
