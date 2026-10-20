import test from 'node:test'
import assert from 'node:assert/strict'
import {gpuCandidates,imageDimensions,pendingGames} from '../src/features/performance/model/pcHardware.js'
test('multiple GPUs require a separate selection without merging VRAM',()=>{assert.deepEqual(gpuCandidates('NVIDIA GeForce RTX 5060 Laptop GPU, AMD Radeon 780M Graphics'),['NVIDIA GeForce RTX 5060 Laptop GPU','AMD Radeon 780M Graphics']);assert.deepEqual(gpuCandidates('Intel UHD Graphics 770'),['Intel UHD Graphics 770'])})
test('photo dimensions retain aspect ratio and reject oversized decoding',()=>{assert.deepEqual(imageDimensions(3840,2160),{width:2048,height:1152});assert.deepEqual(imageDimensions(1200,800),{width:1200,height:800});assert.throws(()=>imageDimensions(10000,10000))})
test('retry excludes completed games and retains unfinished ones',()=>{assert.deepEqual(pendingGames([{appId:1},{appId:2}],{1:{explanationStatus:'READY',resolutions:['FHD','QHD','4K'].map(name=>({name,target:{method:'AI_TARGET_BAND_V1',grade:'UNKNOWN'}}))}}),[{appId:2}])})

test('legacy or duplicate resolution rows need retry; completed UNKNOWN does not auto-loop',()=>{
 const games=[{appId:1},{appId:2}]
 const result={explanationStatus:'READY',resolutions:['FHD','QHD','4K'].map(name=>({name,target:{method:'AI_TARGET_BAND_V1',grade:'UNKNOWN'}}))}
 assert.equal(pendingGames(games,{1:result,2:{...result,resolutions:[{name:'FHD'},{name:'FHD'},{name:'QHD'}]}}).length,1)
})
