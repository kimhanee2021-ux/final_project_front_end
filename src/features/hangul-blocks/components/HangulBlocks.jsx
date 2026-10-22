import { useEffect, useRef, useState } from 'react';
import { PageHeading, Panel, PanelPage } from '@/shared/ui';
import { act, cells, ghost, makeGame, seoulDate, activateItem, hammerCell } from '../model/engine';
import { ITEM_TYPES } from '../model/items';
import { keyAction } from '../model/keys';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameRecords } from '../hooks/useGameRecords';
import BoardOverlay from './board/BoardOverlay';
import TouchControls from './board/TouchControls';
import StatsCard from './side/StatsCard';
import ItemsCard from './side/ItemsCard';
import NextBlocksCard from './side/NextBlocksCard';
import RecordCard from './side/RecordCard';
import GameGuide from './GameGuide';
import '@/shared/styles/blocks.css';
const KEY = 'gamesense-hangul-records-v1';

// 한글 테트리스: 게임판(키보드·터치) + 오른쪽 상태 카드 + 설명서. 게임 규칙은 model/engine, 시간 흐름은 useGameLoop.
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
  const [replacement, setReplacement] = useState(-1);
  const boardRef = useRef(null),
    softRef = useRef(false),
    runDateRef = useRef(seoulDate());
  const { records, saveError, recordedRef } = useGameRecords({ game, mode, recordKey, runDateRef });
  const playing = game.status === 'playing';
  const move = action => setGame(s => act(s, action, random));
  const item = type => setGame(s => activateItem(s, type));
  const pause = () => {
    softRef.current = false;
    setGame(s => s.status === 'playing' ? {
      ...s,
      status: 'paused'
    } : s);
  };
  const start = (stage = 1, carry = false) => {
    softRef.current = false;
    recordedRef.current = false;
    setReplacement(-1);
    if (!carry) runDateRef.current = seoulDate();
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
  useGameLoop({ playing, setGame, softRef, random });
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
      if (!e.repeat) item(ITEM_TYPES[Number(e.code.slice(-1)) - 1][0]);
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      pause();
      return;
    }
    if (e.code === 'KeyS') {
      e.preventDefault();
      if (playing) softRef.current = true;
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
          if (e.code === 'KeyS') softRef.current = false;
        }} onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget) && !e.relatedTarget?.closest('.hb-touch, .hb-items')) pause();
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
          {!playing && <BoardOverlay game={game} setGame={setGame} statusTitle={statusTitle} start={start} softRef={softRef} boardRef={boardRef} replacement={replacement} setReplacement={setReplacement} />}
        </div>
        <TouchControls playing={playing} move={move} softRef={softRef} />
        <small className="hb-board-hint">게임판을 클릭하면 키보드로 조작할 수 있어요.</small>
      </div>
      <aside className="hb-side"><StatsCard game={game} />
        <ItemsCard game={game} playing={playing} item={item} />
        <NextBlocksCard game={game} />
        <RecordCard mode={mode} best={best} saveError={saveError} />
        <div className="hb-actions"><button className="hb-button" disabled={!playing} onClick={pause}>일시정지 · Esc</button><button className="hb-button" disabled={!playing} onClick={() => {
            pause();
          }}>잠시 쉬기</button></div>
      </aside>
    </div>
    <GameGuide />
  </Panel></PanelPage>;
}
