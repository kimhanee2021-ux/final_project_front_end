import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authLink, readAccessToken } from '../../features/auth/authSession'
import { browserStores } from '../../utils/apiClient'
import { api } from '../ai/aiApi'
import { makeChoice, validateRound } from './worldcupModel'
import './worldcup.css'

const reasonsList=['분위기','스토리','전투','탐험','전략','편하게 즐기기']
export default function TasteWorldcup() {
  const {isAuthenticated,isAuthLoading}=useAuth()
  const token=isAuthenticated?readAccessToken(browserStores()):''
  return <Worldcup key={token||'guest'} token={token} authLoading={isAuthLoading}/>
}
function GameCard({game, onChoose, disabled, compact=false}) {
  const [broken,setBroken]=useState(false)
  return <article className={`wc-game ${compact?'wc-compact':''}`}>
    <div className="wc-cover">{broken?<span>이미지를 불러오지 못했어요<br/>{game.name}</span>:<img src={game.imageUrl} alt={game.name} onError={()=>setBroken(true)} loading={compact?'lazy':'eager'}/>}</div>
    <div className="wc-game-body"><div className="wc-tags">{game.tags.slice(0,4).map(t=><span key={t}>{t}</span>)}</div>
      <h2>{game.name}</h2><p className="wc-description">{game.description}</p>
      {!compact&&<button className="wc-primary" disabled={disabled} onClick={onChoose}>이 게임이 더 좋아요</button>}
      <details><summary>게임 정보와 출처</summary><p>출시: {game.releasedAt}<br/>리뷰 {game.reviewCount.toLocaleString()}개 · 수집 당시 동시접속 {game.currentPlayers?.toLocaleString()??'확인 불가'}명</p><p>리뷰 작성자 {game.sampleSize}명 표본의 플레이 시간 중앙값 {game.sampleMedianHours}시간. 전체 이용자의 기록이나 나의 플레이 시간이 아닙니다.</p><a href={game.source} target="_blank" rel="noreferrer">Steam에서 확인 ↗</a></details>
    </div>
  </article>
}
function Worldcup({token,authLoading}) {
  const {signOut}=useAuth()
  const [catalog,setCatalog]=useState(null),[groups,setGroups]=useState([]),[rounds,setRounds]=useState(10)
  const [history,setHistory]=useState([]),[data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const [reasons,setReasons]=useState([]),[note,setNote]=useState(''),[session,setSession]=useState(''),[view,setView]=useState('setup')
  const [catalogError,setCatalogError]=useState(''),[reload,setReload]=useState(0)
  const [lastRequest,setLastRequest]=useState(null)
  const abort=useRef(null),epoch=useRef(0),pending=useRef(false),resultHeading=useRef(null)
  useEffect(()=>{
    document.title='AI 게임 취향 월드컵'
    const requestEpoch=epoch,activeAbort=abort
    return()=>{requestEpoch.current++;activeAbort.current?.abort()}
  },[])
  useEffect(()=>{
    if(!token)return
    const controller=new AbortController()
    api('/ai/worldcup/catalog',{token,signal:controller.signal}).then(setCatalog).catch(err=>{if(err.name!=='AbortError'){setCatalogError(err.message);if(err.status===401)signOut()}})
    return()=>controller.abort()
  },[token,reload,signOut])
  useEffect(()=>{if(data?.complete)resultHeading.current?.focus()},[data])
  const filtered=catalog?.games.filter(g=>!groups.length||g.groupIds.some(id=>groups.includes(id)))||[]
  const parents=[...new Set(catalog?.groups.map(g=>g.parent)||[])]
  function toggle(ids){setGroups(previous=>ids.every(id=>previous.includes(id))?previous.filter(id=>!ids.includes(id)):[...new Set([...previous,...ids])])}
  function stop(){epoch.current++;abort.current?.abort();pending.current=false;setBusy(false)}
  function reset(){stop();setData(null);setHistory([]);setError('');setReasons([]);setNote('');setView('setup');setLastRequest(null)}
  async function request(payload,choices) {
    if(pending.current)return
    pending.current=true;setBusy(true);setError('')
    setLastRequest({payload,choices})
    const version=++epoch.current,controller=new AbortController();abort.current=controller
    const timer=setTimeout(()=>controller.abort(),70000)
    try {
      const response=await api('/ai/worldcup/next',{token,method:'POST',body:payload,signal:controller.signal})
      if(version!==epoch.current)return
      if(choices.length===payload.rounds){if(!response.complete||!response.summary||!Array.isArray(response.favorites))throw new Error('취향 결과를 확인하지 못했습니다. 다시 시도해주세요.')}
      else {if(response.complete)throw new Error('진행 정보를 확인하지 못했습니다.');validateRound(response,choices)}
      setData(response);setHistory(choices);setView(response.complete?'result':'play');setReasons([]);setNote('');setLastRequest(null)
    } catch(err){if(version!==epoch.current)return;setError(err.name==='AbortError'?'AI 응답이 늦어 요청을 종료했어요. 다시 시도해주세요.':err.message);if(err.status===401)signOut()}
    finally{clearTimeout(timer);if(version===epoch.current){pending.current=false;setBusy(false)}}
  }
  function start(){const id=crypto.randomUUID();setSession(id);request({sessionId:id,rounds,groups,history:[]},[])}
  function choose(verdict){
    if(!data?.pair||pending.current)return
    const choices=[...history,makeChoice(data.pair,verdict,reasons,note)]
    request({sessionId:session,rounds,groups,history:choices.map(({leftId,rightId,verdict,reasons,note})=>({leftId,rightId,verdict,reasons,note}))},choices)
  }
  return <main className="wc-page">
    <header className="wc-heading"><div><span className="wc-eyebrow">CHOOSE · DISCOVER · YOUR TASTE</span><h1>AI 게임 취향 월드컵</h1><p>두 게임을 비교하며, 아직 몰랐던 나의 취향을 찾아보세요.</p></div><span className="wc-badge">{catalog?`${catalog.count}개 게임`:'나만의 선택'}</span></header>
    <details className="wc-guide"><summary>어떻게 진행하나요?</summary><p>고정 대진표가 아닌 취향 탐색입니다. AI가 선택과 이유를 보고 다음 두 게임을 구성해요. 장르를 섞거나 세부 장르를 여러 개 골라도 돼요. 두 게임이 모두 좋거나 별로일 때도 선택할 수 있고, 모르는 게임은 ‘둘 다 몰라요’로 넘길 수 있어요.</p><p>결과는 이번 선택에 대한 해석이며 성격 검사나 구매 적합도 확정이 아닙니다. 게임 정보는 2026년 10월 11일 수집한 Steam 공개 정보이며 가격·플레이 통계는 실시간으로 갱신되지 않아요.</p></details>
    {authLoading?<p role="status">로그인을 확인하고 있어요.</p>:!token?<section className="wc-panel"><h2>내 선택으로 알아보는 게임 취향</h2><p>로그인하면 AI가 다음 대결을 구성하고 선택 근거를 담은 결과를 보여줘요.</p><Link className="wc-primary wc-link" to={authLink('/login','/ai-worldcup')}>로그인하고 시작하기 →</Link></section>:<>
      {!catalog?<section className="wc-panel"><p role="status">{catalogError||'게임 정보를 불러오고 있어요.'}</p>{catalogError&&<button onClick={()=>{setCatalogError('');setReload(n=>n+1)}}>다시 불러오기</button>}</section>:<>
        {view==='setup'&&<section className="wc-panel wc-setup"><h2>어떤 게임끼리 비교할까요?</h2><p>전체 게임으로 시작하거나, 궁금한 장르와 특징을 여러 개 골라보세요.</p><button className={!groups.length?'wc-chip selected':'wc-chip'} disabled={busy} onClick={()=>setGroups([])}>전체 장르</button>
          <div className="wc-group-list">{parents.map(parent=>{const children=catalog.groups.filter(g=>g.parent===parent);return <fieldset key={parent}><legend>{parent}</legend><button className="wc-chip" disabled={busy} onClick={()=>toggle(children.map(g=>g.id))}>{parent} 전체</button>{children.map(g=><button key={g.id} className={`wc-chip ${groups.includes(g.id)?'selected':''}`} aria-pressed={groups.includes(g.id)} disabled={busy} onClick={()=>toggle([g.id])}>{g.name}<small>{g.count}</small></button>)}</fieldset>})}</div>
          <div className="wc-start"><div><strong>선택한 범위 {filtered.length}개 게임</strong><p>여러 분류를 선택하면 해당 게임들을 함께 비교해요.</p></div><label>선택 횟수 <select value={rounds} disabled={busy} onChange={e=>setRounds(Number(e.target.value))}>{[3,5,10,16,24].map(n=><option key={n} value={n} disabled={filtered.length<n*2}>{n}회{n<=5?' · 짧게 탐색':''}{filtered.length<n*2?' · 게임 수 부족':''}</option>)}</select></label><button className="wc-primary" onClick={start} disabled={busy||filtered.length<rounds*2}>AI 대결 시작 →</button></div>{filtered.length<rounds*2&&<p className="wc-warning">반복 없이 비교할 게임이 부족해요. 분류를 추가하거나 횟수를 줄여주세요.</p>}
        </section>}
        {view==='play'&&data&&<section className="wc-play"><div className="wc-progress-label"><strong>{history.length+1} / {rounds}번째 선택</strong><button disabled={busy} onClick={reset}>처음부터</button></div><progress max={rounds} value={history.length} aria-label="선택 진행률"/><p className="wc-ai-note"><span>AI의 다음 질문</span>{data.explanation}</p>
          <div className="wc-duel">{data.pair.map((game,i)=><GameCard key={game.appId} game={game} disabled={busy} onChoose={()=>choose(i?'right':'left')}/>)}</div>
          <div className="wc-panel wc-reasons"><h3>선택 이유도 알려줄까요? <small>선택 사항 · 여러 개 가능</small></h3><div>{reasonsList.map(reason=><button key={reason} disabled={busy} aria-pressed={reasons.includes(reason)} className={`wc-chip ${reasons.includes(reason)?'selected':''}`} onClick={()=>setReasons(previous=>previous.includes(reason)?previous.filter(r=>r!==reason):[...previous,reason])}>{reason}</button>)}</div><label className="wc-note-label">나만의 이유<input disabled={busy} value={note} maxLength={200} onChange={e=>setNote(e.target.value)} placeholder="예: 경쟁보다 혼자 탐험하는 게 좋아요"/></label><p>이유를 먼저 고른 뒤 게임이나 아래 선택 버튼을 눌러주세요.</p>
            <div className="wc-other-choices"><button disabled={busy} onClick={()=>choose('both')}>둘 다 좋아요 ♥</button><button disabled={busy} onClick={()=>choose('neither')}>둘 다 별로예요</button><button disabled={busy} onClick={()=>choose('unknown')}>둘 다 몰라요 · 건너뛰기</button></div>
          </div>
        </section>}
        {view==='result'&&data&&<section className="wc-result"><div className="wc-panel"><span className="wc-eyebrow">YOUR TASTE DISCOVERED</span><h2 tabIndex={-1} ref={resultHeading}>이번 선택에서 발견한 취향</h2><p className="wc-summary">{data.summary}</p><div className="wc-tags">{data.traits.map(t=><span key={t}>{t}</span>)}</div><h3>내 선택이 보여준 근거</h3><ul>{data.evidence.map((item,i)=><li key={i}>{item}</li>)}</ul>{data.uncertainty&&<p className="wc-warning">{data.uncertainty}</p>}<p>총 {history.length}회 선택 · 좋아한 게임 {new Set(history.flatMap(c=>c.selectedIds)).size}개</p><button className="wc-primary" onClick={reset}>다른 조건으로 다시 해보기</button></div>{data.favorites.length>0&&<><h2>내가 좋아했던 게임</h2><div className="wc-favorites">{data.favorites.map(game=><GameCard key={game.appId} game={game} compact/>)}</div></>}</section>}
      </>}
      {busy&&<div className="wc-loading" role="status"><span className="wc-spinner"/><strong>{history.length+1>=rounds?'AI가 선택 기록을 정리하고 있어요':'AI가 다음 두 게임을 고르고 있어요'}</strong><p>선택 이유와 게임 특징을 함께 비교하고 있어요.</p><button onClick={()=>{stop();setError('요청을 취소했어요. 다시 시도하면 같은 선택에서 이어집니다.')}}>취소</button></div>}
      {error&&<div className="wc-error" role="alert"><p>{error}</p>{lastRequest&&!busy&&<button onClick={()=>request(lastRequest.payload,lastRequest.choices)}>같은 선택으로 다시 시도</button>}<button disabled={busy} onClick={reset}>조건 다시 선택</button></div>}
    </>}
  </main>
}
