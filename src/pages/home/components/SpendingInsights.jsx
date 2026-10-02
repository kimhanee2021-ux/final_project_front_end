import Icon from '../../../components/common/Icon'
import EmptyState from '../../../components/common/EmptyState'
export default function SpendingInsights({ insights, onExplore }) {
  return <section className="insight-card"><div className="insight-title"><span className="insight-icon"><Icon name="spark" /></span><div><span className="eyebrow">SPENDING INSIGHT</span><h2>숫자 속에 숨은 나의 플레이</h2></div><span className="rule-badge">기록 기반 분석</span></div><div className="insight-items">{insights.length ? insights.map(item => <div className="insight-item" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><button className="text-button" onClick={() => onExplore(item)}>{item.action}<Icon name="arrow" size={16} /></button></div>) : <EmptyState title="분석할 구매 기록이 없어요" />}</div></section>
}
