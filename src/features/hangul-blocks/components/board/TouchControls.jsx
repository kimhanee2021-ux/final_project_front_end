// 휴대폰용 조작 버튼 (왼쪽 · 빠르게 내리기(누르고 있기) · 오른쪽 · 회전 · 즉시 내리기)
export default function TouchControls({ playing, move, softRef }) {
  return (
    <div className="hb-touch" aria-label="터치 조작" onPointerDown={e => e.preventDefault()}><button disabled={!playing} onClick={() => move('left')} aria-label="왼쪽 이동">← A</button><button disabled={!playing} onPointerDown={e => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            softRef.current = true;
          }} onPointerUp={() => {
            softRef.current = false;
          }} onPointerCancel={() => {
            softRef.current = false;
          }}>↓ S</button><button disabled={!playing} onClick={() => move('right')} aria-label="오른쪽 이동">D →</button><button disabled={!playing} onClick={() => move('rotate')}>회전 ↻</button><button disabled={!playing} onClick={() => move('hard')}>즉시 ↓↓</button></div>
  )
}
