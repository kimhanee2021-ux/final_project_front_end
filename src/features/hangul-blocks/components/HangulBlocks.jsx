import { useEffect, useRef, useState } from 'react';
import { PageHeading, Panel, PanelPage } from '@/shared/ui';
import { act, advance, cells, dropInterval, ghost, makeGame, readRecords, seoulDate, SHAPES, stageTarget, activateItem, hammerCell, chooseReward } from '../model/engine';
import '@/shared/styles/blocks.css';
import { keyAction } from '../model/keys';
const KEY = 'gamesense-hangul-records-v1';
const itemTypes = [['bomb', '💣 폭탄', '1'], ['freeze', '❄ 시간 얼리기', '2'], ['swap', '🔄 블록 바꾸기', '3'], ['hammer', '🔨 한 칸 망치', '4'], ['eraser', '🧹 줄 지우개', '5']];
function loadRecords(key = KEY) {
  try {
    return readRecords(localStorage.getItem(key));
  } catch {
    return [];
  }
}
function Mini({
  piece
}) {
  return <div className="hb-mini" aria-label={`${piece.label} 블록`}>{piece.matrix.flat().map((v, i) => <i key={i} style={{
      background: v ? piece.color : 'transparent'
    }} />)}</div>;
}
export default function HangulBlocks({
  gameFactory = makeGame,
  random = Math.random,
  recordKey = KEY
}) {
  const [game, setGame] = useState(() => ({
    ...gameFactory(),
    status: 'ready'
  }));
  const [mode, setMode] = useState('challenge');
  const [records, setRecords] = useState(() => loadRecords(recordKey));
  const [saveError, setSaveError] = useState(false);
  const [replacement, setReplacement] = useState(-1);
  const boardRef = useRef(null),
    soft = useRef(false),
    runDate = useRef(seoulDate()),
    recorded = useRef(false);
  const playing = game.status === 'playing';
  const move = action => setGame(s => act(s, action, random));
  const item = type => setGame(s => activateItem(s, type));
  const pause = () => {
    soft.current = false;
    setGame(s => s.status === 'playing' ? {
      ...s,
      status: 'paused'
    } : s);
  };
  const start = (stage = 1, carry = false) => {
    soft.current = false;
    recorded.current = false;
    setReplacement(-1);
    if (!carry) runDate.current = seoulDate();
    setGame(previous => {
      const next = gameFactory(stage);
      return carry ? {
        ...next,
        score: previous.score,
        items: previous.items
      } : next;
    });
    boardRef.current?.focus();
  };
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(),
        ms = Math.min(100, now - last);
      last = now;
      setGame(s => advance(s, ms, soft.current, random));
    }, 40);
    const visibility = () => {
      if (document.hidden) {
        soft.current = false;
        setGame(s => s.status === 'playing' ? {
          ...s,
          status: 'paused'
        } : s);
      }
    };
    const blur = () => {
      soft.current = false;
      setGame(s => s.status === 'playing' ? {
        ...s,
        status: 'paused'
      } : s);
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', blur);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', blur);
    };
  }, [playing, random]);
  useEffect(() => {
    if (!['over', 'stage-clear', 'complete'].includes(game.status) || recorded.current) return;
    recorded.current = true;
    const entry = {
      mode,
      date: runDate.current,
      stage: game.stage,
      score: game.score,
      lines: game.lines,
      status: game.status
    };
    try {
      const next = [...loadRecords(recordKey), entry].slice(-100);
      localStorage.setItem(recordKey, JSON.stringify(next));
      setRecords(next);
    } catch {
      setSaveError(true);
    }
  }, [game.status, game.stage, game.score, game.lines, mode, recordKey]);
  useEffect(() => {
    const old = document.title;
    document.title = '한글 테트리스 | GameSense';
    return () => {
      document.title = old;
    };
  }, []);
  const onKeyDown = e => {
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
      e.preventDefault();
      if (!e.repeat) item(itemTypes[Number(e.code.slice(-1)) - 1][0]);
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      pause();
      return;
    }
    if (e.code === 'KeyS') {
      e.preventDefault();
      if (playing) soft.current = true;
      return;
    }
    const action = keyAction(e);
    if (action) {
      e.preventDefault();
      move(action);
    }
  };
  const display = game.board.map(row => [...row]),
    landed = ghost(game);
  if (['playing', 'paused'].includes(game.status)) {
    for (const [x, y] of cells(landed)) if (y >= 0 && y < 20 && x >= 0 && x < 10 && !display[y][x]) display[y][x] = 'ghost';
    for (const [x, y] of cells(game.piece)) if (y >= 0 && y < 20 && x >= 0 && x < 10) display[y][x] = game.piece.color;
  }
  const today = records.filter(r => r.mode === mode && (mode !== 'daily' || r.date === seoulDate()));
  const best = today.reduce((a, r) => Math.max(a, r.score), 0);
  const statusTitle = {
    ready: '한글 테트리스를 시작해볼까요?',
    paused: '잠시 쉬는 중',
    over: '이번 도전이 끝났어요',
    'stage-clear': `${game.stage}단계 성공!`,
    complete: '50단계 완주!'
  }[game.status];
  return <PanelPage><Panel className="hb-page">
    <PageHeading title="한글 테트리스" description="한글의 자음과 모음 블록을 돌리고, 빈칸을 채우고, 한 줄씩 없애보세요." action={<a href="#hb-guide" className="hb-button">게임 설명서 ↓</a>} />
    <div className="hb-modes" aria-label="게임 모드">{[['challenge', '50단계 챌린지'], ['daily', '일일 챌린지']].map(([id, label]) => <button key={id} aria-pressed={mode === id} disabled={game.status !== 'ready'} onClick={() => setMode(id)}>{label}</button>)}<span>{mode === 'daily' ? `${seoulDate()} · 오늘의 개인 기록` : '1단계부터 차근차근 도전'}</span></div>
    <div className="hb-game-layout">
      <div className="hb-play-area">
        <div className="hb-board" ref={boardRef} tabIndex={0} role="group" aria-label="한글 블록 게임판. A D 이동, S 빠르게 내리기, Enter 회전, Shift 즉시 내리기, Escape 일시정지" onKeyDown={onKeyDown} onKeyUp={e => {
          if (e.code === 'KeyS') soft.current = false;
        }} onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget) && !e.relatedTarget?.closest('../../../pages/blocks/.hb-touch, .hb-items')) pause();
        }}>
          {display.flat().map((v, i) => game.hammerArmed && playing && game.board[Math.floor(i / 10)][i % 10] ? <button key={i} className="hb-cell hb-filled hb-hammer-target" style={{
            background: v
          }} aria-label={`${Math.floor(i / 10) + 1}행 ${i % 10 + 1}열 한 칸 제거`} onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }} onClick={() => {
            setGame(s => hammerCell(s, i % 10, Math.floor(i / 10)));
            boardRef.current?.focus();
          }} /> : <div key={i} className={`hb-cell ${v === 'ghost' ? 'hb-ghost' : v ? 'hb-filled' : ''}`} style={v && v !== 'ghost' ? {
            background: v
          } : undefined}>{game.piece.bomb && playing && i === game.piece.y * 10 + game.piece.x ? '💣' : null}</div>)}
          {!playing && <div className="hb-overlay"><span className="hb-eyebrow">HANGUL BLOCKS</span><h2>{statusTitle}</h2><p>{game.status === 'ready' ? '가로줄을 빈칸 없이 채우면 줄이 사라져요.' : game.status === 'paused' ? '다시 시작할 준비가 되면 계속하기를 눌러주세요.' : `이번 단계 ${game.lines}줄 · ${game.score.toLocaleString()}점`}</p>
            {game.pendingReward && <div className="hb-reward" onKeyDown={e => e.stopPropagation()}><h3>{game.stage}단계 완료 보상</h3><p>원하는 아이템 하나를 선택하세요.</p>{game.items.length >= 3 && <label>교체할 기존 아이템<select aria-label="교체할 기존 아이템" value={replacement} onChange={e => setReplacement(Number(e.target.value))}><option value={-1}>선택하세요</option>{game.items.map((type, i) => <option key={i} value={i}>{itemTypes.find(v => v[0] === type)?.[1]}</option>)}</select></label>}<div>{itemTypes.map(([type, label]) => <button key={type} className="hb-button" disabled={game.items.length >= 3 && replacement < 0} onClick={() => setGame(s => chooseReward(s, type, replacement))}>{label} 선택</button>)}</div></div>}
            {game.status === 'paused' ? <button className="hb-button hb-primary" onClick={() => {
              setGame(s => ({
                ...s,
                status: 'playing'
              }));
              boardRef.current?.focus();
            }}>계속하기</button> : <button className="hb-button hb-primary" disabled={game.pendingReward} onClick={() => game.status === 'stage-clear' ? start(game.stage + 1, true) : start()}>{game.status === 'stage-clear' ? '다음 단계' : game.status === 'ready' ? '게임 시작' : '1단계부터 다시 도전'}</button>}
            {game.status === 'over' && <button className="hb-button" onClick={() => start(game.stage)}>이 단계 다시 도전</button>}
            {game.status !== 'ready' && <button className="hb-button" onClick={() => {
              soft.current = false;
              setGame(s => ({
                ...s,
                status: 'ready'
              }));
            }}>모드 선택</button>}
          </div>}
        </div>
        <div className="hb-touch" aria-label="터치 조작" onPointerDown={e => e.preventDefault()}><button disabled={!playing} onClick={() => move('left')} aria-label="왼쪽 이동">← A</button><button disabled={!playing} onPointerDown={e => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            soft.current = true;
          }} onPointerUp={() => {
            soft.current = false;
          }} onPointerCancel={() => {
            soft.current = false;
          }}>↓ S</button><button disabled={!playing} onClick={() => move('right')} aria-label="오른쪽 이동">D →</button><button disabled={!playing} onClick={() => move('rotate')}>회전 ↻</button><button disabled={!playing} onClick={() => move('hard')}>즉시 ↓↓</button></div>
        <small className="hb-board-hint">게임판을 클릭하면 키보드로 조작할 수 있어요.</small>
      </div>
      <aside className="hb-side"><div className="hb-card hb-stats"><span>STAGE</span><strong>{game.stage}<small> / 50</small></strong><p>목표 <b>{stageTarget(game.stage)}줄</b> · 제거 <b>{game.lines}줄</b></p><progress max={stageTarget(game.stage)} value={Math.min(game.lines, stageTarget(game.stage))} /><dl><div><dt>점수</dt><dd>{game.score.toLocaleString()}</dd></div><div><dt>낙하 속도</dt><dd>{(dropInterval(game.stage) / 1000).toFixed(2)}초 / 칸</dd></div><div><dt>시작 배치</dt><dd>{game.template + 1} / 10</dd></div></dl></div>
        <div className="hb-card hb-items" onPointerDown={e => {
          if (e.target.closest('button')) e.preventDefault();
        }}><h2>도움 아이템 · {game.items.length}/3</h2><p>처음에는 아이템 없이 시작합니다. 5·10·15…단계 완료 시 5종 중 하나를 선택하세요.</p>{itemTypes.map(([type, label, key]) => <button key={type} className="hb-button" disabled={!playing || game.piece.bomb || !game.items.includes(type) || type === 'freeze' && game.freezeMs > 0} onClick={() => item(type)}>{label} <kbd>{key}</kbd> · {game.items.filter(v => v === type).length}개</button>)}<p aria-live="polite">{game.hammerArmed ? '지울 칸을 선택하세요. 망치 버튼이나 4를 다시 누르면 취소됩니다.' : game.piece.bomb ? '폭탄을 이동한 뒤 Shift나 즉시 ↓↓로 떨어뜨리세요.' : game.freezeMs > 0 ? `❄ 얼리기 ${Math.ceil(game.freezeMs / 1000)}초 남음` : '5단계를 깰 때마다 원하는 아이템 하나를 고릅니다.'}</p></div>
        <div className="hb-card"><h2>다음 블록</h2><div className="hb-next">{game.next.map((p, i) => <div key={i}><Mini piece={p} /><span>{p.label}</span></div>)}</div></div>
        <div className="hb-card"><h2>{mode === 'daily' ? '오늘의' : '나의'} 최고 점수</h2><strong className="hb-record">{best.toLocaleString()}</strong><p>이 브라우저에 저장되는 개인 기록입니다.</p>{saveError && <p role="alert">브라우저 저장 공간을 사용할 수 없어 기록을 저장하지 못했어요.</p>}</div>
        <div className="hb-actions"><button className="hb-button" disabled={!playing} onClick={pause}>일시정지 · Esc</button><button className="hb-button" disabled={!playing} onClick={() => {
            pause();
          }}>잠시 쉬기</button></div>
      </aside>
    </div>
    <section id="hb-guide" className="hb-card hb-guide"><span className="hb-eyebrow">HOW TO PLAY</span><h2>게임 설명서</h2><div className="hb-guide-grid"><div><h3>① 가로줄을 채워주세요</h3><p>ㄱ·ㄴ·ㄷ·ㅁ과 모음 모양 블록이 내려옵니다. 한 가로줄의 10칸을 모두 채우면 그 줄이 사라집니다. 블록이 쌓여 새 블록이 나올 공간이 없어지면 도전이 끝납니다.</p><h3>② 두 손으로 조작하세요</h3><p><kbd>A</kbd> 왼쪽 · <kbd>D</kbd> 오른쪽 · <kbd>S</kbd> 누르고 있으면 빠르게 내리기<br /><kbd>Enter</kbd> 시계 방향 90° 회전 · 양쪽 <kbd>Shift</kbd> 즉시 내리기<br /><kbd>Esc</kbd> 일시정지. 반투명 테두리는 착지 위치입니다.</p><p>휴대폰에서는 게임판 아래 버튼을 사용하세요. 다른 창으로 이동하거나 게임판을 벗어나면 자동으로 일시정지합니다.</p></div><div><h3>③ 50단계에 도전하세요</h3><p>1단계 목표는 10줄. 다음 단계마다 3줄씩 늘어나 50단계는 157줄입니다. 6·11·16·21·26·31·36·41·46단계에서 낙하 속도가 빨라집니다. 단계가 바뀌면 제거 줄 수와 게임판은 초기화되고 점수는 이어집니다.</p><h3>④ 매번 새로운 순서로</h3><p>10가지 시작 배치 중 하나가 무작위로 선택되고, 나오는 자음과 모음 블록도 무작위입니다. 일일 챌린지도 50단계 규칙으로 진행하며 한국 날짜 기준 오늘의 개인 기록을 확인합니다. 모든 이용자의 배치와 순서가 같지는 않습니다.</p><p>줄 제거 점수는 제거 줄 수² × 100 × 단계, 즉시 낙하는 내려간 칸마다 2점입니다. 완료한 단계와 종료한 도전의 기록만 저장하며, 브라우저 데이터를 지우면 기록도 삭제됩니다.</p></div></div><h3>⑤ 아이템으로 위기를 넘기세요</h3><p>처음에는 아이템 없이 시작합니다. 5·10·15·20·25·30·35·40·45·50단계를 완료할 때마다 아래 5종 중 원하는 아이템 하나를 선택합니다. 최대 3개를 보관하며 가득 차 있으면 기존 아이템 하나를 골라 교체합니다. 보관 아이템은 다음 단계에도 이어지고 새 도전이나 재도전에서는 초기화됩니다. 50단계 보상은 완주 화면에서 선택하며 새 도전으로 가져가지는 않습니다.</p><p><kbd>1</kbd> 💣 폭탄: 현재 자음과 모음 블록을 잠시 보관하고 폭탄을 떨어뜨려 착지 주변 3×3칸을 제거합니다. 이후 원래 자음과 모음 블록을 이어서 배치합니다. 폭탄은 점수·목표 줄 수에 포함되지 않습니다.<br /><kbd>2</kbd> ❄ 시간 얼리기: 5초 동안 낙하와 자동 고정을 멈춥니다. 이동·회전·즉시 내리기는 가능하며 일시정지 중에는 효과 시간이 줄지 않습니다.<br /><kbd>3</kbd> 🔄 블록 바꾸기: 현재 블록과 첫 번째 다음 블록을 교환합니다. 공간이 부족하면 아이템을 소비하지 않습니다. 모바일에서는 아이템 버튼을 누르세요.<br /><kbd>4</kbd> 🔨 한 칸 망치: 사용 후 쌓인 칸 하나를 클릭하거나 터치해 지웁니다. 망치 버튼 또는 4를 다시 누르면 취소됩니다. 빈칸과 내려오는 블록은 지울 수 없으며, 실제로 칸을 지울 때만 소비합니다.<br /><kbd>5</kbd> 🧹 줄 지우개: 맨 아래 가로줄을 지우고 위의 쌓인 칸들을 한 줄 내려줍니다. 바닥이 비어 있으면 소비하지 않습니다. 망치와 줄 지우개는 점수·목표·아이템 획득 줄 수에 포함되지 않습니다.</p><div className="hb-palette">{SHAPES.map(p => <span key={p.label}><i style={{
            background: p.color
          }} />{p.label}</span>)}</div></section>
  </Panel></PanelPage>;
}
