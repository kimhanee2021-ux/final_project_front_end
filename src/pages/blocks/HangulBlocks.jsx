import { useEffect, useRef, useState } from 'react'
import { act, advance, cells, dropInterval, ghost, makeGame, readRecords, seoulDate, SHAPES, stageTarget } from './engine'
import './blocks.css'

const KEY='gamesense-hangul-records-v1'
const controls={KeyA:'left',KeyD:'right',Enter:'rotate',ShiftLeft:'hard',ShiftRight:'hard'}
function loadRecords() { try { return readRecords(localStorage.getItem(KEY)) } catch { return [] } }
function Mini({piece}) { return <div className="hb-mini" aria-label={`${piece.label} 블록`}>{piece.matrix.flat().map((v,i)=><i key={i} style={{background:v?piece.color:'transparent'}} />)}</div> }
export default function HangulBlocks() {
  const [game,setGame]=useState(()=>({...makeGame(),status:'ready'}))
  const [mode,setMode]=useState('challenge')
  const [records,setRecords]=useState(loadRecords)
  const [saveError,setSaveError]=useState(false)
  const boardRef=useRef(null), soft=useRef(false), runDate=useRef(seoulDate()), recorded=useRef(false)
  const playing=game.status==='playing'
  const move=action=>setGame(s=>act(s,action))
  const pause=()=>{soft.current=false;setGame(s=>s.status==='playing'?{...s,status:'paused'}:s)}
  const start=(stage=1,carry=false)=>{
    soft.current=false;recorded.current=false
    if(!carry)runDate.current=seoulDate()
    setGame(previous=>{const next=makeGame(stage);return carry?{...next,score:previous.score}:next})
    boardRef.current?.focus()
  }
  useEffect(()=>{
    if(!playing)return
    let last=performance.now()
    const timer=setInterval(()=>{const now=performance.now(),ms=Math.min(100,now-last);last=now;setGame(s=>advance(s,ms,soft.current))},40)
    const visibility=()=>{if(document.hidden){soft.current=false;setGame(s=>s.status==='playing'?{...s,status:'paused'}:s)}}
    const blur=()=>{soft.current=false;setGame(s=>s.status==='playing'?{...s,status:'paused'}:s)}
    document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur)
    return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur)}
  },[playing])
  useEffect(()=>{
    if(!['over','stage-clear','complete'].includes(game.status)||recorded.current)return
    recorded.current=true
    const entry={mode,date:runDate.current,stage:game.stage,score:game.score,lines:game.lines,status:game.status}
    try {const next=[...loadRecords(),entry].slice(-100);localStorage.setItem(KEY,JSON.stringify(next));setRecords(next)} catch {setSaveError(true)}
  },[game.status,game.stage,game.score,game.lines,mode])
  useEffect(()=>{const old=document.title;document.title='한글 블록 손풀기 | GameSense';return ()=>{document.title=old}},[])
  const onKeyDown=e=>{
    if(e.code==='Escape'){e.preventDefault();pause();return}
    if(e.code==='KeyS'){e.preventDefault();if(playing)soft.current=true;return}
    if(controls[e.code]){e.preventDefault();if(e.repeat&&['Enter','ShiftLeft','ShiftRight'].includes(e.code))return;move(controls[e.code])}
  }
  const display=game.board.map(row=>[...row]), landed=ghost(game)
  if(['playing','paused'].includes(game.status)) {
    for(const [x,y] of cells(landed))if(y>=0&&y<20&&x>=0&&x<10&&!display[y][x])display[y][x]='ghost'
    for(const [x,y] of cells(game.piece))if(y>=0&&y<20&&x>=0&&x<10)display[y][x]=game.piece.color
  }
  const today=records.filter(r=>r.mode===mode&&(mode!=='daily'||r.date===seoulDate()))
  const best=today.reduce((a,r)=>Math.max(a,r.score),0)
  const statusTitle={ready:'게임 전, 가볍게 손풀기',paused:'잠시 쉬는 중',over:'이번 도전이 끝났어요', 'stage-clear':`${game.stage}단계 성공!`,complete:'50단계 완주!'}[game.status]
  return <section className="hb-page">
    <header className="hb-heading"><div><span className="hb-eyebrow">PLAY • WARM UP • CHALLENGE</span><h1>한글 블록 손풀기</h1><p>자모 블록을 돌리고, 빈칸을 채우고, 한 줄씩 없애보세요.</p></div><a href="#hb-guide" className="hb-button">게임 설명서 ↓</a></header>
    <div className="hb-modes" aria-label="게임 모드">{[['challenge','50단계 챌린지'],['daily','일일 챌린지']].map(([id,label])=><button key={id} aria-pressed={mode===id} disabled={game.status!=='ready'} onClick={()=>setMode(id)}>{label}</button>)}<span>{mode==='daily'?`${seoulDate()} · 오늘의 개인 기록`:'1단계부터 차근차근 도전'}</span></div>
    <div className="hb-game-layout">
      <div className="hb-play-area">
        <div className="hb-board" ref={boardRef} tabIndex={0} role="group" aria-label="한글 블록 게임판. A D 이동, S 빠르게 내리기, Enter 회전, Shift 즉시 내리기, Escape 일시정지" onKeyDown={onKeyDown} onKeyUp={e=>{if(e.code==='KeyS')soft.current=false}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&!e.relatedTarget?.closest('.hb-touch'))pause()}}>
          {display.flat().map((v,i)=><div key={i} className={`hb-cell ${v==='ghost'?'hb-ghost':v?'hb-filled':''}`} style={v&&v!=='ghost'?{background:v}:undefined} />)}
          {!playing&&<div className="hb-overlay"><span className="hb-eyebrow">HANGUL BLOCKS</span><h2>{statusTitle}</h2><p>{game.status==='ready'?'가로줄을 빈칸 없이 채우면 줄이 사라져요.':game.status==='paused'?'다시 시작할 준비가 되면 계속하기를 눌러주세요.':`이번 단계 ${game.lines}줄 · ${game.score.toLocaleString()}점`}</p>
            {game.status==='paused'?<button className="hb-button hb-primary" onClick={()=>{setGame(s=>({...s,status:'playing'}));boardRef.current?.focus()}}>계속하기</button>:<button className="hb-button hb-primary" onClick={()=>game.status==='stage-clear'?start(game.stage+1,true):start()}>{game.status==='stage-clear'?'다음 단계':game.status==='ready'?'게임 시작':'1단계부터 다시 도전'}</button>}
            {game.status==='over'&&<button className="hb-button" onClick={()=>start(game.stage)}>이 단계 다시 도전</button>}
            {game.status!=='ready'&&<button className="hb-button" onClick={()=>{soft.current=false;setGame(s=>({...s,status:'ready'}))}}>모드 선택</button>}
          </div>}
        </div>
        <div className="hb-touch" aria-label="터치 조작" onPointerDown={e=>e.preventDefault()}><button disabled={!playing} onClick={()=>move('left')} aria-label="왼쪽 이동">← A</button><button disabled={!playing} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);soft.current=true}} onPointerUp={()=>{soft.current=false}} onPointerCancel={()=>{soft.current=false}}>↓ S</button><button disabled={!playing} onClick={()=>move('right')} aria-label="오른쪽 이동">D →</button><button disabled={!playing} onClick={()=>move('rotate')}>회전 ↻</button><button disabled={!playing} onClick={()=>move('hard')}>즉시 ↓↓</button></div>
        <small className="hb-board-hint">게임판을 클릭하면 키보드로 조작할 수 있어요.</small>
      </div>
      <aside className="hb-side"><div className="hb-card hb-stats"><span>STAGE</span><strong>{game.stage}<small> / 50</small></strong><p>목표 <b>{stageTarget(game.stage)}줄</b> · 제거 <b>{game.lines}줄</b></p><progress max={stageTarget(game.stage)} value={Math.min(game.lines,stageTarget(game.stage))}/><dl><div><dt>점수</dt><dd>{game.score.toLocaleString()}</dd></div><div><dt>낙하 속도</dt><dd>{(dropInterval(game.stage)/1000).toFixed(2)}초 / 칸</dd></div><div><dt>시작 배치</dt><dd>{game.template+1} / 10</dd></div></dl></div>
        <div className="hb-card"><h2>다음 블록</h2><div className="hb-next">{game.next.map((p,i)=><div key={i}><Mini piece={p}/><span>{p.label}</span></div>)}</div></div>
        <div className="hb-card"><h2>{mode==='daily'?'오늘의':'나의'} 최고 점수</h2><strong className="hb-record">{best.toLocaleString()}</strong><p>이 브라우저에 저장되는 개인 기록입니다.</p>{saveError&&<p role="alert">브라우저 저장 공간을 사용할 수 없어 기록을 저장하지 못했어요.</p>}</div>
        <div className="hb-actions"><button className="hb-button" disabled={!playing} onClick={pause}>일시정지 · Esc</button><button className="hb-button" disabled={!playing} onClick={()=>{pause()}}>잠시 쉬기</button></div>
      </aside>
    </div>
    <section id="hb-guide" className="hb-card hb-guide"><span className="hb-eyebrow">HOW TO PLAY</span><h2>게임 설명서</h2><div className="hb-guide-grid"><div><h3>① 가로줄을 채워주세요</h3><p>ㄱ·ㄴ·ㄷ·ㅁ과 모음 모양 블록이 내려옵니다. 한 가로줄의 10칸을 모두 채우면 그 줄이 사라집니다. 블록이 쌓여 새 블록이 나올 공간이 없어지면 도전이 끝납니다.</p><h3>② 두 손으로 조작하세요</h3><p><kbd>A</kbd> 왼쪽 · <kbd>D</kbd> 오른쪽 · <kbd>S</kbd> 누르고 있으면 빠르게 내리기<br/><kbd>Enter</kbd> 시계 방향 90° 회전 · 양쪽 <kbd>Shift</kbd> 즉시 내리기<br/><kbd>Esc</kbd> 일시정지. 반투명 테두리는 착지 위치입니다.</p><p>휴대폰에서는 게임판 아래 버튼을 사용하세요. 다른 창으로 이동하거나 게임판을 벗어나면 자동으로 일시정지합니다.</p></div><div><h3>③ 50단계에 도전하세요</h3><p>1단계 목표는 10줄. 다음 단계마다 3줄씩 늘어나 50단계는 157줄입니다. 6·11·16·21·26·31·36·41·46단계에서 낙하 속도가 빨라집니다. 단계가 바뀌면 제거 줄 수와 게임판은 초기화되고 점수는 이어집니다.</p><h3>④ 매번 새로운 순서로</h3><p>10가지 시작 배치 중 하나가 무작위로 선택되고, 나오는 자모도 무작위입니다. 일일 챌린지도 50단계 규칙으로 진행하며 한국 날짜 기준 오늘의 개인 기록을 확인합니다. 모든 이용자의 배치와 순서가 같지는 않습니다.</p><p>줄 제거 점수는 제거 줄 수² × 100 × 단계, 즉시 낙하는 내려간 칸마다 2점입니다. 완료한 단계와 종료한 도전의 기록만 저장하며, 브라우저 데이터를 지우면 기록도 삭제됩니다.</p></div></div><div className="hb-palette">{SHAPES.map(p=><span key={p.label}><i style={{background:p.color}}/>{p.label}</span>)}</div></section>
  </section>
}
