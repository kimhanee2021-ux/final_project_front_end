import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { samples, validateUpload } from './screenshotSamples'
import { api } from './aiApi'
import { useAuth } from '../../contexts/AuthContext'
import { authLink, readAccessToken } from '../../features/auth/authSession'
import { browserStores } from '../../utils/apiClient'
import './ai.css'
import './screenshot.css'

const types = { item: '아이템 화면', play: '플레이 상황', error: '오류 화면' }

function SampleScreen({ sample }) {
  const [failed, setFailed] = useState(false)
  if (!sample.image) return <div className="shot-text-example"><strong>오류 문구 예시</strong><p>{sample.game} · {sample.title}</p><small>실제 오류 스크린샷은 아직 수집되지 않았습니다. 이 예시는 문구와 해석만 확인합니다.</small></div>
  return <figure className="shot-real-image">
    {failed ? <p role="alert">이미지를 불러오지 못했습니다. 출처에서 원본을 확인해주세요.</p> : <img src={sample.image} alt={`${sample.game} 실제 ${sample.type === 'error' ? '오류 화면' : '게임 스크린샷'} · ${sample.title}`} onError={() => setFailed(true)}/>}
    <figcaption>실제 {sample.type === 'error' ? '오류 화면' : '게임 스크린샷'} · <a href={sample.sourceUrl} target="_blank" rel="noreferrer">{sample.platform || 'Steam'} 원본 출처 ↗</a></figcaption>
  </figure>
}

export default function ScreenshotAnalysis() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const token = isAuthenticated ? readAccessToken(browserStores()) : ''
  return <ScreenshotWorkspace key={token || 'guest'} token={token} loading={isAuthLoading}/>
}

function ScreenshotWorkspace({ token, loading }) {
  const { signOut } = useAuth()
  const [mode, setMode] = useState('sample')
  const [type, setType] = useState('play')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(samples[0].id)
  const selected = samples.find(sample => sample.id === selectedId) || samples[0]
  const [state, setState] = useState('ready')
  const [error, setError] = useState('')
  const [upload, setUpload] = useState(null)
  const [uploadType, setUploadType] = useState('play')
  const [game, setGame] = useState('')
  const [result, setResult] = useState(null)
  const request = useRef(null)
  const requestTimer = useRef(null)
  const timer = useRef(null)
  const imageUrl = useRef(null)
  const revision = useRef({ value: 0 })
  const input = useRef(null)
  useEffect(() => {
    const guard = revision.current
    document.title = 'AI 스크린샷 분석 | GameSense'
    return () => { clearTimeout(timer.current); clearTimeout(requestTimer.current); request.current?.abort(); guard.value++; if (imageUrl.current) URL.revokeObjectURL(imageUrl.current) }
  }, [])

  function reset() { clearTimeout(timer.current); clearTimeout(requestTimer.current); request.current?.abort(); request.current = null; revision.current.value++; setState('ready'); setError(''); setResult(null) }
  function choose(sample) { reset(); setSelectedId(sample.id) }
  function changeMode(next) { reset(); setMode(next) }
  function run(failure = false) {
    reset(); setState('busy')
    timer.current = setTimeout(() => {
      setState(failure ? 'failed' : 'result')
      if (failure) setError('샘플 실패 화면입니다. 분석을 완료하지 못했어요. 다시 시도해주세요.')
    }, 1000)
  }
  async function loadFile(file) {
    reset(); setUpload(null)
    if (imageUrl.current) { URL.revokeObjectURL(imageUrl.current); imageUrl.current = null }
    if (!file) return
    const problem = validateUpload(file)
    if (problem) { setError(problem); setState('failed'); return }
    const id = revision.current.value
    const url = URL.createObjectURL(file)
    imageUrl.current = url
    const image = new Image()
    image.src = url
    try {
      await image.decode()
      if (id !== revision.current.value) return
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('empty image')
      if (image.naturalWidth * image.naturalHeight > 24_000_000) {
        setError('2400만 화소 이하의 이미지를 선택해주세요.'); setState('failed'); URL.revokeObjectURL(url); imageUrl.current = null; return
      }
      setUpload({ file, url, name: file.name, width: image.naturalWidth, height: image.naturalHeight })
    } catch {
      if (id !== revision.current.value) return
      setError('이미지를 열 수 없어요. 정상적인 이미지 파일을 다시 선택해주세요.'); setState('failed')
      URL.revokeObjectURL(url); imageUrl.current = null
    }
  }
  async function analyze() {
    if (!upload || !token || request.current) return
    reset(); setState('busy')
    const controller = new AbortController()
    request.current = controller
    let timedOut = false
    requestTimer.current = setTimeout(() => { timedOut = true; controller.abort() }, 100000)
    const body = new FormData()
    body.append('image', upload.file); body.append('type', uploadType); body.append('game', game.trim())
    try {
      const answer = await api('/ai/screenshots', { token, method: 'POST', body, signal: controller.signal })
      if (request.current !== controller) return
      if (answer.isMock !== false || !answer.summary || !Array.isArray(answer.details) || !Array.isArray(answer.actions)) throw new Error('분석 결과를 확인하지 못했어요. 다시 시도해주세요.')
      setResult(answer); setState('result')
    } catch (err) {
      if (request.current !== controller) return
      if (err.status === 401) { signOut(); return }
      setState('failed'); setError(timedOut ? '분석 시간이 초과됐어요. 잠시 후 다시 시도해주세요.' : err.message)
    } finally {
      if (request.current === controller) { clearTimeout(requestTimer.current); request.current = null }
    }
  }
  const filtered = samples.filter(s => s.type === type && `${s.game} ${s.title} ${s.genre}`.toLowerCase().includes(query.toLowerCase().trim()))

  return <section className="ai-page shot-page">
    <header className="ai-header"><div><span className="ai-kicker">SEE · UNDERSTAND · PLAY</span><h1>AI 스크린샷 분석</h1><p>아이템, 플레이 상황, 오류 메시지를 살펴봐요.</p></div><Link to="/ai-games">AI 게임 추천 ↗</Link></header>
    <div className="ai-tabs" role="group" aria-label="분석 방식">
      <button aria-pressed={mode === 'sample'} onClick={() => changeMode('sample')}>샘플 분석 · 30개</button>
      <button aria-pressed={mode === 'upload'} onClick={() => changeMode('upload')}>내 이미지 업로드</button>
    </div>
    {mode === 'sample' ? <>
      <p className="shot-notice"><strong>샘플 분석</strong> 실제 게임·플랫폼 오류 화면에 미리 작성한 설명을 붙인 예시입니다. 실제 Gemini 분석은 내 이미지 업로드에서 이용하세요.</p>
      <div className="shot-filters"><div role="group" aria-label="샘플 유형">{Object.entries(types).map(([key, label]) => <button key={key} aria-pressed={type === key} onClick={() => { setType(key); choose(samples.find(s => s.type === key)) }}>{label} · 10</button>)}</div><label>게임·샘플 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="게임 이름 또는 상황" /></label></div>
      <div className="shot-layout"><div className="shot-list" aria-label="샘플 목록">{filtered.map(sample => <button key={sample.id} aria-pressed={selected.id === sample.id} onClick={() => choose(sample)}><small>{sample.game} · {sample.genre}</small><strong>{sample.title}</strong><span>샘플 분석</span></button>)}{!filtered.length && <p>검색 결과가 없어요. 다른 검색어를 입력해주세요.</p>}</div>
        <div className="shot-workspace"><span className="shot-badge">샘플 분석{!selected.image && ' · 문구 예시'}</span><h2>{selected.game} · {selected.title}</h2><SampleScreen key={selected.id} sample={selected}/>
          <div className="shot-actions"><button className="ai-primary" disabled={state === 'busy'} onClick={() => run()}>샘플 분석 보기</button><button disabled={state === 'busy'} onClick={() => run(true)}>실패 화면 확인</button></div>
          <div aria-live="polite" aria-busy={state === 'busy'}>
            {state === 'ready' && <p className="shot-hint">샘플 분석 보기를 누르면 분석 중 화면과 예시 결과를 확인할 수 있어요.</p>}
            {state === 'busy' && <div className="shot-status" role="status"><span className="shot-spinner"/>샘플 분석 화면을 준비하고 있어요…<button onClick={reset}>취소</button></div>}
            {state === 'result' && <article className="shot-result"><span className="shot-badge">샘플 분석 · 미리 작성된 답변</span><h3>{selected.type === 'error' ? '오류 해석' : selected.type === 'item' ? '아이템 설명' : '현재 상황'}</h3><p>{selected.summary}</p><ul>{selected.details.map(line => <li key={line}>{line}</li>)}</ul><h3>{selected.type === 'error' ? '해결 방법 예시' : selected.type === 'item' ? '활용법 예시' : '다음 행동 제안'}</h3><ol>{selected.actions.map(line => <li key={line}>{line}</li>)}</ol></article>}
          </div>
        </div>
      </div>
    </> : <div className="shot-upload">
      <p className="shot-notice"><strong>실제 AI 분석</strong> 분석 시작을 누르면 이미지가 Gemini로 전송됩니다. 계정 정보나 개인정보가 보이지 않는 게임 화면을 선택해주세요.</p>
      {!token && <p className="shot-hint">{loading ? '로그인 확인 중…' : <>실제 이미지 분석은 회원 로그인이 필요해요. <Link to={authLink('login','/ai-screenshots')}>로그인하기 ↗</Link></>}</p>}
      <label className="shot-drop">게임 이미지를 선택해주세요<span>JPG · PNG · WEBP / 최대 10MB</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { loadFile(e.target.files?.[0]); e.target.value = '' }}/></label>
      {upload && <div className="shot-upload-preview"><img src={upload.url} alt="사용자가 업로드한 게임 화면"/><p>{upload.name} · {upload.width} × {upload.height}</p><button onClick={() => { loadFile(null); input.current.value = '' }}>이미지 지우기</button></div>}
      <div className="shot-filters"><label>분석할 내용<select value={uploadType} disabled={state === 'busy'} onChange={e => { reset(); setUploadType(e.target.value) }}>{Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>게임 이름 (선택)<input value={game} maxLength={100} disabled={state === 'busy'} onChange={e => { reset(); setGame(e.target.value) }} placeholder="알고 있다면 게임 이름을 알려주세요"/></label></div>
      <button className="ai-primary" disabled={!upload || !token || state === 'busy'} onClick={analyze}>실제 AI 분석 시작</button>
      <p className="shot-hint">업로드한 이미지에는 샘플 답변을 표시하지 않습니다.</p>
      <div aria-live="polite" aria-busy={state === 'busy'}>
        {state === 'busy' && <div className="shot-status" role="status"><span className="shot-spinner"/>Gemini가 이미지를 분석하고 있어요…<button onClick={reset}>분석 취소</button></div>}
        {state === 'result' && result && <article className="shot-result"><span className="shot-badge">실제 AI 분석 · Gemini</span><h3>{uploadType === 'item' ? '아이템 설명' : uploadType === 'error' ? '오류 해석' : '현재 상황'}</h3><p>{result.summary}</p><ul>{result.details.map((line,i) => <li key={i}>{line}</li>)}</ul><h3>{uploadType === 'error' ? '해결 방법 안내' : uploadType === 'item' ? '활용법' : '다음 행동 제안'}</h3><ol>{result.actions.map((line,i) => <li key={i}>{line}</li>)}</ol>{result.uncertainty && <p className="shot-hint">확인이 필요한 부분: {result.uncertainty}</p>}<p className="shot-hint">AI가 이미지의 글자나 상황을 잘못 읽을 수 있어요. 게임 안의 설명과 공식 지원을 함께 확인해주세요.</p></article>}
      </div>
    </div>}
    {state === 'failed' && <div className="ai-error" role="alert"><p>{error}</p><button onClick={mode === 'sample' ? () => run() : upload && token ? analyze : () => input.current.click()}>{mode === 'sample' ? '샘플 다시 시도' : upload && token ? '분석 다시 시도' : '다른 이미지 선택'}</button></div>}
  </section>
}
