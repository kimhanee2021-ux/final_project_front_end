import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth';
import { api } from '../api';
import { loadDemoCatalog } from '../../games/aiDemoCatalog';
import { parseWon, selectedCost } from '../managerModel';
import { createManagerDemo, managerDemoProduct, applyManagerDemoAction } from '../mocks/managerDemo';
export function useGameManager({
  token,
  demo
}) {
  const {
    signOut
  } = useAuth();
  const [state, setState] = useState(null),
    [tab, setTab] = useState('library'),
    [query, setQuery] = useState(''),
    [appInput, setAppInput] = useState('');
  const [message, setMessage] = useState(''),
    [draft, setDraft] = useState(null),
    [basket, setBasket] = useState([]),
    [target, setTarget] = useState(''),
    [label, setLabel] = useState(''),
    [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false),
    [canCancel, setCanCancel] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [reload, setReload] = useState(0);
  const controller = useRef(null),
    epoch = useRef(0),
    pending = useRef(false),
    demoId = useRef(1000),
    review = useRef(null),
    feedback = useRef(null),
    examples = useRef(null);
  useEffect(() => {
    if (draft && !busy) review.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, [draft, busy]);
  useEffect(() => {
    if (error || notice) feedback.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [error, notice]);
  useEffect(() => {
    if (!token || demo) return;
    const abort = new AbortController();
    const timer = setInterval(async () => {
      if (pending.current) return;
      const version = epoch.current;
      try {
        const next = await api('', {
          token,
          signal: abort.signal
        });
        if (!abort.signal.aborted && version === epoch.current) setState(next);
      } catch (e) {
        if (e.status === 401) signOut();
      }
    }, 60000);
    return () => {
      clearInterval(timer);
      abort.abort();
    };
  }, [token, demo, signOut]);
  useEffect(() => {
    document.title = 'AI 내 게임 매니저';
    const e = epoch,
      c = controller;
    return () => {
      e.current++;
      c.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!token && !demo) return;
    const abort = new AbortController();
    const source = demo ? loadDemoCatalog().then(c => createManagerDemo(c.games)) : api('', {
      token,
      signal: abort.signal
    });
    source.then(data => {
      if (!abort.signal.aborted) setState(data);
    }).catch(e => {
      if (e.name !== 'AbortError') {
        setError(e.message);
        if (e.status === 401) signOut();
      }
    });
    return () => abort.abort();
  }, [token, demo, reload, signOut]);
  const owned = state?.owned || [],
    records = state?.records || [],
    catalog = state?.catalog || [];
  const ownedIds = new Set(owned.map(g => g.appId)),
    collections = records.filter(r => r.kind === 'collection'),
    watches = records.filter(r => r.kind === 'watch'),
    notifications = records.filter(r => r.kind === 'notification');
  const unread = notifications.filter(r => !r.data.read).length;
  const matches = query.trim() ? catalog.filter(g => g.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  const cost = selectedCost(basket, owned);
  function cancel() {
    epoch.current++;
    controller.current?.abort();
    pending.current = false;
    setBusy(false);
    setError('요청을 취소했어요. 입력은 그대로 남아 있어요.');
  }
  async function perform(task, cancellable = false) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setCanCancel(cancellable);
    setError('');
    setNotice('');
    const version = ++epoch.current,
      abort = new AbortController();
    controller.current = abort;
    const timer = cancellable ? setTimeout(() => abort.abort(), 110000) : null;
    try {
      await task(abort.signal, version);
    } catch (e) {
      if (version === epoch.current) {
        setError(e.name === 'AbortError' ? '응답이 늦어 요청을 종료했어요. 다시 시도해주세요.' : e.message);
        if (e.status === 401) signOut();
      }
    } finally {
      clearTimeout(timer);
      if (version === epoch.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  async function request(path, options, signal) {
    return api('' + path, {
      token,
      signal,
      ...options
    });
  }
  async function refresh(signal, version) {
    if (demo) return;
    const next = await request('', {}, signal);
    if (version === epoch.current) setState(next);
  }
  function newDemoRecord(kind, data) {
    demoId.current = Math.max(demoId.current, ...records.map(r => r.id)) + 1;
    return {
      id: demoId.current,
      kind,
      data
    };
  }
  async function product(id, signal) {
    if (demo) {
      const g = catalog.find(g => g.appId === id);
      if (!g) throw new Error('데모에서는 표시된 게임을 선택해주세요.');
      return managerDemoProduct(g);
    }
    return request('/products/' + id, {}, signal);
  }
  function add(id, purpose) {
    perform(async (signal, version) => {
      const p = await product(id, signal);
      if (version !== epoch.current) return;
      if (purpose === 'owned') {
        if (ownedIds.has(id)) throw new Error('이미 내 보유 게임에 있어요.');
        if (demo) setState(s => ({
          ...s,
          owned: [...s.owned, {
            appId: id,
            name: p.name,
            minutes: 0,
            source: '데모 샘플'
          }]
        }));else {
          await request('/owned', {
            method: 'POST',
            body: {
              appId: id
            }
          }, signal);
          await refresh(signal, version);
        }
        if (version === epoch.current) setNotice('보유 게임을 추가했어요. 직접 등록한 내용은 Steam 소유 확인과 구분돼요.');
      } else {
        if (basket.some(g => g.appId === id)) throw new Error('이미 구매 상품에 있어요.');
        if (basket.length >= 6) throw new Error('상품은 최대 6개까지 선택할 수 있어요.');
        setBasket(previous => [...previous, p]);
        setNotice('상품을 추가했어요. 가격과 포함할 항목을 확인해주세요.');
      }
    });
  }
  function ask() {
    perform(async (signal, version) => {
      if (!message.trim()) throw new Error('원하는 정리 방식이나 구매 조건을 적어주세요.');
      const mode = tab === 'library' ? 'collection' : 'purchase';
      let result;
      if (demo) {
        if (mode === 'collection') {
          if (!owned.length) throw new Error('보유 게임을 먼저 등록해주세요.');
          result = {
            name: '내 게임 샘플 컬렉션',
            explanation: '데모 초안이에요. 실제 AI에서는 요청과 게임 정보를 함께 분석해 분류해요.',
            appIds: owned.slice(0, 3).map(g => g.appId),
            targetWon: 0
          };
        } else {
          result = {
            name: '샘플 구매 조건',
            explanation: '데모 초안입니다. 관심 상품과 원화 목표 금액을 직접 확인해주세요.',
            appIds: [catalog.find(g => !ownedIds.has(g.appId)).appId],
            targetWon: 15000
          };
        }
      } else result = await request('/draft', {
        method: 'POST',
        body: {
          mode,
          message
        }
      }, signal);
      if (version !== epoch.current) return;
      if (mode === 'collection') setDraft(result);else {
        const products = [];
        for (const id of result.appIds) products.push(await product(id, signal));
        if (version !== epoch.current) return;
        setBasket(products);
        setLabel(result.name);
        setTarget(result.targetWon ? String(result.targetWon) : '');
        setDraft(result);
        setEdit(null);
      }
    }, true);
  }
  function saveCollection() {
    perform(async (signal, version) => {
      if (!draft?.appIds.length) throw new Error('컬렉션에 넣을 게임을 선택해주세요.');
      if (demo) setState(s => ({
        ...s,
        records: [newDemoRecord('collection', draft), ...s.records]
      }));else {
        await request('/collections', {
          method: 'POST',
          body: draft
        }, signal);
        await refresh(signal, version);
      }
      if (version === epoch.current) {
        setDraft(null);
        setNotice(demo ? '샘플 컬렉션을 만들었어요. 새로고침하면 초기화돼요.' : '컬렉션을 저장했어요.');
      }
    });
  }
  function saveWatch() {
    perform(async (signal, version) => {
      const won = parseWon(target);
      if (!basket.length) throw new Error('구매할 상품을 먼저 선택해주세요.');
      if (!label.trim()) throw new Error('구매 대기 이름을 적어주세요.');
      if (basket.every(g => ownedIds.has(g.appId))) throw new Error('선택한 상품을 모두 보유하고 있어요.');
      const ids = new Set([...owned.map(g => g.appId), ...basket.map(g => g.appId)]);
      if (basket.some(g => g.type === 'dlc' && (!g.parentAppId || !ids.has(g.parentAppId)))) throw new Error('DLC에 필요한 본편을 보유 목록이나 구매 상품에 추가해주세요.');
      if (cost === null) throw new Error('가격을 확인할 수 없는 상품은 감시를 시작할 수 없어요.');
      const body = {
        appIds: basket.map(g => g.appId),
        targetWon: won,
        label: label.trim()
      };
      if (demo) {
        const r = edit ? {
          id: edit,
          kind: 'watch'
        } : newDemoRecord('watch', {});
        r.data = {
          ...body,
          enabled: true,
          lastChecked: new Date().toISOString(),
          matched: cost <= won * 100,
          error: '',
          prices: basket,
          totalMinor: cost
        };
        const n = r.data.matched ? newDemoRecord('notification', {
          title: label,
          message: '샘플 알림: 목표 금액 조건을 충족했어요. 실제 가격 감시는 하지 않아요.',
          read: false,
          createdAt: new Date().toISOString(),
          watchId: r.id
        }) : null;
        setState(s => ({
          ...s,
          records: [...(n ? [n] : []), r, ...s.records.filter(x => x.id !== r.id)]
        }));
      } else {
        await request(edit ? '/watches/' + edit : '/watches', {
          method: edit ? 'PUT' : 'POST',
          body
        }, signal);
        await refresh(signal, version);
      }
      if (version === epoch.current) {
        setBasket([]);
        setLabel('');
        setTarget('');
        setDraft(null);
        setEdit(null);
        setNotice(demo ? '샘플 구매 대기를 만들었어요. 실제 알림은 로그인 후 이용해요.' : '구매 조건을 저장했어요. 서버가 실행 중이면 주기적으로 확인해요.');
      }
    });
  }
  function action(record, type) {
    if (type === 'delete' && !window.confirm('이 항목을 삭제할까요? 삭제한 항목은 복원할 수 없어요.')) return;
    perform(async (signal, version) => {
      if (demo) {
        setState(s => applyManagerDemoAction(s, record.id, type));
        setNotice(type === 'check' ? '샘플 가격 확인을 마쳤어요. 실제 조회는 하지 않아요.' : '샘플 항목을 변경했어요.');
        return;
      }
      const route = type === 'delete' ? '/records/' + record.id : type === 'read' ? '/notifications/' + record.id + '/read' : '/watches/' + record.id + (type === 'check' ? '/check' : '');
      await request(route, {
        method: type === 'delete' ? 'DELETE' : type === 'check' ? 'POST' : 'PATCH',
        ...(type === 'pause' ? {
          body: {
            enabled: !record.data.enabled
          }
        } : {})
      }, signal);
      await refresh(signal, version);
      if (version === epoch.current) setNotice(type === 'delete' ? '삭제했어요.' : type === 'check' ? '가격 확인을 마쳤어요.' : '저장했어요.');
    });
  }
  function switchTab(next) {
    setTab(next);
    setDraft(null);
    setError('');
    setNotice('');
    setMessage('');
    setQuery('');
  }
  function showSamples(next) {
    switchTab(next);
    requestAnimationFrame(() => examples.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    }));
  }
  return {
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
    records,
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
  };
}
