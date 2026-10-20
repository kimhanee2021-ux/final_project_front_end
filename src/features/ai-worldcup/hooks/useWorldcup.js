import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth';
import { api } from '../api';
import { makeChoice, validateRound } from '../worldcupModel';
import { demoRound } from '../mocks/worldcupDemo';
import { loadDemoCatalog } from '../../games/aiDemoCatalog';
export function useWorldcup({
  token,
  demo
}) {
  const {
    signOut
  } = useAuth();
  const [catalog, setCatalog] = useState(null),
    [groups, setGroups] = useState([]),
    [rounds, setRounds] = useState(10);
  const [history, setHistory] = useState([]),
    [data, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [reasons, setReasons] = useState([]),
    [note, setNote] = useState(''),
    [session, setSession] = useState(''),
    [view, setView] = useState('setup');
  const [catalogError, setCatalogError] = useState(''),
    [reload, setReload] = useState(0);
  const [lastRequest, setLastRequest] = useState(null);
  const abort = useRef(null),
    epoch = useRef(0),
    pending = useRef(false),
    resultHeading = useRef(null);
  useEffect(() => {
    document.title = 'AI 게임 취향 월드컵';
    const requestEpoch = epoch,
      activeAbort = abort;
    return () => {
      requestEpoch.current++;
      activeAbort.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!token && !demo) return;
    const controller = new AbortController();
    const source = demo ? loadDemoCatalog() : api('/catalog', {
      token,
      signal: controller.signal
    });
    source.then(value => {
      if (!controller.signal.aborted) setCatalog(value);
    }).catch(err => {
      if (err.name !== 'AbortError') {
        setCatalogError(err.message);
        if (err.status === 401) signOut();
      }
    });
    return () => controller.abort();
  }, [token, reload, signOut, demo]);
  useEffect(() => {
    if (data?.complete) resultHeading.current?.focus();
  }, [data]);
  const filtered = catalog?.games.filter(g => !groups.length || g.groupIds.some(id => groups.includes(id))) || [];
  const parents = [...new Set(catalog?.groups.map(g => g.parent) || [])];
  function toggle(ids) {
    setGroups(previous => ids.every(id => previous.includes(id)) ? previous.filter(id => !ids.includes(id)) : [...new Set([...previous, ...ids])]);
  }
  function stop() {
    epoch.current++;
    abort.current?.abort();
    pending.current = false;
    setBusy(false);
  }
  function reset() {
    stop();
    setData(null);
    setHistory([]);
    setError('');
    setReasons([]);
    setNote('');
    setView('setup');
    setLastRequest(null);
  }
  async function request(payload, choices) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setLastRequest({
      payload,
      choices
    });
    const version = ++epoch.current,
      controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 70000);
    try {
      const response = demo ? demoRound(catalog, payload) : await api('/next', {
        token,
        method: 'POST',
        body: payload,
        signal: controller.signal
      });
      if (version !== epoch.current) return;
      if (choices.length === payload.rounds) {
        if (!response.complete || !response.summary || !Array.isArray(response.favorites)) throw new Error('취향 결과를 확인하지 못했습니다. 다시 시도해주세요.');
      } else {
        if (response.complete) throw new Error('진행 정보를 확인하지 못했습니다.');
        validateRound(response, choices);
      }
      setData(response);
      setHistory(choices);
      setView(response.complete ? 'result' : 'play');
      setReasons([]);
      setNote('');
      setLastRequest(null);
    } catch (err) {
      if (version !== epoch.current) return;
      setError(err.name === 'AbortError' ? 'AI 응답이 늦어 요청을 종료했어요. 다시 시도해주세요.' : err.message);
      if (err.status === 401) signOut();
    } finally {
      clearTimeout(timer);
      if (version === epoch.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  function start() {
    const id = crypto.randomUUID();
    setSession(id);
    request({
      sessionId: id,
      rounds,
      groups,
      history: []
    }, []);
  }
  function choose(verdict) {
    if (!data?.pair || pending.current) return;
    const choices = [...history, makeChoice(data.pair, verdict, reasons, note)];
    request({
      sessionId: session,
      rounds,
      groups,
      history: choices.map(({
        leftId,
        rightId,
        verdict,
        reasons,
        note
      }) => ({
        leftId,
        rightId,
        verdict,
        reasons,
        note
      }))
    }, choices);
  }
  return {
    catalog,
    groups,
    setGroups,
    rounds,
    setRounds,
    history,
    data,
    busy,
    error,
    setError,
    reasons,
    setReasons,
    note,
    setNote,
    view,
    catalogError,
    setCatalogError,
    setReload,
    lastRequest,
    resultHeading,
    filtered,
    parents,
    toggle,
    stop,
    reset,
    request,
    start,
    choose
  };
}
