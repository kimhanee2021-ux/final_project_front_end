// 다음 블록 미리보기 한 개
export default function MiniPiece({
  piece
}) {
  return <div className="hb-mini" aria-label={`${piece.label} 블록`}>{piece.matrix.flat().map((v, i) => <i key={i} style={{
      background: v ? piece.color : 'transparent'
    }} />)}</div>;
}
