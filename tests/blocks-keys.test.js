import test from 'node:test'
import assert from 'node:assert/strict'
import {keyAction} from '../src/features/hangul-blocks/keys.js'
test('양쪽 Shift와 코드 없는 Shift도 즉시 낙하하고 키 반복은 차단한다',()=>{
 for(const code of ['ShiftLeft','ShiftRight',''])assert.equal(keyAction({code,key:'Shift'}),'hard')
 assert.equal(keyAction({code:'ShiftRight',key:'Shift',repeat:true}),null)
 assert.equal(keyAction({code:'Enter',key:'Enter',repeat:true}),null)
 assert.equal(keyAction({code:'KeyA',repeat:true}),'left')
 assert.equal(keyAction({code:'KeyD',key:'ㅇ'}),'right')
 assert.equal(keyAction({code:'KeyX',key:'x'}),null)
})
