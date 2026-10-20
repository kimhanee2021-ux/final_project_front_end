import test from 'node:test'
import assert from 'node:assert/strict'
import {exactSearchGame} from '../src/features/performance/model/pcSearchSelection.js'
test('ELDEN RING resolves to its exact base title without Nightreign or DLC',()=>{
 const games=[{appId:1,name:'ELDEN RING'},{appId:2,name:'ELDEN RING NIGHTREIGN'},{appId:3,name:'ELDEN RING Shadow of the Erdtree'}]
 assert.equal(exactSearchGame('elden ring',games).appId,1)
 assert.equal(exactSearchGame('ELDEN RING',[{appId:1,name:'ELDEN RING™'}]).appId,1)
})
test('partial, ambiguous or unrelated results never auto-start another game',()=>{
 assert.equal(exactSearchGame('ELDEN',[{appId:1,name:'ELDEN RING'}]),null)
 assert.equal(exactSearchGame('Same',[{appId:1,name:'Same'},{appId:2,name:'Same'}]),null)
 assert.equal(exactSearchGame('Alan Wake 2',[{appId:1,name:'Beat Saber Alan Walker Wake Up'}]),null)
})
