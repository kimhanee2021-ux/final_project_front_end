import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { generateBbsSpeech } from '../api'
import { BriefingPlayer, audioTime } from '../model/briefingPlayer'
import { BbsAudioFocus, useBbsAudioFocus } from '../hooks/bbsAudioFocus'
import '../styles/briefingAudio.css'
import { VoiceBriefingContext } from '../hooks/voiceBriefingContext'

export default function BbsBriefingAudio({ path, briefing, appId, articleId }) {
  const command = useContext(VoiceBriefingContext)
  const player = useRef(null)
  const [state, setState] = useState({ phase: 'IDLE', elapsed: 0, duration: 0, error: '' })
  const stop = useCallback(() => player.current?.stop(), [])
  const focus = useContext(BbsAudioFocus)
  const interrupt = useCallback(owner => {
    if (owner === 'microphone' || owner === 'command') player.current?.pause()
    else player.current?.stop()
  }, [])
  const claim = useBbsAudioFocus('briefing', interrupt)
  useEffect(() => focus?.registerPlayback({
    pause: () => {
      const instance = player.current
      if (!instance || !['PLAYING', 'PAUSED', 'LOADING'].includes(instance.state.phase)) return false
      instance.pause()
      return true
    },
    resume: () => player.current?.resume() ?? false,
    stop: () => { player.current?.stop(); return true },
  }), [focus])
  useEffect(() => {
    const instance = new BriefingPlayer({
      fetchAudio: signal => generateBbsSpeech(path, briefing.sourceHash, briefing.generatedAt, signal),
      onState: setState,
    })
    player.current = instance
    const visibility = () => { if (document.hidden) instance.stop() }
    const keyboard = event => { if (event.key === 'Escape' && instance.state.phase !== 'PAUSED') instance.stop() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('keydown', keyboard)
    return () => {
      instance.dispose()
      if (player.current === instance) player.current = null
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('keydown', keyboard)
    }
  }, [path, briefing.sourceHash, briefing.generatedAt])
  const takePlayback = command?.takePlayback
  const requestId = command?.state.requestId
  const commandPhase = command?.state.phase
  useEffect(() => {
    let mounted = true
    // Deferring the handoff lets StrictMode finish its setup/cleanup cycle before consuming it.
    queueMicrotask(() => {
      if (mounted && commandPhase === 'READY' && takePlayback?.(appId, articleId, briefing.sourceHash, briefing.generatedAt)) {
        claim()
        void player.current?.play()
      }
    })
    return () => { mounted = false }
  }, [takePlayback, requestId, commandPhase, appId, articleId, briefing.sourceHash, briefing.generatedAt, claim])
  const playing = state.phase === 'PLAYING'
  const loading = state.phase === 'LOADING'
  const active = playing || loading || state.phase === 'PAUSED'
  return <section className={`bbs-briefing-audio${playing ? ' is-playing' : ''}`} aria-label="음성 브리핑">
    <div className="bbs-audio-heading"><strong>차분하게 듣는 게임 소식</strong><span>AI가 만든 음성</span></div>
    <div className="bbs-audio-controls">
      <button type="button" className="bbs-button bbs-button-primary" disabled={loading}
        onClick={() => { if (playing) player.current?.pause(); else { claim(); void player.current?.play() } }}>
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        {loading ? '음성 준비 중…' : playing ? '일시정지' : state.phase === 'PAUSED' ? '계속 듣기' : '브리핑 듣기'}
      </button>
      <button type="button" className="bbs-button bbs-audio-stop" disabled={!active} onClick={stop}>정지</button>
      <span className="bbs-audio-time" aria-label="재생 시간">{audioTime(state.elapsed)} / {state.duration ? audioTime(state.duration) : '—:—'}</span>
    </div>
    <progress className="bbs-audio-progress" aria-label="브리핑 재생 진행" max={state.duration || 1} value={state.elapsed} />
    <p className="bbs-audio-status" role="status">{loading ? '차분한 목소리로 준비하고 있어요. 정지를 누르면 취소돼요.'
      : playing ? '선택한 소식의 낭독 대본을 읽고 있어요.' : state.phase === 'PAUSED' ? '잠시 멈췄어요. 계속 듣기를 누르면 이어서 들을 수 있어요.'
      : '다른 소식을 선택하면 재생이 멈춰요.'}</p>
    {state.error && <p className="bbs-audio-error" role="alert">{state.error}</p>}
  </section>
}
