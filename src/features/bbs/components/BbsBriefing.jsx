import { useContext, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { readBbsBriefing, generateBbsBriefing } from '../api'
import { briefingPath } from '../model/briefing'
import '../styles/briefing.css'
import BbsBriefingAudio from './BbsBriefingAudio'
import { VoiceBriefingContext } from '../hooks/voiceBriefingContext'

// Parent keys this component by game, article and source hash, so late replies cannot cross articles.
export default function BbsBriefing({ appId, article }) {
  const path = briefingPath(appId, article)
  const [storedState, setState] = useState({ status: path ? 'LOADING' : 'UNAVAILABLE', briefing: null })
  const command = useContext(VoiceBriefingContext)
  const target = command?.state.target
  const owns = target?.appId === appId && target.article.id === article.id && target.article.sourceHash === article.sourceHash
  const incoming = owns && command.state.phase === 'READY' ? command.state.briefing : null
  // Retain the completed result when the voice request banner is later dismissed.
  if (incoming && storedState.briefing !== incoming) setState({ status: 'READY', briefing: incoming })
  const state = incoming ? { status: 'READY', briefing: incoming }
    : owns && command.state.phase === 'SUMMARY' ? { status: 'GENERATING', briefing: null } : storedState
  const [error, setError] = useState(null)
  const request = useRef(null)

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    request.current = controller
    readBbsBriefing(path, article.sourceHash, controller.signal).then(
      data => { if (!controller.signal.aborted) setState(data) },
      err => {
        if (!controller.signal.aborted) {
          setState({ status: 'ERROR', briefing: null })
          setError(getErrorMessage(err, '저장된 요약을 불러오지 못했어요. 다시 확인해 주세요.'))
        }
      },
    )
    return () => { controller.abort(); request.current?.abort() }
  }, [path, article.sourceHash])

  useEffect(() => {
    // A delayed initial EMPTY reply must not replace the voice flow's newly saved result.
    if (incoming) request.current?.abort()
  }, [incoming])

  const run = async generate => {
    if (!path || ['GENERATING', 'LOADING'].includes(state.status)) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setError(null)
    setState({ status: generate ? 'GENERATING' : 'LOADING', briefing: null })
    try {
      const action = generate ? generateBbsBriefing : readBbsBriefing
      const data = await action(path, article.sourceHash, controller.signal)
      if (!controller.signal.aborted) setState(data)
    } catch (err) {
      if (!controller.signal.aborted) {
        setState({ status: 'ERROR', briefing: null })
        setError(getErrorMessage(err, '요약을 만들지 못했어요. 저장 결과를 확인한 뒤 다시 시도해 주세요.'))
      }
    }
  }
  const ready = state.status === 'READY'
  const busy = ['LOADING', 'GENERATING'].includes(state.status)
  return <section className="bbs-briefing" aria-label="한국어 AI 요약" aria-busy={busy}>
    <div className="bbs-briefing-heading"><span>한국어 AI 요약</span>{ready && <span className="bbs-briefing-saved">저장됨</span>}</div>
    {ready ? <>
      <h4>{state.briefing.titleKo}</h4>
      <ol className="bbs-briefing-points" aria-label="핵심 요약 3개">{state.briefing.points.map((point, index) => <li key={index}>{point}</li>)}</ol>
      <details className="bbs-briefing-script"><summary>낭독 대본 보기 <span>약 {state.briefing.estimatedSeconds}초 분량</span></summary>
        <p>{state.briefing.narrationScript}</p></details>
      <p className="bbs-briefing-note">공식 원문을 바탕으로 AI가 정리했어요. 자세한 수치와 조건은 원문도 확인해 주세요.</p>
      <BbsBriefingAudio key={state.briefing.generatedAt} path={path} briefing={state.briefing} appId={appId} articleId={article.id} />
    </> : <>
      {busy && <p role="status">{state.status === 'GENERATING' ? '핵심 3가지와 차분한 낭독 대본을 만들고 있어요…' : '저장된 요약을 확인하고 있어요…'}</p>}
      {state.status === 'UNAVAILABLE' && <p>한국어 요약 기능을 준비 중이에요. 아래 공식 원문을 먼저 확인해 주세요.</p>}
      {['EMPTY', 'STALE'].includes(state.status) && <>
        <p>{state.status === 'STALE' ? '이 소식에 맞는 최신 요약이 필요해요.' : '이 소식의 핵심 3가지와 30~60초 분량의 낭독 대본을 만들어 드려요.'}</p>
        <button type="button" className="bbs-button bbs-button-primary" onClick={() => run(true)}>한국어 요약 만들기</button>
      </>}
      {state.status === 'PROCESSING' && <><p role="status">이 소식의 요약을 만들고 있어요. 잠시 후 결과를 확인해 주세요.</p>
        <button type="button" className="bbs-text-button" onClick={() => run(false)}>저장 결과 확인</button></>}
      {error && <><p role="alert">{error}</p><button type="button" className="bbs-text-button" onClick={() => run(false)}>저장 결과 다시 확인</button></>}
    </>}
  </section>
}
