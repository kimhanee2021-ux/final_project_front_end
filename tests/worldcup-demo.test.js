import test from 'node:test'
import assert from 'node:assert/strict'
import { demoRound } from '../src/pages/worldcup/worldcupDemo.js'
const games=Array.from({length:8},(_,i)=>({appId:i+1,name:`게임${i+1}`,tags:[i%2?'전략':'탐험'],groupIds:[]}))
test('데모는 이미 나온 게임을 반복하지 않고 긍정 선택만 결과로 표시한다',()=>{
 const history=[{leftId:1,rightId:2,verdict:'unknown',reasons:[],note:''},{leftId:3,rightId:4,verdict:'left',reasons:['탐험'],note:''}]
 const next=demoRound({games}, {rounds:3,groups:[],history})
 assert.equal(next.complete,false); assert.equal(next.pair.length,2);assert.ok(next.pair.every(g=>g.appId>4))
 const result=demoRound({games},{rounds:2,groups:[],history});assert.equal(result.complete,true);assert.deepEqual(result.favorites.map(g=>g.appId),[3]);assert.match(result.summary,/샘플/)
})
test('모름만 선택한 데모는 선호 게임을 만들지 않는다',()=>{const result=demoRound({games},{rounds:1,groups:[],history:[{leftId:1,rightId:2,verdict:'unknown',reasons:[],note:''}]});assert.deepEqual(result.favorites,[]);assert.deepEqual(result.traits,[])})
