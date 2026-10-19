import test from 'node:test'
import assert from 'node:assert/strict'
import { fpsReferenceLabel } from '../src/features/performance/model/pcFps.js'
test('reference value is explicitly labeled and never shown as a prediction',()=>{
 assert.equal(fpsReferenceLabel({status:'REFERENCE_ONLY',samples:[{averageFps:20.6}]}),'참고 실측 20.6 FPS')
 assert.equal(fpsReferenceLabel({status:'REFERENCE_ONLY',samples:[{averageFps:44.2},{averageFps:40.8}]}),'참고 실측 2건 · 옵션별 확인')
})
test('missing, invalid and unsupported result states do not produce numeric FPS',()=>{
 for(const value of [undefined,{status:'NO_DATA',samples:[]},{status:'REFERENCE_ONLY',samples:[{averageFps:0}]},{status:'UNKNOWN',samples:[{averageFps:120}]}])assert.equal(fpsReferenceLabel(value),'FPS 근거 부족')
})
test('provisional projection explicitly discloses its low confidence',()=>{
 assert.equal(fpsReferenceLabel({status:'REFERENCE_PROJECTION',projection:{averageFps:44}}),'참고 예상 약 44 FPS · 낮은 신뢰')
 assert.equal(fpsReferenceLabel({status:'REFERENCE_PROJECTION',projection:{averageFps:NaN}}),'FPS 근거 부족')
})

