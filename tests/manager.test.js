import test from 'node:test'
import assert from 'node:assert/strict'
import { parseWon, priceLabel, selectedCost } from '../src/pages/manager/managerModel.js'
test('원화 입력은 소수와 잘못된 쉼표를 거부하고 최소 단위를 표시한다',()=>{assert.equal(parseWon('15,000'),15000);for(const value of ['0','1.5','1,,000','abc','10000001'])assert.throws(()=>parseWon(value));assert.equal(priceLabel({currency:'KRW',minorPrice:550000}),'5,500원');assert.equal(priceLabel({currency:'USD',minorPrice:100}),'가격 확인 필요')})
test('보유한 상품 가격은 합계에서 제외하며 가격 누락은 0원으로 표시하지 않는다',()=>{assert.equal(selectedCost([{appId:1,minorPrice:550000,currency:'KRW'},{appId:2,minorPrice:100000,currency:'KRW'}],[{appId:1}]),100000);assert.equal(selectedCost([{appId:2,minorPrice:null,currency:'KRW'}],[]),null)})
