import { gamePerformanceGrade, resolutionTarget } from '../model/pcGrade'
import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../../components/common/GSIcon'
import PanelHeading from './PanelHeading'
import { syncSteamLibrary } from '../../library/api'
import { searchPcGames } from '../api/pcApi'
import { ownedPage } from '../model/pcDiagnosis'
import { getErrorMessage } from '../../../utils/apiClient'

export default function PcGameComparison({ diagnosis,signedIn }){
 const [owned,setOwned]=useState([]),[searched,setSearched]=useState([]),[query,setQuery]=useState(''),[expanded,setExpanded]=useState(false),[page,setPage]=useState(0),[showSearch,setShowSearch]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false)
 const controller=useRef(null),sequence=useRef(0),ownedLoader=useRef(null),diagnosisRef=useRef(diagnosis),attemptedPages=useRef(new Set()),syncingOwned=useRef(false)
 useEffect(()=>()=>{sequence.current++;controller.current?.abort()},[])
 useEffect(()=>{ownedLoader.current=loadOwned;diagnosisRef.current=diagnosis})
 useEffect(()=>{if(signedIn&&diagnosis.specs)ownedLoader.current()},[signedIn,diagnosis.specs])
 useEffect(()=>{attemptedPages.current.clear()},[diagnosis.specs])
 const listing=ownedPage(owned,expanded,page)
 useEffect(()=>{
  const current=diagnosisRef.current
  if(!current.specs||loading||syncingOwned.current||current.busy!==null||!owned.length)return
  const visible=ownedPage(owned,expanded,page).games
  const key=JSON.stringify([current.specs,visible.map(game=>game.appId)])
  if(attemptedPages.current.has(key))return
  const pending=visible.filter(game=>!current.results[game.appId]||current.results[game.appId].resolutions?.some(item=>!item.target))
  attemptedPages.current.add(key)
  if(pending.length)current.diagnoseGames(pending,current.specs)
 },[owned,expanded,page,diagnosis.specs,diagnosis.busy,loading])

 async function loadOwned(){syncingOwned.current=true;const id=++sequence.current;controller.current?.abort();setError('');setLoading(true);try{const response=await syncSteamLibrary();if(sequence.current===id){const games=Array.isArray(response)?response:response.games??response.items??[];setOwned(games);setPage(0);setLoading(false);if(!games.length)setError('보유 게임이 없어요. 다른 게임을 검색할 수 있어요.')}}catch(e){if(sequence.current===id)setError(getErrorMessage(e))}finally{if(sequence.current===id){syncingOwned.current=false;setLoading(false)}}}
 async function search(event){syncingOwned.current=false;event.preventDefault();if(!query.trim())return;const id=++sequence.current;controller.current?.abort();const request=new AbortController();controller.current=request;setError('');setLoading(true);try{const games=await searchPcGames(query.trim(),request.signal);if(sequence.current===id){setSearched(games);if(!games.length)setError('게임을 찾지 못했어요. 다른 이름으로 검색해 주세요.')}}catch(e){if(sequence.current===id&&e.name!=='AbortError')setError(e.message)}finally{if(sequence.current===id)setLoading(false)}}
 function row(game){const result=diagnosis.results[game.appId],gameError=diagnosis.gameErrors?.[game.appId];return <tr key={game.appId}><th scope="row"><strong>{game.name}</strong>{gameError&&<small className="pc-photo-error">{gameError}</small>}{result&&<small>{gamePerformanceGrade(result)?`${gamePerformanceGrade(result).grade} · 참고 예상 등급`:resolutionTarget(result,'FHD').label}</small>}{game.playtimeForever>0&&<small>누적 {(game.playtimeForever/60).toFixed(1)}시간</small>}{result?.explanationStatus==='READY'?<small>AI 분석 완료</small>:<small>{diagnosis.busy!==null?'자동 분석 중…':diagnosis.error?'자동 분석 중단':diagnosis.specs?'자동 분석 대상':'PC 사양 입력 필요'}</small>}</th>{['FHD','QHD','4K'].map(name=><td key={name}>{result?<button className="pc-result-detail" title={resolutionTarget(result,name).reason} onClick={()=>diagnosis.setSelected(game.appId)}>{resolutionTarget(result,name).grade?`${resolutionTarget(result,name).grade} · ${resolutionTarget(result,name).label}`:resolutionTarget(result,name).label}<small>{resolutionTarget(result,name).grade?'낮음 옵션 · AI 추정':'이유 확인 ⓘ'}</small></button>:<span>{!diagnosis.specs?'PC 사양 입력 필요':(diagnosis.busy===-1||diagnosis.busy===game.appId)?'AI 분석 중…':gameError?'분석 실패':diagnosis.error?'분석 중단':diagnosis.busy!==null?'순서 대기':'분석 전'}</span>}</td>)}</tr>}
 return <section className="pc-panel pc-game-diagnosis"><div className="pc-section-top"><PanelHeading icon="gamepad" title="게임별 예상 성능" subtitle="내 PC와 게임을 AI가 분석하고, 성능과 개선 방향을 설명해요."/><div className="pc-game-actions">{signedIn?<button className="pc-outline-action" disabled={loading||diagnosis.busy!==null} onClick={()=>{setShowSearch(false);loadOwned()}}><GSIcon name="library" size={16}/>{loading?'불러오는 중…':'내 보유게임 가져오기'}</button>:<Link className="pc-outline-action" to="/login?next=%2Fpc-check"><GSIcon name="library" size={16}/>내 보유게임 가져오기</Link>}<button className="pc-outline-action" aria-expanded={showSearch} aria-controls="pc-game-search" onClick={()=>setShowSearch(!showSearch)}><GSIcon name="search" size={16}/>다른 게임 검색하기</button></div></div>
 {showSearch&&<div id="pc-game-search" className="pc-game-picker">{signedIn?<form className="pc-game-search-form" onSubmit={search}><label htmlFor="pc-search-live">분석할 게임 이름을 입력해 주세요</label><div className="pc-game-query"><GSIcon name="search" size={18}/><input id="pc-search-live" value={query} onChange={e=>setQuery(e.target.value)} placeholder="게임 이름을 입력해 주세요" maxLength={100}/><button type="submit" disabled={loading}>검색</button></div></form>:<p className="pc-form-hint"><Link to="/login?next=%2Fpc-check">로그인</Link> 후 게임을 검색할 수 있어요.</p>}</div>}
 {owned.length>0&&<div className="pc-owned-controls"><span>{listing.hasPlaytime?'플레이시간 상위 순':'플레이시간 기록 없음 · 이름순'} · {listing.total}개</span>{owned.length>5&&<button onClick={()=>{setExpanded(!expanded);setPage(0)}}>{expanded?'접기':'펼치기'}</button>}</div>}
 <div className="pc-live-table-wrap"><table className="pc-live-table"><thead><tr><th>게임</th><th>FHD<small>1920 × 1080</small></th><th>QHD<small>2560 × 1440</small></th><th>4K<small>3840 × 2160</small></th></tr></thead><tbody>{listing.games.map(row)}{owned.length===0&&<tr><td colSpan={4}><div className="pc-games-empty"><span className="pc-empty-symbol"><GSIcon name="gamepad" size={30}/></span><h3>어떤 게임을 플레이하고 싶으세요?</h3><p>보유 게임을 가져오거나, 궁금한 게임을 찾아보세요.</p></div></td></tr>}</tbody></table></div>
 {expanded&&listing.pages>1&&<div className="pc-game-pages"><button disabled={listing.page===0} onClick={()=>setPage(page-1)}>이전</button><span>{listing.page+1} / {listing.pages}</span><button disabled={listing.page+1===listing.pages} onClick={()=>setPage(page+1)}>다음</button></div>}

 {searched.length>0&&<div className="pc-searched-games"><h3>검색한 게임</h3>{searched.map(game=><div key={game.appId}><span>{game.name}</span><button className="pc-inline-action" disabled={!diagnosis.specs||diagnosis.busy!==null} onClick={()=>diagnosis.diagnose(game)}>{(diagnosis.busy===-1||diagnosis.busy===game.appId)?'AI 분석 중…':'AI 분석하기'} ↗</button></div>)}</div>}
 {!diagnosis.specs&&<p className="pc-form-hint">사진 또는 직접 입력으로 PC 사양을 확인한 뒤 비교할 수 있어요.</p>}
 {diagnosis.specs&&owned.length>0&&diagnosis.busy===null&&diagnosis.error&&<button className="pc-inline-action" onClick={()=>diagnosis.diagnoseGames(listing.games,diagnosis.specs)}>현재 게임 함께 다시 분석</button>}
 {(error||diagnosis.error)&&<p role="alert" className="pc-photo-error">{error||diagnosis.error}</p>}{diagnosis.busy!==null&&<button className="pc-inline-action" onClick={diagnosis.cancel}>진단 취소</button>}
 </section>
}
