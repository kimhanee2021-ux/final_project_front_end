import { ITEM_TYPES as itemTypes } from '../../model/items'

// 보관 중인 도움 아이템과 사용 버튼, 지금 아이템 상태 안내
export default function ItemsCard({ game, playing, item }) {
  return (
    <div className="hb-card hb-items" onPointerDown={e => {
          if (e.target.closest('button')) e.preventDefault();
        }}><h2>도움 아이템 · {game.items.length}/3</h2><p>처음에는 아이템 없이 시작합니다. 5·10·15…단계 완료 시 5종 중 하나를 선택하세요.</p>{itemTypes.map(([type, label, key]) => <button key={type} className="hb-button" disabled={!playing || game.piece.bomb || !game.items.includes(type) || type === 'freeze' && game.freezeMs > 0} onClick={() => item(type)}>{label} <kbd>{key}</kbd> · {game.items.filter(v => v === type).length}개</button>)}<p aria-live="polite">{game.hammerArmed ? '지울 칸을 선택하세요. 망치 버튼이나 4를 다시 누르면 취소됩니다.' : game.piece.bomb ? '폭탄을 이동한 뒤 Shift나 즉시 ↓↓로 떨어뜨리세요.' : game.freezeMs > 0 ? `❄ 얼리기 ${Math.ceil(game.freezeMs / 1000)}초 남음` : '5단계를 깰 때마다 원하는 아이템 하나를 고릅니다.'}</p></div>
  )
}
