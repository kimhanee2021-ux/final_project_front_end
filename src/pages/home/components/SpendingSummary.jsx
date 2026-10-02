import StatCard from '../../../components/common/StatCard'
import { money, number } from '../../../utils/formatters'
export default function SpendingSummary({ summary }) {
  return <div className="stats-grid"><StatCard label="누적 게임 지출" value={money(summary.total)} icon="wallet" tone="purple" tag="ALL TIME" note={'금액이 확인된 유료 게임 ' + summary.paidCount + '개 기준'} /><StatCard label="게임당 평균 구매 금액" value={money(summary.average)} icon="bag" tone="peach" tag="PER GAME" note="환불 반영 · 무료 게임 제외" /><StatCard label="플레이 1시간당 비용" value={summary.hourly == null ? '계산 전' : money(summary.hourly)} icon="clock" tone="mint" tag="PER HOUR" note={'동일 게임의 누적 플레이 ' + number(summary.hours) + '시간 기준'} /></div>
}
