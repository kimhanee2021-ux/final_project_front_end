import { useEffect, useRef, useState } from 'react'
import { assessPc } from '../api/pcApi'
import { normalizeSpecs } from '../model/pcDiagnosis'
import { assessGamesSequentially } from '../model/pcBatch'
export function usePcDiagnosis(){
 const [specs,setSpecs]=useState(null),[results,setResults]=useState({}),[selected,setSelected]=useState(null),[busy,setBusy]=useState(null),[error,setError]=useState(''),[gameErrors,setGameErrors]=useState({})
 const controller=useRef(null),sequence=useRef(0),specsRef=useRef(null)
 useEffect(()=>{specsRef.current=specs},[specs])
 useEffect(()=>()=>{sequence.current++;controller.current?.abort();specsRef.current=null},[])
 function cancel(){sequence.current++;controller.current?.abort();setBusy(null)}
 function applySpecs(values){const pc=normalizeSpecs(values);cancel();specsRef.current=pc;setSpecs(pc);setResults({});setGameErrors({});setSelected(null);setError('')}
 async function diagnoseGames(games,expectedSpecs){const pc=specsRef.current;if(expectedSpecs!==undefined&&expectedSpecs!==pc)return;if(!pc){setError('먼저 시스템 정보 사진에서 PC 사양을 확인해 주세요.');return}cancel();const id=++sequence.current;setError('');setGameErrors(old=>{const next={...old};for(const game of games)delete next[game.appId];return next})
  try{await assessGamesSequentially(games,async game=>{const request=new AbortController();controller.current=request;setBusy(game.appId);const timer=setTimeout(()=>request.abort(),100000);try{return await assessPc(pc,game.appId,request.signal)}finally{clearTimeout(timer)}},()=>sequence.current===id,result=>{setResults(old=>({...old,[result.appId]:result}));setSelected(result.appId);if(result.explanationStatus==='RATE_LIMITED')setError('AI 서비스 이용 한도에 도달해 추가 진단을 멈췄어요. 완료된 비교 결과는 유지돼요. 한도가 회복된 뒤 다시 비교해 주세요.')},(game,failure)=>{setGameErrors(old=>({...old,[game.appId]:failure.message}));setError('일부 게임의 사양을 확인하지 못했어요. 해당 게임에서 다시 비교할 수 있어요.')})}catch(e){if(sequence.current===id)setError(e.name==='AbortError'?'진단이 취소됐거나 시간이 초과됐어요. 완료된 결과는 남아 있어요.':`${e.message} 완료된 결과는 보존됐어요. 나머지 게임은 다시 비교할 수 있어요.`)}finally{if(sequence.current===id)setBusy(null)}
 }
 function diagnose(game){return diagnoseGames([game])}
 return {specs,results,selected,setSelected,busy,error,gameErrors,applySpecs,diagnose,diagnoseGames,cancel}
}
