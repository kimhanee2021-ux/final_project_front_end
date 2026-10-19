import test from 'node:test'
import assert from 'node:assert/strict'
import { assessGamesSequentially } from '../src/features/performance/model/pcBatch.js'

test('보유 게임을 순서대로 평가하고 각 결과를 즉시 전달한다',async()=>{
 const seen=[],results=[]
 await assessGamesSequentially([{appId:1},{appId:2}],async game=>{seen.push(game.appId);return {appId:game.appId,grade:'X'}},()=>true,result=>results.push(result))
 assert.deepEqual(seen,[1,2]);assert.equal(results.length,2)
})
test('취소 후 늦은 결과와 다음 게임 평가를 폐기한다',async()=>{
 let active=true;const seen=[],results=[]
 await assessGamesSequentially([{appId:1},{appId:2}],async game=>{seen.push(game.appId);active=false;return game},()=>active,result=>results.push(result))
 assert.deepEqual(seen,[1]);assert.deepEqual(results,[])
})
test('평가 실패 시 성공한 결과를 보존하고 추가 요청을 멈춘다',async()=>{
 const results=[]
 await assert.rejects(assessGamesSequentially([{appId:1},{appId:2},{appId:3}],async game=>{if(game.appId===2)throw new Error('요청 제한');return game},()=>true,result=>results.push(result)))
 assert.deepEqual(results,[{appId:1}])
})
