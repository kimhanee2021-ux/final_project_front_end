import test from 'node:test'
import assert from 'node:assert/strict'
import {gameDetailKey,gameViewGames} from '../src/features/performance/model/pcGameSelection.js'
import {ownedPage} from '../src/features/performance/model/pcDiagnosis.js'

test('the same game in owned and search lists has independent detail selection',()=>{
 assert.notEqual(gameDetailKey('owned',1245620),gameDetailKey('search',1245620))
})
test('owned and explicit search modes replace the same table instead of mixing lists',()=>{
 const owned={games:[{appId:1}]},searched=[{appId:2}]
 assert.deepEqual(gameViewGames(owned,searched,false),owned.games)
 assert.deepEqual(gameViewGames(owned,searched,true),searched)
 assert.deepEqual(gameViewGames(owned,[],true),[])
 assert.deepEqual(gameViewGames(owned,[],true,[{appId:3}]),[{appId:3}])
 assert.deepEqual(gameViewGames(owned,searched,true,[{appId:3}]),searched)
})
test('expand shows ten games and pagination covers all 49 without duplicates',()=>{
 const games=Array.from({length:49},(_,i)=>({appId:i+1,name:`Game ${i}`,playtimeForever:49-i}))
 assert.equal(ownedPage(games,false,0).games.length,5)
 assert.equal(ownedPage(games,true,0).games.length,10)
 const ids=Array.from({length:5},(_,page)=>ownedPage(games,true,page).games).flat().map(game=>game.appId)
 assert.equal(ids.length,49)
 assert.equal(new Set(ids).size,49)
})
