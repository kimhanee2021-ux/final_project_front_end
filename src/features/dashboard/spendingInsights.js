import { summarize, genreSpending } from './spendingMetrics'
import { money } from '../../utils/formatters'
// estimated: 스팀 보유 게임 기반 분석(구매일 없음)이면 '선택 기간' 대신 '보유 게임' 기준 문구를 쓴다
export function getSpendingInsights(games, estimated = false) {
  const summary = summarize(games),
    top = genreSpending(games)[0]
  return [
    ...(summary.unplayed.length
      ? [
          {
            id: 'unplayed',
            title: '다음 모험은 라이브러리 안에',
            description:
              (estimated ? '보유한 유료 게임 중 ' : '선택 기간에 구매한 게임 중 ') +
              summary.unplayed.length +
              '개를 아직 시작하지 않았어요. ' +
              money(summary.unplayedAmount) +
              '의 새로운 이야기가 기다리고 있어요.',
            action: '미플레이 게임 확인',
            filter: 'unplayed',
          },
        ]
      : []),
    ...(top
      ? [
          {
            id: 'genre',
            title: '나의 취향은 ' + top.name + '에 가까워요',
            description:
              (estimated ? '보유 게임 정가의 ' : '선택 기간 구매 금액의 ') +
              Math.round(top.percent) +
              '%가 ' +
              top.name +
              ' 게임이에요. 구매 목록에서 이용 현황도 살펴보세요.',
            action: top.name + (estimated ? ' 게임 보기' : ' 구매 내역 보기'),
            genre: top.name,
          },
        ]
      : []),
  ]
}
