import { chooseReward } from '../../model/engine'
import { ITEM_TYPES as itemTypes } from '../../model/items'

// 5단계마다 받는 보상 아이템 고르기. 이미 3개면 바꿀 아이템을 먼저 고른다.
export default function RewardPicker({ game, setGame, replacement, setReplacement }) {
  return (
<div className="hb-reward" onKeyDown={e => e.stopPropagation()}><h3>{game.stage}단계 완료 보상</h3><p>원하는 아이템 하나를 선택하세요.</p>{game.items.length >= 3 && <label>교체할 기존 아이템<select aria-label="교체할 기존 아이템" value={replacement} onChange={e => setReplacement(Number(e.target.value))}><option value={-1}>선택하세요</option>{game.items.map((type, i) => <option key={i} value={i}>{itemTypes.find(v => v[0] === type)?.[1]}</option>)}</select></label>}<div>{itemTypes.map(([type, label]) => <button key={type} className="hb-button" disabled={game.items.length >= 3 && replacement < 0} onClick={() => setGame(s => chooseReward(s, type, replacement))}>{label} 선택</button>)}</div></div>
  )
}
