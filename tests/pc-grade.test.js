import test from 'node:test'
import assert from 'node:assert/strict'
import {gradeForFps,gamePerformanceGrade,overallPerformanceGrade} from '../src/features/performance/model/pcGrade.js'
const result=(fps,preset='1920×1080 high (2/3)')=>({explanationStatus:'READY',resolutions:[{name:'FHD',fps:{status:'REFERENCE_PROJECTION',projection:{averageFps:fps,preset,method:'SAME_CPU_GPU_REFERENCE_V1'}}}]})
test('five grade boundaries and invalid values',()=>{for(const [fps,grade] of [[0,'E'],[19.9,'E'],[20,'D'],[29.9,'D'],[30,'C'],[59.9,'C'],[60,'B'],[119.9,'B'],[120,'A']])assert.equal(gradeForFps(fps),grade);for(const fps of [null,NaN,-1,Infinity])assert.equal(gradeForFps(fps),null)})
test('requires completed AI and matching FHD high reference projection',()=>{assert.equal(gamePerformanceGrade(result(44)).grade,'C');assert.equal(gamePerformanceGrade(result(44,'low')),null);assert.equal(gamePerformanceGrade({...result(44),explanationStatus:'UNAVAILABLE'}),null);assert.equal(gamePerformanceGrade({}),null)})
test('overall median excludes unknown games and exposes coverage',()=>{assert.deepEqual(overallPerformanceGrade({a:result(44),b:{},c:result(120)}),{grade:'B',fps:82,count:2,total:3});assert.deepEqual(overallPerformanceGrade({a:{}}),{grade:null,count:0,total:1})})
