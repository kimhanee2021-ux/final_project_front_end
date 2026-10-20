import { useGameManager } from '../hooks/useGameManager';
import { PageHeading, Panel, PanelPage } from '@/shared/ui';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { authLink } from '@/features/auth'
import { readAccessToken } from '@/shared/lib/tokenStorage';
import { browserStores } from '@/shared/lib/apiClient';
import { priceLabel } from '../managerModel';
import '@/shared/styles/manager.css';
export default function GameManager() {
  const {
    isAuthenticated,
    isAuthLoading
  } = useAuth();
  const [search] = useSearchParams();
  const demo = search.get('demo') === '1';
  const token = isAuthenticated ? readAccessToken(browserStores()) : '';
  return <Manager key={demo ? 'demo' : token || 'guest'} token={token} demo={demo} authLoading={isAuthLoading} />;
}
function Manager({
  token,
  demo,
  authLoading
}) {
  const {
    state,
    setState,
    tab,
    query,
    setQuery,
    appInput,
    setAppInput,
    message,
    setMessage,
    draft,
    setDraft,
    basket,
    setBasket,
    target,
    setTarget,
    label,
    setLabel,
    edit,
    setEdit,
    busy,
    canCancel,
    error,
    setError,
    notice,
    setNotice,
    setReload,
    epoch,
    review,
    feedback,
    examples,
    owned,
    ownedIds,
    collections,
    watches,
    notifications,
    unread,
    matches,
    cost,
    cancel,
    perform,
    request,
    refresh,
    add,
    ask,
    saveCollection,
    saveWatch,
    action,
    switchTab,
    showSamples
  } = useGameManager({
    token,
    demo,
    authLoading
  });
  function renderSearch() {
    return <section className="gm-panel"><h3>{tab === 'library' ? '보유 게임 직접 등록' : '구매할 상품 선택'}</h3><p>{tab === 'library' ? 'Steam을 연결하지 않았다면 보유한 게임을 직접 추가할 수 있어요.' : '게임을 검색하고 필요한 DLC까지 직접 골라주세요.'}</p><label>게임 이름<input value={query} disabled={busy} onChange={e => setQuery(e.target.value)} placeholder="예: Terraria" /></label>{matches.map(g => <div className="gm-search-row" key={g.appId}><span>{g.name}</span><button disabled={busy} onClick={() => add(g.appId, tab === 'library' ? 'owned' : 'basket')}>{tab === 'library' ? '보유 등록' : '상품 선택'}</button></div>)}{query && !matches.length && <p>검색 결과가 없어요. 아래에 Steam 앱 번호를 입력해보세요.</p>}<details><summary>검색에 없는 게임·DLC 추가</summary><p>Steam 상점 주소의 /app/ 다음 숫자를 입력하세요. 번들·패키지 번호는 지원하지 않아요.</p><label>Steam 앱 번호<input inputMode="numeric" value={appInput} disabled={busy} onChange={e => setAppInput(e.target.value)} /></label><button disabled={busy} onClick={() => {
          if (!/^\d{1,9}$/.test(appInput) || Number(appInput) < 1) {
            setError('올바른 Steam 앱 번호를 입력해주세요.');
            return;
          }
          add(Number(appInput), tab === 'library' ? 'owned' : 'basket');
        }}>상품 확인하고 추가</button></details></section>;
  }
  return <PanelPage><Panel className="gm-page"><PageHeading title="AI 내 게임 매니저" description="내 게임은 편하게 정리하고, 사고 싶은 게임은 원하는 가격에 기다려보세요." />
 {demo && <aside className="gm-panel gm-demo"><strong>데모 체험 · 샘플 데이터</strong><p>보유 게임과 가격·AI 제안은 샘플이에요. 서버 감시와 실제 알림은 동작하지 않고, 새로고침하면 처음의 샘플 구성으로 돌아가요.</p><div className="gm-presets"><button disabled={busy} onClick={() => showSamples('library')}>컬렉션 예시 보기</button><button disabled={busy} onClick={() => showSamples('watch')}>할인 대기·충족·실패 예시 보기</button><button disabled={busy} onClick={() => showSamples('alerts')}>알림 예시 보기</button></div><Link to={authLink('/login', '/ai-game-manager')}>로그인하고 실제로 이용하기 →</Link><Link to="/ai-game-manager">데모 나가기</Link></aside>}
 {authLoading ? <p role="status">로그인을 확인하고 있어요.</p> : !token && !demo ? <section className="gm-panel gm-welcome"><h2>내 게임을 위한 두 가지 도움</h2><div className="gm-columns"><article><h3>내 게임 정리하기</h3><p>원하는 기준을 말하면 AI가 컬렉션을 제안해요. 확인한 뒤 저장하세요.</p></article><article><h3>할인 기다리기</h3><p>사고 싶은 상품과 목표 금액을 정하면 조건을 충족했을 때 사이트 알림을 받아요.</p></article></div><Link className="gm-primary gm-link" to={authLink('/login', '/ai-game-manager')}>로그인하고 시작하기</Link><Link className="gm-link" to="/ai-game-manager?demo=1">데모로 둘러보기 →</Link></section> : state ? <>
 <nav className="gm-tabs" aria-label="내 게임 매니저"><button aria-pressed={tab === 'library'} disabled={busy} onClick={() => switchTab('library')}>내 게임 정리 <small>{owned.length}</small></button><button aria-pressed={tab === 'watch'} disabled={busy} onClick={() => switchTab('watch')}>할인 기다리기 <small>{watches.length}</small></button><button aria-pressed={tab === 'alerts'} disabled={busy} onClick={() => switchTab('alerts')} aria-label={unread > 0 ? `알림 ${unread}개 새 알림` : '알림'}>알림 {unread > 0 && <small>{unread}</small>}</button></nav>
 {tab !== 'alerts' && <section className="gm-panel gm-ai"><h2>{tab === 'library' ? '어떤 기준으로 정리할까요?' : '어떤 가격을 기다릴까요?'}</h2><p>{tab === 'library' ? '예: 내가 가진 게임 중 탐험하는 게임을 모아줘.' : '예: Portal 2를 1만 원 이하일 때 사고 싶어.'}</p><div className="gm-presets">{(tab === 'library' ? ['탐험하는 게임을 모아줘', '전략 게임으로 컬렉션 만들어줘'] : ['Portal 2를 1만 원 이하에 사고 싶어', 'Terraria를 5천 원 이하일 때 알려줘']).map(t => <button disabled={busy} key={t} onClick={() => setMessage(t)}>{t}</button>)}</div><label>AI에게 요청하기<textarea maxLength={500} disabled={busy} value={message} onChange={e => setMessage(e.target.value)} placeholder={tab === 'library' ? '내 게임을 어떻게 정리하고 싶나요?' : '관심 게임과 원하는 금액을 적어주세요.'} /></label><button className="gm-primary" disabled={busy || !message.trim() || tab === 'library' && !owned.length} onClick={ask}>{demo ? '샘플 제안 보기' : 'AI 제안 받기'}</button><p className="gm-small">제안은 자동으로 저장되지 않아요. 아래에서 수정하고 확인해주세요.</p>{tab === 'library' && !owned.length && <p>먼저 아래에서 보유 게임을 등록하거나 Steam을 동기화해주세요.</p>}</section>}
 {tab === 'library' && <><section className="gm-panel"><div className="gm-row"><h2>내 보유 게임</h2><button disabled={busy || demo} onClick={() => perform(async (signal, version) => {
              const next = await request('/sync', {
                method: 'POST'
              }, signal);
              if (version === epoch.current) {
                setState(next);
                setNotice('Steam 보유 게임을 동기화했어요.');
              }
            })}>Steam 동기화</button></div><p className="gm-small">Steam 계정 연동 및 공개 설정이 필요해요. 직접 등록한 게임은 소유권 확인 자료가 아니에요.</p>{!owned.length ? <p>아직 보유 게임이 없어요. Steam을 동기화하거나 아래에서 직접 등록해주세요.</p> : <div className="gm-owned">{owned.map(g => <article key={g.appId}><strong>{g.name}</strong><small>{g.source}{g.minutes > 0 ? ` · ${(g.minutes / 60).toFixed(1)}시간` : ''}</small></article>)}</div>}{owned.length > 100 && <p>AI 초안은 앞의 100개 게임부터 정리해요.</p>}</section>
 {renderSearch()}
 {draft && <section ref={review} className="gm-panel gm-review"><h2>{demo ? '샘플 컬렉션 확인' : 'AI 컬렉션 확인'}</h2><p>{draft.explanation}</p><label>컬렉션 이름<input maxLength={50} value={draft.name} disabled={busy} onChange={e => setDraft(d => ({
              ...d,
              name: e.target.value
            }))} /></label><div className="gm-owned">{owned.map(g => <label key={g.appId}><input type="checkbox" disabled={busy} checked={draft.appIds.includes(g.appId)} onChange={e => setDraft(d => ({
                ...d,
                appIds: e.target.checked ? [...d.appIds, g.appId] : d.appIds.filter(id => id !== g.appId)
              }))} />{g.name}</label>)}</div><button className="gm-primary" disabled={busy || !draft.name.trim() || !draft.appIds.length} onClick={saveCollection}>확인하고 컬렉션 저장</button></section>}
 <section ref={examples} className="gm-panel"><h2>저장한 컬렉션 <small>{collections.length}</small></h2>{!collections.length && <p>AI 제안을 확인하고 저장하면 여기에 모여요.</p>}{collections.map(r => <article className="gm-item" key={r.id}><h3>{r.data.name} {demo && <span className="gm-badge">샘플 컬렉션</span>}</h3><p>{r.data.explanation}</p><ul>{r.data.appIds.map(id => <li key={id}>{owned.find(g => g.appId === id)?.name || `목록에서 제외된 게임 #${id}`}</li>)}</ul><details><summary>이름 바꾸기</summary><form onSubmit={e => {
                e.preventDefault();
                const name = new FormData(e.currentTarget).get('name');
                perform(async (signal, version) => {
                  if (demo) setState(s => ({
                    ...s,
                    records: s.records.map(x => x.id === r.id ? {
                      ...x,
                      data: {
                        ...x.data,
                        name
                      }
                    } : x)
                  }));else {
                    await request('/collections/' + r.id, {
                      method: 'PATCH',
                      body: {
                        name
                      }
                    }, signal);
                    await refresh(signal, version);
                  }
                });
              }}><input aria-label="새 컬렉션 이름" name="name" defaultValue={r.data.name} maxLength={50} required disabled={busy} /><button disabled={busy}>이름 저장</button></form></details><button disabled={busy} onClick={() => action(r, 'delete')}>컬렉션 삭제</button></article>)}</section></>}
 {tab === 'watch' && <>{renderSearch()}<section ref={review} className="gm-panel gm-review"><h2>{edit ? '구매 조건 수정' : '선택한 구매 상품'}</h2>{draft && <p>{draft.explanation}</p>}{!basket.length ? <p>위에서 상품을 검색하거나 AI 제안을 받아보세요.</p> : basket.map(p => <article className="gm-item" key={p.appId}><div className="gm-row"><strong>{p.name} {p.type === 'dlc' ? '· DLC' : ''}</strong><button disabled={busy} onClick={() => setBasket(b => b.filter(g => g.appId !== p.appId))}>제외</button></div><p>{ownedIds.has(p.appId) ? '이미 보유 · 가격 합계에서 제외' : priceLabel(p)}{demo ? ' · 샘플 가격' : ''}</p><a href={`https://store.steampowered.com/app/${p.appId}`} target="_blank" rel="noreferrer">상점에서 상품 구성 확인 ↗</a>{p.parentAppId && !ownedIds.has(p.parentAppId) && !basket.some(g => g.appId === p.parentAppId) && <button disabled={busy} onClick={() => add(p.parentAppId, 'basket')}>필요한 본편 추가</button>}{p.dlcIds.length > 0 && <details><summary>DLC를 함께 구매하고 싶어요</summary><p>각 DLC를 선택하면 이름과 가격을 확인할 수 있어요. 사운드트랙은 추가할 수 없어요.</p>{p.dlcIds.slice(0, 30).map(id => <button key={id} disabled={busy || basket.some(g => g.appId === id)} onClick={() => add(id, 'basket')}>추가 콘텐츠 {p.dlcIds.indexOf(id) + 1} 확인</button>)}</details>}</article>)}<p><strong>현재 개별 상품 합계: {!basket.length ? '상품 선택 전' : cost === null ? '확인 필요' : (cost / 100).toLocaleString('ko-KR') + '원'}{demo ? ' · 샘플' : ''}</strong></p><p className="gm-small">이미 보유한 상품은 제외해요. 번들·에디션 할인 가격이 아닌 개별 상품 합계이며 최종 결제 금액은 상점에서 확인하세요.</p><div className="gm-columns"><label>구매 대기 이름<input maxLength={100} disabled={busy} value={label} onChange={e => setLabel(e.target.value)} placeholder="예: Portal 할인 기다리기" /></label><label>이 금액 이하면 알려주세요 · 원<input inputMode="numeric" disabled={busy} value={target} onChange={e => setTarget(e.target.value)} placeholder="예: 10,000" /></label></div><button className="gm-primary" disabled={busy || !basket.length || !target.trim() || !label.trim()} onClick={saveWatch}>{edit ? '변경 확인하고 저장' : '확인하고 할인 감시 시작'}</button>{edit && <button disabled={busy} onClick={() => {
            setEdit(null);
            setBasket([]);
            setDraft(null);
            setLabel('');
            setTarget('');
          }}>수정 취소</button>}</section>
 <section ref={examples} className="gm-panel"><h2>기다리는 구매 <small>{watches.length}</small></h2><p className="gm-small">{demo ? '데모에서는 실제 감시하지 않아요.' : '서버가 실행 중이면 약 ' + state.checkIntervalMinutes + '분 간격으로 확인하고, 조건을 충족하면 사이트 알림을 저장해요. 이 화면을 닫아도 서버 감시는 계속돼요.'}</p>{!watches.length && <p>원하는 상품과 금액을 저장하면 여기서 확인할 수 있어요.</p>}{watches.map(r => <article className="gm-item" key={r.id}><div className="gm-row"><h3>{r.data.label} {demo && <span className="gm-badge">샘플 구매 대기</span>}</h3><span className="gm-badge">{!r.data.enabled ? '감시 쉬는 중' : r.data.error ? '가격 확인 필요' : r.data.matched ? '구매 조건 충족' : '할인 기다리는 중'}</span></div><p>목표 {r.data.targetWon.toLocaleString()}원 이하 · 마지막 확인 {r.data.lastChecked ? new Date(r.data.lastChecked).toLocaleString('ko-KR') : '아직 확인 전'}</p><p>마지막 확인 가격: {r.data.totalMinor == null ? '확인 필요' : (r.data.totalMinor / 100).toLocaleString() + '원'}{demo ? ' · 샘플 가격' : ''}</p>{r.data.error && <p className="gm-error">{r.data.error} 이전 가격은 현재 가격이 아닐 수 있어요.</p>}<ul>{r.data.prices.map(p => <li key={p.appId}><a href={`https://store.steampowered.com/app/${p.appId}`} target="_blank" rel="noreferrer">{p.name} ↗</a></li>)}</ul><div className="gm-actions"><button disabled={busy || !r.data.enabled} onClick={() => action(r, 'check')}>{demo ? '샘플 다시 확인' : '지금 확인'}</button><button disabled={busy} onClick={() => action(r, 'pause')}>{r.data.enabled ? '감시 잠시 끄기' : '감시 다시 켜기'}</button><button disabled={busy} onClick={() => {
                setEdit(r.id);
                setBasket(r.data.prices);
                setTarget(String(r.data.targetWon));
                setLabel(r.data.label);
                setDraft(null);
              }}>조건 수정</button><button disabled={busy} onClick={() => action(r, 'delete')}>구매 대기 삭제</button></div></article>)}</section></>}
 {tab === 'alerts' && <section ref={examples} className="gm-panel"><h2>내 구매 알림</h2>{!notifications.length ? <p>아직 알림이 없어요. 구매 조건을 저장하면 충족했을 때 여기에 알려드려요.</p> : notifications.map(r => <article className="gm-item" key={r.id}><h3>{r.data.title} {demo && <span className="gm-badge">샘플 알림</span>} {!r.data.read && <span className="gm-badge">새 알림</span>}</h3><p>{r.data.message}</p><small>{new Date(r.data.createdAt).toLocaleString('ko-KR')}</small><div className="gm-actions">{!r.data.read && <button disabled={busy} onClick={() => action(r, 'read')}>읽음 표시</button>}<button disabled={busy} onClick={() => action(r, 'delete')}>알림 삭제</button></div></article>)}</section>}
 </> : <section className="gm-panel"><p role="status">{error ? '자료를 불러오지 못했어요.' : '내 게임 정보를 불러오고 있어요.'}</p>{error && <button onClick={() => {
        setError('');
        setReload(n => n + 1);
      }}>다시 불러오기</button>}</section>}
 {busy && <aside className="gm-working" role="status"><strong>{canCancel ? 'AI 제안을 준비하고 있어요…' : '저장한 내용을 확인하고 있어요…'}</strong>{canCancel ? <button onClick={cancel}>취소</button> : <span>완료될 때까지 잠시 기다려주세요.</span>}</aside>}{error && <div ref={feedback} className="gm-error" role="alert">{error}</div>}{notice && <div ref={feedback} className="gm-notice" role="status">{notice}</div>}
 <details className="gm-panel gm-guide"><summary>처음 이용하시나요?</summary><p>① 보유 게임 동기화 또는 직접 등록 → ② AI 제안을 확인하고 컬렉션 저장 → ③ 관심 상품과 목표 금액 저장 → ④ 조건 충족 알림 확인.</p><p>Steam 가격은 한국 상점 기준이에요. 가격을 가져오지 못하면 확인 필요로 표시해요. 게임을 자동 구매하거나 이메일을 보내지는 않아요.</p></details>
 </Panel></PanelPage>;
}
