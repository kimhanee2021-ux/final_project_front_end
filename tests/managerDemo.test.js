import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createManagerDemo, applyManagerDemoAction } from '../src/features/ai-manager/mocks/managerDemo.js'
const games=JSON.parse(readFileSync(new URL('../src/features/games/mocks/ai-demoGames.json',import.meta.url)))
const now='2026-10-12T03:00:00Z'
test('데모 첫 진입에 보유 게임·컬렉션·대기·충족·실패·읽음 상태가 있고 게임 연결이 정확하다',()=>{
 const state=createManagerDemo(games,now)
 assert.equal(state.owned.length,24)
 const owned=new Set(state.owned.map(g=>g.appId))
 const collections=state.records.filter(r=>r.kind==='collection')
 assert.equal(collections.length,8)
 assert.ok(collections.every(r=>r.data.appIds.every(id=>owned.has(id))))
 const watches=state.records.filter(r=>r.kind==='watch')
 assert.equal(watches.length,12)
 assert.ok(watches.some(r=>r.data.matched&&!r.data.error))
 assert.ok(watches.some(r=>!r.data.matched&&!r.data.error))
 assert.ok(watches.some(r=>r.data.error))
 assert.ok(watches.every(r=>r.data.prices.every(p=>games.some(g=>g.appId===p.appId&&g.name===p.name))))
 const notifications=state.records.filter(r=>r.kind==='notification')
 assert.equal(notifications.length,8)
 assert.ok(watches.some(r=>!r.data.enabled))
 assert.ok(watches.every(r=>r.data.appIds.every(id=>!owned.has(id))))
 assert.ok(notifications.some(r=>!r.data.read));assert.ok(notifications.some(r=>r.data.read))
 assert.equal(new Set(state.records.map(r=>r.id)).size,state.records.length)
 state.records[0].data.name='수정'
 assert.notEqual(createManagerDemo(games,now).records[0].data.name,'수정')
})
test('샘플 조회 실패는 재확인으로 해제되며 알림 읽음·감시 재개·중복 방지가 동작한다',()=>{
 let state=createManagerDemo(games,now)
 const failed=state.records.find(r=>r.kind==='watch'&&r.data.error)
 state=applyManagerDemoAction(state,failed.id,'check',now)
 assert.equal(state.records.find(r=>r.id===failed.id).data.error,'')
 const alert=state.records.find(r=>r.kind==='notification'&&!r.data.read)
 state=applyManagerDemoAction(state,alert.id,'read',now)
 assert.equal(state.records.find(r=>r.id===alert.id).data.read,true)
 const matched=state.records.find(r=>r.kind==='watch'&&r.data.matched)
 const count=state.records.filter(r=>r.kind==='notification').length
 state=applyManagerDemoAction(state,matched.id,'check',now)
 assert.equal(state.records.filter(r=>r.kind==='notification').length,count)
 state=applyManagerDemoAction(state,matched.id,'pause',now)
 state=applyManagerDemoAction(state,matched.id,'pause',now)
 state=applyManagerDemoAction(state,matched.id,'check',now)
 assert.equal(state.records.filter(r=>r.kind==='notification').length,count+1)
})
