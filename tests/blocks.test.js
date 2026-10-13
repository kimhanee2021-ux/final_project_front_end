import test from 'node:test'
import assert from 'node:assert/strict'
import { SHAPES, TEMPLATES, stageTarget, dropInterval, makeGame, act, advance, rotate, cells, seoulDate, readRecords, activateItem, hammerCell, chooseReward } from '../src/features/hangul-blocks/engine.js'

test('망치는 선택한 쌓인 한 칸만 제거하고 빈칸에서는 소비하지 않는다',()=>{
 let s=makeGame(1,()=>0);s.items=['hammer'];s=activateItem(s,'hammer')
 assert.equal(s.hammerArmed,true);assert.equal(s.items.length,1)
 assert.equal(hammerCell(s,0,0),s);assert.equal(hammerCell(s,-1,19),s)
 const count=s.board.flat().filter(Boolean).length;s=hammerCell(s,5,19)
 assert.equal(s.board.flat().filter(Boolean).length,count-1);assert.equal(s.items.length,0);assert.equal(s.hammerArmed,false);assert.equal(s.lines,0);assert.equal(s.score,0)
})
test('줄 지우개는 아래 한 줄만 제거하고 윗줄을 내려주며 빈 바닥에서는 소비하지 않는다',()=>{
 let s=makeGame(1,()=>0);s.items=['eraser'];const above=[...s.board[18]]
 s=activateItem(s,'eraser');assert.deepEqual(s.board[19],above);assert.ok(s.board[0].every(c=>!c));assert.equal(s.lines,0);assert.equal(s.score,0);assert.equal(s.items.length,0)
 s.items=['eraser'];s.board[19]=Array(10).fill(null);assert.equal(activateItem(s,'eraser'),s)
})

test('처음에는 아이템 없음, 5단계마다 완료 보상 하나만 선택하며 꽉 차면 교체한다',()=>{
 for(const stage of [1,4,5,10,49,50]) {
  let s=makeGame(stage,()=>0);assert.deepEqual(s.items,[]);s.lines=stageTarget(stage)-1
  s.board=Array.from({length:20},()=>Array(10).fill(null));s.board[19]=Array(10).fill('#888');s.board[19][0]=null
  s.piece={matrix:[[1]],color:'#abc',x:0,y:0};s=act(s,'hard',()=>0)
  assert.deepEqual(s.items,[]);assert.equal(s.pendingReward,stage%5===0)
  if(s.pendingReward){s=chooseReward(s,'hammer');assert.deepEqual(s.items,['hammer']);assert.equal(chooseReward(s,'eraser'),s)}
 }
 let s={...makeGame(5,()=>0),status:'stage-clear',pendingReward:true,items:['bomb','freeze','swap']}
 assert.equal(chooseReward(s,'eraser'),s);s=chooseReward(s,'eraser',1);assert.deepEqual(s.items,['bomb','eraser','swap']);assert.equal(s.pendingReward,false)
})
test('폭탄은 주변 칸만 제거하고 목표와 점수는 늘리지 않는다',()=>{
 let s=makeGame(1,()=>0);s.items=['bomb'];const original=s.piece
 s=activateItem(s,'bomb');assert.equal(s.piece.label,'💣');assert.equal(s.items.length,0)
 const count=s.board.flat().filter(Boolean).length,score=s.score
 s=act(s,'hard',()=>0);assert.ok(s.board.flat().filter(Boolean).length<count);assert.equal(s.lines,0);assert.equal(s.score,score);assert.deepEqual(s.piece,original)
})
test('시간 얼리기는 5초 동안 낙하와 고정을 멈추며 정지 중에는 시간이 흐르지 않는다',()=>{
 let s=makeGame(1,()=>0);s.items=['freeze'];s=activateItem(s,'freeze');assert.equal(s.freezeMs,5000)
 const y=s.piece.y;s=advance(s,4000);assert.equal(s.piece.y,y);assert.equal(s.freezeMs,1000)
 const paused={...s,status:'paused'};assert.equal(advance(paused,2000),paused)
 s=advance(s,1900);assert.equal(s.freezeMs,0);assert.ok(s.piece.y>y)
})
test('블록 교환은 첫 번째 대기 블록과 바꾸며 공간이 없으면 소비하지 않는다',()=>{
 let s=makeGame(1,()=>0);s.items=['swap'];s.next[0]=SHAPES[9]
 const label=s.piece.label;s=activateItem(s,'swap');assert.equal(s.piece.label,'ㅣ');assert.equal(s.next[0].label,label);assert.equal(s.items.length,0)
 s.items=['swap'];s.board=Array.from({length:20},()=>Array(10).fill('#888'));assert.equal(activateItem(s,'swap'),s)
 assert.equal(activateItem({...s,status:'paused'},'bomb').items.length,1)
})

test('50단계 목표와 5단계 속도 경계', () => {
  assert.equal(stageTarget(1), 10); assert.equal(stageTarget(2), 13); assert.equal(stageTarget(50), 157)
  assert.equal(dropInterval(1), dropInterval(5)); assert.ok(dropInterval(6) < dropInterval(5))
  assert.equal(dropInterval(6), dropInterval(10)); assert.ok(dropInterval(11) < dropInterval(10))
  assert.throws(() => stageTarget(51)); assert.throws(() => stageTarget(0))
})
test('10개 서로 다른 시작 배치에 빈칸과 생성 공간이 있다', () => {
  assert.equal(TEMPLATES.length, 10); assert.equal(new Set(TEMPLATES.map(JSON.stringify)).size, 10)
  for (let i=0;i<10;i++) {
    const s=makeGame(1, () => (i+.01)/10)
    assert.equal(s.template, i); assert.equal(s.board.length,20)
    assert.ok(s.board.slice(0,16).flat().every(c=>!c))
    assert.ok(s.board.slice(16).every(row=>row.some(c=>!c)&&row.some(Boolean)))
  }
})
test('모든 자모는 네 번 회전하면 원래 모양이며 회전해도 색 유지', () => {
  for (const shape of SHAPES) {
    let p={...shape, x:4, y:0}; const original=p.matrix
    for(let i=0;i<4;i++)p=rotate(p)
    assert.deepEqual(p.matrix,original); assert.equal(p.color,shape.color)
    assert.ok(cells(p).length>0)
  }
})
test('좌우 벽을 통과하지 않고 즉시낙하는 보드에 고정한다', () => {
  let s=makeGame(1,()=>0)
  for(let i=0;i<30;i++)s=act(s,'left',()=>0)
  assert.ok(cells(s.piece).every(([x])=>x>=0))
  s=act(s,'hard',()=>0); assert.equal(s.placed,1)
  assert.ok(s.board.flat().filter(Boolean).length>32)
})
test('가로줄 제거로 목표를 채우면 단계완료, 50단계는 완주', () => {
  for(const stage of [1,50]) {
    let s=makeGame(stage,()=>0)
    s.board=Array.from({length:20},()=>Array(10).fill(null))
    s.board[19]=Array(10).fill('#888');s.board[19][0]=null
    s.piece={matrix:[[1]],color:'#abc',label:'검증',x:0,y:0}
    s.lines=stageTarget(stage)-1
    s=act(s,'hard',()=>0)
    assert.equal(s.lines,stageTarget(stage)); assert.equal(s.status,stage===50?'complete':'stage-clear')
    assert.ok(s.board[19].every(c=>!c))
  }
})
test('생성 위치가 막히면 종료하고 종료 상태에서 조작되지 않는다',()=>{
  let s=makeGame(1,()=>0);s.board=Array.from({length:20},()=>Array(10).fill('#888'))
  s=act(s,'hard',()=>0);assert.equal(s.status,'over');assert.equal(act(s,'left',()=>0),s)
})
test('한국 날짜와 손상된 개인 기록을 안전하게 처리',()=>{
  assert.equal(seoulDate(new Date('2026-10-10T15:01:00Z')),'2026-10-11')
  assert.deepEqual(readRecords('not json'),[]);assert.deepEqual(readRecords('{}'),[])
  assert.deepEqual(readRecords('[{"stage":999,"score":-3}]'),[])
})
test('착지 후 350ms 고정 지연과 일시정지, 빠른 낙하',()=>{
  let s=makeGame(1,()=>0)
  s.board=Array.from({length:20},()=>Array(10).fill(null))
  s.piece={matrix:[[1]],color:'#abc',label:'검증',x:0,y:19}
  s=advance(s,340);assert.equal(s.placed,0)
  s=advance(s,10);assert.equal(s.placed,1)
  const paused={...s,status:'paused'};assert.equal(advance(paused,1000),paused)
  const fresh=makeGame(1,()=>0)
  assert.ok(advance(fresh,110,true).piece.y>advance(fresh,110,false).piece.y)
})
test('동시에 여러 가로줄을 제거하고 무작위 자모를 생성한다',()=>{
  let s=makeGame(1,()=>0)
  s.board=Array.from({length:20},()=>Array(10).fill(null))
  for(const y of [18,19]){s.board[y]=Array(10).fill('#888');s.board[y][0]=null}
  s.piece={matrix:[[1],[1]],color:'#abc',label:'검증',x:0,y:0}
  s=act(s,'hard',()=>.95);assert.equal(s.lines,2);assert.ok(s.board.flat().every(v=>!v));assert.equal(s.next[2].label,'ㅣ')
})
