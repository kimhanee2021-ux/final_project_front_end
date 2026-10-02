import Icon from '../../../components/common/Icon'
import { money } from '../../../utils/formatters'
export default function UnplayedSpendingCard({ summary, onExplore }) {
  return <section className="unplayed-card"><div className="unplayed-heading"><span className="eyebrow">NEXT ADVENTURE</span><Icon name="library" /></div><h2>아직 펼치지 않은 이야기</h2><p>구매 후 미플레이 게임 <strong>{summary.unplayed.length}개</strong></p><div className="unplayed-value">{money(summary.unplayedAmount)}</div><div className="mini-covers" aria-hidden="true">{summary.unplayed.slice(0, 3).map(game => <span key={game.id} className={'game-art art-' + game.art}>{game.initials}</span>)}</div><button onClick={onExplore}>보유 게임부터 살펴보기<Icon name="arrow" size={17} /></button></section>
}
