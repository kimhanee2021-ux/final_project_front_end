import { genreCounts, genreOverview, groupMinorGenres, overallStats, valueBands } from './gameAnalysisModel'
import { money, number } from '@/shared/utils/formatters'

// AI 분석 태그마다 옆에 보여줄 시각 데이터. 모두 이 페이지의 데이터 패널이 쓰는 값을 그대로 가져온다.
// kind 'donut': 장르별 비중 도넛 (items: [{ label, value }], center: 가운데 숫자 { caption, value, format })
// kind 'columns': 구간별 게임 수 막대 (items: [{ label, value, text }])
// detailId: 눌렀을 때 이동할 원본 데이터 패널의 id, detailView: 그 패널에서 열어 둘 보기 (장르 패널의 금액/보유·플레이 기준)

const donut = ({ title, items, caption, value, format, detailId, detailView }) => ({
  kind: 'donut',
  title,
  items,
  center: { caption, value, format },
  detailId,
  detailView,
})

const columns = ({ title, items, detailId }) => ({
  kind: 'columns',
  title,
  items: items.map(item => ({ label: item.label, value: item.count, text: `${item.count}개` })),
  detailId,
})

const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0)

const VISUALS = {
  // 소비 패턴 → 장르별 지출 비중
  spending: games => {
    const genres = genreOverview(games).chartGenres
    return donut({
      title: '장르별 지출 비중',
      items: genres.map(genre => ({ label: genre.name, value: genre.amount })),
      caption: '게임 지출 합계',
      value: sum(genres, 'amount'),
      format: money,
      detailId: 'genre',
      detailView: 'amount',
    })
  },
  // 라이브러리 분석 → 장르별 보유 게임 수
  library: games => {
    const genres = groupMinorGenres(genreCounts(games))
    return donut({
      title: '장르별 보유 게임',
      items: genres.map(genre => ({ label: genre.name, value: genre.count })),
      caption: '보유 게임',
      value: games.length,
      format: count => `${Math.round(count)}개`,
      detailId: 'genre',
      detailView: 'count',
    })
  },
  // 최근 활동 → 장르별 플레이 시간
  activity: games => {
    const genres = groupMinorGenres([...genreCounts(games)].sort((a, b) => b.hours - a.hours))
    return donut({
      title: '장르별 플레이 시간',
      items: genres.map(genre => ({ label: genre.name, value: genre.hours })),
      caption: '총 플레이 시간',
      value: sum(genres, 'hours'),
      format: hours => `${number(hours)}시간`,
      detailId: 'genre',
      detailView: 'count',
    })
  },
  // 가성비 분석 → 시간당 비용 구간별 게임 수
  value: games => columns({ title: '시간당 비용 구간별 게임 수', items: valueBands(games), detailId: 'valueBand' }),
  // 예산·환불 → 구매 가격대별 게임 수
  budget: games => columns({ title: '구매 가격대별 게임 수', items: overallStats(games).priceBands, detailId: 'average' }),
}

// 태그(topic)에 맞는 시각 데이터. 아직 연결하지 않은 태그면 null
export function topicVisual(topic, games) {
  const build = VISUALS[topic]
  return build ? build(games) : null
}
