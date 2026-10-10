import test from 'node:test'
import assert from 'node:assert/strict'
import { SHAPES, TEMPLATES, stageTarget, dropInterval, makeGame, act, advance, rotate, cells, seoulDate, readRecords } from '../src/pages/blocks/engine.js'

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
