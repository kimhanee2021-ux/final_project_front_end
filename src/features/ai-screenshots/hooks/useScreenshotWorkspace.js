import { validateUpload } from '../uploadModel';
import { useEffect, useRef, useState } from 'react';
import { samples } from '../mocks/screenshotSamples';
import { api } from '../api';
import { useAuth } from '@/features/auth';
export function useScreenshotWorkspace({
  token
}) {
  const {
    signOut
  } = useAuth();
  const [mode, setMode] = useState('sample');
  const [type, setType] = useState('play');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(samples[0].id);
  const selected = samples.find(sample => sample.id === selectedId) || samples[0];
  const [state, setState] = useState('ready');
  const [error, setError] = useState('');
  const [upload, setUpload] = useState(null);
  const [uploadType, setUploadType] = useState('play');
  const [game, setGame] = useState('');
  const [result, setResult] = useState(null);
  const request = useRef(null);
  const requestTimer = useRef(null);
  const timer = useRef(null);
  const imageUrl = useRef(null);
  const revision = useRef({
    value: 0
  });
  const input = useRef(null);
  useEffect(() => {
    const guard = revision.current;
    document.title = 'AI 스크린샷 분석 | GameSense';
    return () => {
      clearTimeout(timer.current);
      clearTimeout(requestTimer.current);
      request.current?.abort();
      guard.value++;
      if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    };
  }, []);
  function reset() {
    clearTimeout(timer.current);
    clearTimeout(requestTimer.current);
    request.current?.abort();
    request.current = null;
    revision.current.value++;
    setState('ready');
    setError('');
    setResult(null);
  }
  function choose(sample) {
    reset();
    setSelectedId(sample.id);
  }
  function changeMode(next) {
    reset();
    setMode(next);
  }
  function run(failure = false) {
    reset();
    setState('busy');
    timer.current = setTimeout(() => {
      setState(failure ? 'failed' : 'result');
      if (failure) setError('샘플 실패 화면입니다. 분석을 완료하지 못했어요. 다시 시도해주세요.');
    }, 1000);
  }
  async function loadFile(file) {
    reset();
    setUpload(null);
    if (imageUrl.current) {
      URL.revokeObjectURL(imageUrl.current);
      imageUrl.current = null;
    }
    if (!file) return;
    const problem = validateUpload(file);
    if (problem) {
      setError(problem);
      setState('failed');
      return;
    }
    const id = revision.current.value;
    const url = URL.createObjectURL(file);
    imageUrl.current = url;
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
      if (id !== revision.current.value) return;
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('empty image');
      if (image.naturalWidth * image.naturalHeight > 24_000_000) {
        setError('2400만 화소 이하의 이미지를 선택해주세요.');
        setState('failed');
        URL.revokeObjectURL(url);
        imageUrl.current = null;
        return;
      }
      setUpload({
        file,
        url,
        name: file.name,
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    } catch {
      if (id !== revision.current.value) return;
      setError('이미지를 열 수 없어요. 정상적인 이미지 파일을 다시 선택해주세요.');
      setState('failed');
      URL.revokeObjectURL(url);
      imageUrl.current = null;
    }
  }
  async function analyze() {
    if (!upload || !token || request.current) return;
    reset();
    setState('busy');
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    requestTimer.current = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 100000);
    const body = new FormData();
    body.append('image', upload.file);
    body.append('type', uploadType);
    body.append('game', game.trim());
    try {
      const answer = await api('/screenshots', {
        token,
        method: 'POST',
        body,
        signal: controller.signal
      });
      if (request.current !== controller) return;
      if (answer.isMock !== false || !answer.summary || !Array.isArray(answer.details) || !Array.isArray(answer.actions)) throw new Error('분석 결과를 확인하지 못했어요. 다시 시도해주세요.');
      setResult(answer);
      setState('result');
    } catch (err) {
      if (request.current !== controller) return;
      if (err.status === 401) {
        signOut();
        return;
      }
      setState('failed');
      setError(timedOut ? '분석 시간이 초과됐어요. 잠시 후 다시 시도해주세요.' : err.message);
    } finally {
      if (request.current === controller) {
        clearTimeout(requestTimer.current);
        request.current = null;
      }
    }
  }
  const filtered = samples.filter(s => s.type === type && `${s.game} ${s.title} ${s.genre}`.toLowerCase().includes(query.toLowerCase().trim()));
  return {
    mode,
    type,
    setType,
    query,
    setQuery,
    selected,
    state,
    error,
    upload,
    uploadType,
    setUploadType,
    game,
    setGame,
    result,
    input,
    reset,
    choose,
    changeMode,
    run,
    loadFile,
    analyze,
    filtered
  };
}
