const CHART_GENRES = 5
const OTHER_GENRE = '기타'

// 차트가 너무 길어지지 않게 상위 장르만 두고 나머지는 '기타'로 묶는다 (amount/count/hours/percent 합산)
export function groupMinorGenres(genres) {
  if (genres.length <= CHART_GENRES) return genres
  // 상위 장르 안에 이미 '기타'(장르 정보 없음)가 있으면 합쳐서, '기타' 항목이 두 개가 되지 않게 한다.
  const keep = genres.slice(0, CHART_GENRES - 1).filter(genre => genre.name !== OTHER_GENRE)
  const rest = [
    ...genres.slice(0, CHART_GENRES - 1).filter(genre => genre.name === OTHER_GENRE),
    ...genres.slice(CHART_GENRES - 1),
  ]
  const sum = key => rest.reduce((total, genre) => total + (genre[key] || 0), 0)
  return [
    ...keep,
    { name: OTHER_GENRE, amount: sum('amount'), count: sum('count'), hours: sum('hours'), percent: sum('percent') },
  ]
}
