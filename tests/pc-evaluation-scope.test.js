import test from 'node:test'
import assert from 'node:assert/strict'
import {evaluationForView} from '../src/features/performance/model/pcEvaluationScope.js'
test('owned overview survives page changes and returning from a search',()=>{
 const owned={overallGrade:'C',scopeGameCount:49},search={overallGrade:'A',gameName:'Search game'}
 assert.equal(evaluationForView('owned',owned,search),owned)
 assert.equal(evaluationForView('search',owned,search),search)
 assert.equal(evaluationForView('owned',owned,search),owned)
 assert.equal(evaluationForView('search',owned,null),owned)
 assert.equal(evaluationForView('search',null,null),null)
})
