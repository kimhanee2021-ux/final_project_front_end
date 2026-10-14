import StatCard from '../../../components/common/StatCard'
import { money, number } from '../../../utils/formatters'
// estimated: 실제 결제액이 아니라 현재 정가로 추정한 금액일 때(스팀 연동 분석) 문구를 바꾼다
export default function SpendingSummary({ summary, estimated = false }) {
  return (
    <div className="grid grid-cols-3 gap-[20px] max-[1000px]:gap-[14px] max-[760px]:gap-[10px] max-[580px]:grid-cols-2">
      <StatCard
        label={estimated ? '보유 게임 정가 합계' : '누적 게임 지출'}
        value={money(summary.total)}
        icon="wallet"
        tone="purple"
        tag={estimated ? 'ESTIMATED' : 'ALL TIME'}
        note={(estimated ? '가격을 확인한 유료 게임 ' : '금액이 확인된 유료 게임 ') + summary.paidCount + '개 기준'}
      />
      <StatCard
        label={estimated ? '게임당 평균 정가' : '게임당 평균 구매 금액'}
        value={money(summary.average)}
        icon="bag"
        tone="peach"
        tag="PER GAME"
        note={estimated ? '현재 한국 정가 · 무료 게임 제외' : '환불 반영 · 무료 게임 제외'}
      />
      <StatCard
        label="플레이 1시간당 비용"
        value={summary.hourly == null ? '계산 전' : money(summary.hourly)}
        icon="clock"
        tone="mint"
        tag="PER HOUR"
        note={'동일 게임의 누적 플레이 ' + number(summary.hours) + '시간 기준'}
      />
    </div>
  )
}
