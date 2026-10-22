import RewardPicker from './RewardPicker'

// 게임판 위 안내판: 시작 전 · 일시정지 · 실패 · 단계 성공 · 완주. 상태에 맞는 버튼을 보여준다.
export default function BoardOverlay({ game, setGame, statusTitle, start, softRef, boardRef, replacement, setReplacement }) {
  return (
<div className="hb-overlay"><span className="hb-eyebrow">HANGUL BLOCKS</span><h2>{statusTitle}</h2><p>{game.status === 'ready' ? '가로줄을 빈칸 없이 채우면 줄이 사라져요.' : game.status === 'paused' ? '다시 시작할 준비가 되면 계속하기를 눌러주세요.' : `이번 단계 ${game.lines}줄 · ${game.score.toLocaleString()}점`}</p>
            {game.pendingReward && <RewardPicker game={game} setGame={setGame} replacement={replacement} setReplacement={setReplacement} />}
            {game.status === 'paused' ? <button className="hb-button hb-primary" onClick={() => {
              setGame(s => ({
                ...s,
                status: 'playing'
              }));
              boardRef.current?.focus();
            }}>계속하기</button> : <button className="hb-button hb-primary" disabled={game.pendingReward} onClick={() => game.status === 'stage-clear' ? start(game.stage + 1, true) : start()}>{game.status === 'stage-clear' ? '다음 단계' : game.status === 'ready' ? '게임 시작' : '1단계부터 다시 도전'}</button>}
            {game.status === 'over' && <button className="hb-button" onClick={() => start(game.stage)}>이 단계 다시 도전</button>}
            {game.status !== 'ready' && <button className="hb-button" onClick={() => {
              softRef.current = false;
              setGame(s => ({
                ...s,
                status: 'ready'
              }));
            }}>모드 선택</button>}
          </div>
  )
}
