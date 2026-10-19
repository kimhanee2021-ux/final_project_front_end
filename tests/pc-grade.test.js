import test from 'node:test'
import assert from 'node:assert/strict'
import {gradeForFps,gamePerformanceGrade,overallPerformanceGrade,resolutionTarget} from '../src/features/performance/model/pcGrade.js'
const result=grade=>({explanationStatus:'READY',resolutions:[{name:'FHD',target:{grade,method:'AI_TARGET_BAND_V1',reason:'조건부 비교 추정',preset:'낮음 옵션',confidence:'LOW'}}]})
test('144 and 60 and 30 and 20 boundaries are unambiguous',()=>{for(const [fps,grade] of [[0,'E'],[19.9,'E'],[20,'D'],[29.9,'D'],[30,'C'],[59.9,'C'],[60,'B'],[143.9,'B'],[144,'A']])assert.equal(gradeForFps(fps),grade);for(const fps of [null,NaN,-1,Infinity])assert.equal(gradeForFps(fps),null)})
test('only new completed AI estimates produce grades',()=>{assert.equal(gamePerformanceGrade(result('C')).grade,'C');assert.equal(gamePerformanceGrade(result('UNKNOWN')),null);assert.equal(gamePerformanceGrade({...result('A'),explanationStatus:'UNAVAILABLE'}),null);assert.equal(gamePerformanceGrade({}),null)})
test('overall uses conservative ordinal median without inventing numeric FPS',()=>{assert.deepEqual(overallPerformanceGrade({a:result('A'),b:{},c:result('C')}),{grade:'C',count:2,total:3});assert.deepEqual(overallPerformanceGrade({a:{}}),{grade:null,count:0,total:1})})
test('rate limit is a service state rather than insufficient evidence',()=>{assert.match(resolutionTarget({explanationStatus:'RATE_LIMITED'},'FHD').label,/이용 한도/);assert.equal(resolutionTarget(result('UNKNOWN'),'FHD').label,'추정 어려움')})
test('missing resolution does not reuse FHD grade for 4K',()=>{assert.equal(resolutionTarget(result('A'),'4K').grade,null)})
