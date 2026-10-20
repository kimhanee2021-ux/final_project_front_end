import test from 'node:test'
import assert from 'node:assert/strict'
import {analysisRequestKey,searchOverviewFrom} from '../src/features/performance/model/pcAnalysisCache.js'
test('request identity is independent of page order but distinguishes PC and scope',()=>{
 const pc={cpuModel:'CPU',gpuModel:'GPU'},games=[{appId:2},{appId:1}]
 assert.equal(analysisRequestKey(pc,games,'owned'),analysisRequestKey(pc,[...games].reverse(),'owned'))
 assert.notEqual(analysisRequestKey(pc,games,'owned'),analysisRequestKey(pc,games,'search'))
 assert.notEqual(analysisRequestKey(pc,games,'owned'),analysisRequestKey({...pc,gpuModel:'Other'},games,'owned'))
})
test('a reused search result restores its own evaluation and hardware advice',()=>{
 const result={gameName:'Game',resolutions:[{name:'FHD',target:{grade:'B'}}],componentAdvice:[{category:'GPU',status:'KEEP'}]}
 const snapshot=searchOverviewFrom(result)
 assert.equal(snapshot.overallGrade,'B');assert.equal(snapshot.scopeType,'search')
 assert.equal(snapshot.componentAdvice,result.componentAdvice)
})
