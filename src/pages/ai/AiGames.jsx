import { useState, useEffect, useRef } from 'react'
import { api } from './aiApi'
import './ai.css'

export default function AiGames() {
  const [token, setToken] = useState(() => sessionStorage.getItem('aiToken') || '')
  const [mode, setMode] = useState('recommend')
  const [genre, setGenre] = useState('')
  const [game, setGame] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [found, setFound] = useState([])
  const [searching, setSearching] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const end = useRef(null)
  const abort = useRef(null)
  const searchId = useRef(0)
  useEffect(() => { document.title = 'AI 게임 도우미'; return () => abort.current?.abort() }, [])
  useEffect(() => { end.current?.scrollIntoView({behavior:'smooth',block:'nearest'}) }, [messages, busy])

  function fail(err) {
    if (err.name === 'AbortError') return
    if (err.status === 401) { sessionStorage.removeItem('aiToken'); setToken(''); setMessages([]) }
    setError(err.message)
  }
  function newChat(nextMode = mode, nextGame = null) {
    if (pending.current) return
    searchId.current += 1
    setSearching(false)
    setMode(nextMode); setGame(nextGame); setMessages([]); setFound([]); setError(''); setText('')
  }
  async function login(event) {
    event.preventDefault(); if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const auth = await api('/auth/login',{method:'POST',body:{email:form.get('email'),password:form.get('password')}})
      sessionStorage.setItem('aiToken',auth.token); setToken(auth.token)
    } catch (err) {fail(err)} finally {pending.current=false; setBusy(false)}
  }
  async function search(event) {
    event.preventDefault(); if (!keyword.trim()) return
    const id = ++searchId.current
    setSearching(true); setError(''); setFound([])
    try { const results=await api(`/ai/games?keyword=${encodeURIComponent(keyword.trim())}`,{token}); if(id===searchId.current)setFound(results) }
    catch(err){if(id===searchId.current)fail(err)} finally {if(id===searchId.current)setSearching(false)}
  }
  async function send(event) {
    event.preventDefault()
    const question = text.trim()
    if (!question || pending.current || (mode==='purchase' && !game)) return
    pending.current=true; setBusy(true); setError('')
    const controller = new AbortController()
    abort.current = controller
    try {
      const history=messages.slice(-6).map(m=>({role:m.role,text:m.text.slice(0,2000)}))
      const result=await api('/ai/chat',{token,method:'POST',signal:controller.signal,body:{mode,message:question,genre,gameId:game?.appId,history}})
      if (abort.current !== controller) return
      setMessages(list=>[...list,{role:'user',text:question},{role:'model',text:result.answer,games:result.games}]); setText('')
    } catch(err){if(abort.current===controller)fail(err)} finally {if(abort.current===controller){abort.current=null;pending.current=false; setBusy(false)}}
  }
  function cancel(){abort.current?.abort(); abort.current=null; pending.current=false; setBusy(false)}
  function logout(){cancel(); sessionStorage.removeItem('aiToken'); setToken(''); newChat()}

  return <section className="ai-page">
    <header className="ai-header"><div><span className="ai-kicker">PLAY YOUR WAY</span><h1>AI 게임 도우미</h1><p>오늘 할 게임부터, 구매 전 고민까지 함께 찾아봐요.</p></div>{token && <button onClick={logout}>로그아웃</button>}</header>
    {error && <p role="alert" className="ai-error">{error}</p>}
    {!token ? <form className="ai-login" onSubmit={login}><h2>로그인하고 상담 시작하기</h2><p>회원 계정으로 게임 추천과 구매 상담을 이용하세요.</p><label>이메일<input name="email" type="email" autoComplete="username" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label><button className="ai-primary" disabled={busy}>{busy?'로그인 중…':'로그인'}</button></form> : <>
      <div className="ai-tabs" role="group" aria-label="상담 종류"><button aria-pressed={mode==='recommend'} disabled={busy} onClick={()=>newChat('recommend')}>게임 추천</button><button aria-pressed={mode==='purchase'} disabled={busy} onClick={()=>newChat('purchase')}>구매 고민 상담</button><button className="ai-reset" disabled={busy} onClick={()=>newChat()}>새 대화</button></div>
      {mode==='recommend' ? <div className="ai-options"><label>관심 장르<select value={genre} disabled={busy} onChange={e=>{setGenre(e.target.value);newChat()}}><option value="">모든 장르</option>{['RPG','Action','Adventure','Strategy','Simulation','Casual','Sports','Racing'].map(g=><option key={g}>{g}</option>)}</select></label><span>예산·취향·플레이 인원을 질문에 알려주세요.</span></div> : <form className="ai-search" onSubmit={search}><label>상담할 게임<input value={keyword} onChange={e=>setKeyword(e.target.value)} maxLength={100} placeholder="게임 이름으로 검색" disabled={busy} /></label><button disabled={busy||searching||!keyword.trim()}>{searching?'검색 중…':'검색'}</button>{game&&<span className="ai-selected">선택한 게임: {game.name}</span>}<div className="ai-search-results">{found.map(item=><button type="button" key={item.appId} disabled={busy} onClick={()=>newChat('purchase',item)}>{item.name}</button>)}</div></form>}
      <div className="ai-conversation" aria-live="polite" aria-busy={busy}>
        {!messages.length && <div className="ai-welcome"><span className="ai-symbol">✦</span><h2>{mode==='recommend'?'어떤 게임을 찾고 있나요?':'이 게임, 나에게 맞을까요?'}</h2><p>{mode==='recommend'?'좋아하는 장르와 원하는 플레이 경험을 알려주세요.':'게임을 선택하고, 취향이나 걱정되는 점을 알려주세요.'}</p><div className="ai-examples">{(mode==='recommend'?['스토리 좋은 RPG를 찾고 있어. 예산은 3만 원이야.','퇴근 후 짧게 즐길 수 있는 게임 추천해줘.']:['이 게임의 장점과 주의할 점을 알려줘.','초보자인데 나한테 잘 맞을까?']).map(q=><button key={q} disabled={busy} onClick={()=>setText(q)}>{q}</button>)}</div></div>}
        {messages.map((m,index)=><div key={index} className={`ai-message ${m.role}`}><strong>{m.role==='user'?'나':'AI 게임 도우미'}</strong><p>{m.text}</p>{m.games?.length>0&&<div className="ai-cards">{m.games.map(item=><article key={item.appId}><span className="ai-game-genre">{item.genre||'장르 정보 없음'}</span><h3>{item.name}</h3><p>{item.reason}</p><small>{item.priceInfo||'가격 정보 없음'} · {item.lastSyncedAt?`${item.lastSyncedAt.slice(0,10)} 기준`:'현재 가격은 판매처에서 확인'}</small><div><a href={item.storeUrl} target="_blank" rel="noreferrer">Steam에서 확인 ↗</a>{mode==='recommend'&&<button disabled={busy} onClick={()=>newChat('purchase',item)}>구매 상담</button>}</div></article>)}</div>}</div>)}
        {busy && <div><p role="status" className="ai-thinking">게임 정보를 살펴보고 있어요…</p><button type="button" onClick={cancel}>답변 기다리기 취소</button></div>}<div ref={end}/>
      </div>
      <form className="ai-composer" onSubmit={send}><label className="ai-sr-only" htmlFor="ai-question">질문</label><textarea id="ai-question" value={text} onChange={e=>setText(e.target.value)} maxLength={2000} rows={3} disabled={busy} placeholder={mode==='purchase'&&!game?'먼저 상담할 게임을 선택해주세요.':'어떤 게임을 원하시나요? 취향과 고민을 자유롭게 적어주세요.'}/><div><small>{text.length}/2000</small><button className="ai-primary" disabled={busy||!text.trim()||(mode==='purchase'&&!game)}>{busy?'답변 준비 중…':'질문 보내기'}</button></div></form>
      <p className="ai-note">AI 답변에는 오류가 있을 수 있어요. 가격·할인·플레이 인원은 공식 판매처에서 최종 확인해주세요.</p>
    </>}
  </section>
}
