import { useAiChat } from '../hooks/useAiChat';
import { PageHeading, Panel, PanelPage } from '@/shared/ui';
import '@/shared/styles/ai.css';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { authLink } from '@/features/auth'
import { readAccessToken } from '@/shared/lib/tokenStorage';
import { browserStores } from '@/shared/lib/apiClient';
export default function AiGames() {
  const {
    isAuthenticated,
    isAuthLoading
  } = useAuth();
  const token = isAuthenticated ? readAccessToken(browserStores()) : '';
  return <AiChat key={token || 'guest'} token={token} loading={isAuthLoading} />;
}
function AiChat({
  token,
  loading
}) {
  const {
    mode,
    genre,
    setGenre,
    game,
    keyword,
    setKeyword,
    found,
    searching,
    messages,
    text,
    setText,
    busy,
    error,
    end,
    newChat,
    search,
    send,
    cancel
  } = useAiChat({
    token,
    loading
  });
  return <PanelPage><Panel className="ai-page">
    <PageHeading title="AI 게임 추천" description="오늘 할 게임부터, 구매 전 고민까지 함께 찾아봐요." action={<Link to="/ai-screenshots">AI 스크린샷 분석 ↗</Link>} />
    {error && <p role="alert" className="ai-error">{error}</p>}
    {!token ? <div className="ai-login"><h2>{loading ? '로그인 확인 중…' : '로그인하고 상담 시작하기'}</h2><p>회원 계정으로 게임 추천과 구매 상담을 이용하세요.</p>{!loading && <Link className="ai-primary ai-login-link" to={authLink('login', '/ai-games')}>로그인</Link>}</div> : <>
      <div className="ai-tabs" role="group" aria-label="상담 종류"><button aria-pressed={mode === 'recommend'} disabled={busy} onClick={() => newChat('recommend')}>AI 게임 추천</button><button aria-pressed={mode === 'purchase'} disabled={busy} onClick={() => newChat('purchase')}>AI 구매 상담</button><button className="ai-reset" disabled={busy} onClick={() => newChat()}>새 대화</button></div>
      {mode === 'recommend' ? <div className="ai-options"><label>관심 장르<select value={genre} disabled={busy} onChange={e => {
            setGenre(e.target.value);
            newChat();
          }}><option value="">모든 장르</option>{['RPG', 'Action', 'Adventure', 'Strategy', 'Simulation', 'Casual', 'Sports', 'Racing'].map(g => <option key={g}>{g}</option>)}</select></label><span>예산·취향·플레이 인원을 질문에 알려주세요.</span></div> : <form className="ai-search" onSubmit={search}><label>상담할 게임<input value={keyword} onChange={e => setKeyword(e.target.value)} maxLength={100} placeholder="게임 이름으로 검색" disabled={busy} /></label><button disabled={busy || searching || !keyword.trim()}>{searching ? '검색 중…' : '검색'}</button>{game && <span className="ai-selected">선택한 게임: {game.name}</span>}<div className="ai-search-results">{found.map(item => <button type="button" key={item.appId} disabled={busy} onClick={() => newChat('purchase', item)}>{item.name}</button>)}</div></form>}
      <div className="ai-conversation" aria-live="polite" aria-busy={busy}>
        {!messages.length && <div className="ai-welcome"><span className="ai-symbol">✦</span><h2>{mode === 'recommend' ? '어떤 게임을 찾고 있나요?' : '이 게임, 나에게 맞을까요?'}</h2><p>{mode === 'recommend' ? '좋아하는 장르와 원하는 플레이 경험을 알려주세요.' : '게임을 선택하고, 취향이나 걱정되는 점을 알려주세요.'}</p><div className="ai-examples">{(mode === 'recommend' ? ['스토리 좋은 RPG를 찾고 있어. 예산은 3만 원이야.', '퇴근 후 짧게 즐길 수 있는 게임 추천해줘.'] : ['이 게임의 장점과 주의할 점을 알려줘.', '초보자인데 나한테 잘 맞을까?']).map(q => <button key={q} disabled={busy} onClick={() => setText(q)}>{q}</button>)}</div></div>}
        {messages.map((m, index) => <div key={index} className={`ai-message ${m.role}`}><strong>{m.role === 'user' ? '나' : 'AI 게임 추천'}</strong><p>{m.text}</p>{m.games?.length > 0 && <div className="ai-cards">{m.games.map(item => <article key={item.appId}><span className="ai-game-genre">{item.genre || '장르 정보 없음'}</span><h3>{item.name}</h3><p>{item.reason}</p><small>{item.priceInfo || '가격 정보 없음'} · {item.lastSyncedAt ? `${item.lastSyncedAt.slice(0, 10)} 기준` : '현재 가격은 판매처에서 확인'}</small><div><a href={item.storeUrl} target="_blank" rel="noreferrer">Steam에서 확인 ↗</a>{mode === 'recommend' && <button disabled={busy} onClick={() => newChat('purchase', item)}>구매 상담</button>}</div></article>)}</div>}</div>)}
        {busy && <div><p role="status" className="ai-thinking">게임 정보를 살펴보고 있어요…</p><button type="button" onClick={cancel}>답변 기다리기 취소</button></div>}<div ref={end} />
      </div>
      <form className="ai-composer" onSubmit={send}><label className="ai-sr-only" htmlFor="ai-question">질문</label><textarea id="ai-question" value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={3} disabled={busy} placeholder={mode === 'purchase' && !game ? '먼저 상담할 게임을 선택해주세요.' : '어떤 게임을 원하시나요? 취향과 고민을 자유롭게 적어주세요.'} /><div><small>{text.length}/2000</small><button className="ai-primary" disabled={busy || !text.trim() || mode === 'purchase' && !game}>{busy ? '답변 준비 중…' : '질문 보내기'}</button></div></form>
      <p className="ai-note">AI 답변에는 오류가 있을 수 있어요. 가격·할인·플레이 인원은 공식 판매처에서 최종 확인해주세요.</p>
    </>}
  </Panel></PanelPage>;
}
