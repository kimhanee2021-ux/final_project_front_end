import MiniPiece from './MiniPiece'

// 다음에 나올 블록 미리보기
export default function NextBlocksCard({ game }) {
  return (
    <div className="hb-card"><h2>다음 블록</h2><div className="hb-next">{game.next.map((p, i) => <div key={i}><MiniPiece piece={p} /><span>{p.label}</span></div>)}</div></div>
  )
}
