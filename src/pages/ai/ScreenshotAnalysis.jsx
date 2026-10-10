import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { samples, validateUpload } from './screenshotSamples'
import './ai.css'
import './screenshot.css'

const types = { item: '아이템 화면', play: '플레이 상황', error: '오류 화면' }

function SampleScreen({ sample }) {
  return <div className={`shot-scene ${sample.type}`} role="img" aria-label={`${sample.game} 가상 ${types[sample.type]}: ${sample.screen.join(', ')}`}>
    <span className="shot-scene-label">가상 화면 · UI 검증용</span>
    <div className="shot-scene-symbol" aria-hidden="true">{sample.type === 'item' ? '✦' : sample.type === 'play' ? '◈' : '!'}</div>
    <div className="shot-scene-panel">{sample.screen.map((line, i) => i === 0 ? <strong key={line}>{line}</strong> : <p key={line}>{line}</p>)}</div>
    <small>실제 게임 스크린샷이 아닙니다</small>
  </div>
}

export default function ScreenshotAnalysis() {
  const [mode, setMode] = useState('sample')
  const [type, setType] = useState('item')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(samples[0])
  const [state, setState] = useState('ready')
  const [error, setError] = useState('')
  const [upload, setUpload] = useState(null)
  const timer = useRef(null)
  const imageUrl = useRef(null)
  const revision = useRef({ value: 0 })
  const input = useRef(null)
  useEffect(() => {
    const guard = revision.current
    document.title = '스크린샷 분석 | GameSense'
    return () => { clearTimeout(timer.current); guard.value++; if (imageUrl.current) URL.revokeObjectURL(imageUrl.current) }
  }, [])

  function reset() { clearTimeout(timer.current); revision.current.value++; setState('ready'); setError('') }
  function choose(sample) { reset(); setSelected(sample) }
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
      setUpload({ url, name: file.name, width: image.naturalWidth, height: image.naturalHeight })
    } catch {
      if (id !== revision.current.value) return
      setError('이미지를 열 수 없어요. 정상적인 이미지 파일을 다시 선택해주세요.'); setState('failed')
      URL.revokeObjectURL(url); imageUrl.current = null
    }
  }
  const filtered = samples.filter(s => s.type === type && `${s.game} ${s.title} ${s.genre}`.toLowerCase().includes(query.toLowerCase().trim()))

  return <section className="ai-page shot-page">
    <header className="ai-header"><div><span className="ai-kicker">SEE · UNDERSTAND · PLAY</span><h1>스크린샷 분석</h1><p>아이템, 플레이 상황, 오류 메시지를 살펴봐요.</p></div><Link to="/ai-games">AI 게임 추천 ↗</Link></header>
    <div className="ai-tabs" role="group" aria-label="분석 방식">
      <button aria-pressed={mode === 'sample'} onClick={() => changeMode('sample')}>샘플 분석 · 30개</button>
      <button aria-pressed={mode === 'upload'} onClick={() => changeMode('upload')}>내 이미지 업로드</button>
    </div>
    {mode === 'sample' ? <>
      <p className="shot-notice"><strong>샘플 분석</strong> 미리 작성한 가상 화면과 답변입니다. 실제 AI 분석이나 공식 게임 능력치·공략이 아닙니다.</p>
      <div className="shot-filters"><div role="group" aria-label="샘플 유형">{Object.entries(types).map(([key, label]) => <button key={key} aria-pressed={type === key} onClick={() => { setType(key); choose(samples.find(s => s.type === key)) }}>{label} · 10</button>)}</div><label>게임·샘플 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="게임 이름 또는 상황" /></label></div>
      <div className="shot-layout"><div className="shot-list" aria-label="샘플 목록">{filtered.map(sample => <button key={sample.id} aria-pressed={selected.id === sample.id} onClick={() => choose(sample)}><small>{sample.game} · {sample.genre}</small><strong>{sample.title}</strong><span>샘플 분석</span></button>)}{!filtered.length && <p>검색 결과가 없어요. 다른 검색어를 입력해주세요.</p>}</div>
        <div className="shot-workspace"><span className="shot-badge">샘플 분석</span><h2>{selected.game} · {selected.title}</h2><SampleScreen sample={selected}/>
          <div className="shot-actions"><button className="ai-primary" disabled={state === 'busy'} onClick={() => run()}>샘플 분석 보기</button><button disabled={state === 'busy'} onClick={() => run(true)}>실패 화면 확인</button></div>
          <div aria-live="polite" aria-busy={state === 'busy'}>
            {state === 'ready' && <p className="shot-hint">샘플 분석 보기를 누르면 분석 중 화면과 예시 결과를 확인할 수 있어요.</p>}
            {state === 'busy' && <div className="shot-status" role="status"><span className="shot-spinner"/>샘플 분석 화면을 준비하고 있어요…<button onClick={reset}>취소</button></div>}
            {state === 'result' && <article className="shot-result"><span className="shot-badge">샘플 분석 · 미리 작성된 답변</span><h3>{selected.type === 'error' ? '오류 해석' : selected.type === 'item' ? '아이템 설명' : '현재 상황'}</h3><p>{selected.summary}</p><ul>{selected.details.map(line => <li key={line}>{line}</li>)}</ul><h3>{selected.type === 'error' ? '해결 방법 예시' : selected.type === 'item' ? '활용법 예시' : '다음 행동 제안'}</h3><ol>{selected.actions.map(line => <li key={line}>{line}</li>)}</ol></article>}
          </div>
        </div>
      </div>
    </> : <div className="shot-upload">
      <p className="shot-notice"><strong>내 이미지 업로드</strong> 선택한 이미지는 이 브라우저에서만 미리 볼 수 있어요. 실제 이미지 분석 서버는 아직 연결되지 않았습니다.</p>
      <label className="shot-drop">게임 이미지를 선택해주세요<span>JPG · PNG · WEBP / 최대 10MB</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { loadFile(e.target.files?.[0]); e.target.value = '' }}/></label>
      {upload && <div className="shot-upload-preview"><img src={upload.url} alt="사용자가 업로드한 게임 화면"/><p>{upload.name} · {upload.width} × {upload.height}</p><button onClick={() => { loadFile(null); input.current.value = '' }}>이미지 지우기</button></div>}
      <button className="ai-primary" disabled>실제 이미지 분석 · 연결 준비 중</button>
      <p className="shot-hint">업로드한 이미지에는 샘플 답변을 표시하지 않습니다.</p>
    </div>}
    {state === 'failed' && <div className="ai-error" role="alert"><p>{error}</p><button onClick={mode === 'sample' ? () => run() : () => input.current.click()}>{mode === 'sample' ? '샘플 다시 시도' : '다른 이미지 선택'}</button></div>}
  </section>
}
