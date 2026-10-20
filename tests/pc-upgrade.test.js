import test from 'node:test'
import assert from 'node:assert/strict'
import {upgradePresentation} from '../src/features/performance/model/pcUpgradePresentation.js'

test('KEEP does not present products, compatibility blockers or shopping links',()=>{
 const view=upgradePresentation({status:'KEEP',compatibilityNote:'슬롯 확인',offer:{part:{productCode:'a'},priceKrw:100}},[{offer:{part:{productCode:'b'},priceKrw:200}}],{cpuModel:'AMD Ryzen 9 9900X',deviceType:'DESKTOP'},'CPU')
 assert.deepEqual(view.offers,[])
 assert.equal(view.compatibilityNote,'')
 assert.deepEqual(view.sources,[])
})
test('unknown or AMD desktop cannot receive Intel laptop guidance',()=>{
 for(const specs of [{cpuModel:'AMD Ryzen 9 9900X',deviceType:'DESKTOP'},{cpuModel:'Intel Core i7',deviceType:'UNKNOWN'}])assert.deepEqual(upgradePresentation({status:'CHECK'},[],specs,'CPU').sources,[])
})
test('UPGRADE preserves a priced product while CHECK withholds products',()=>{
 const offer={part:{productCode:'a'},priceKrw:100}
 assert.equal(upgradePresentation({status:'UPGRADE',offer},[],{},'GPU').offers.length,1)
 assert.equal(upgradePresentation({status:'CHECK',offer},[],{},'GPU').offers.length,0)
})
test('a verified catalog model remains visible without inventing a price',()=>{
 const offer={part:{productCode:'a',name:'Known model'},status:'UNVERIFIED',priceKrw:null}
 const view=upgradePresentation({status:'UPGRADE',offer},[],{},'GPU')
 assert.equal(view.offers[0].offer.part.name,'Known model')
 assert.equal(view.offers[0].offer.priceKrw,null)
})
