import { useEffect, useRef, useState } from 'react'
import NeonWaveCanvas from './NeonWaveCanvas'
import { useVoiceNewsIntent } from '../hooks/useVoiceNewsIntent'
import { useNewsSpeech } from '../hooks/useNewsSpeech'
import { usePressToTalk } from '../hooks/usePressToTalk'
import { newsSearch } from '../model/newsQuery'
import { categoryPrompt, storedBriefingScript } from '../model/voiceNewsIntent'
import '../styles/newsWave.css'

export default function VoiceNewsControls({ query, result, flow, onSelect, onSearch, onReset, cancelRef, conversationRef }) {
  const pulseEnergyRef = useRef(0)
  const searchCancelRef = useRef(null)
  const handledFlow = useRef(null)
  const currentFlow = useRef(flow)
  const [mode, setMode] = useState(query.appId ? 'CATEGORY' : 'GAME')
  const [notice, setNotice] = useState('')
  const [stoppedFlow, setStoppedFlow] = useState(null)
  const speech = useNewsSpeech()
  const { say, stop: stopSpeech, cancel: cancelSpeech, replay } = speech

  const voice = useVoiceNewsIntent(query, flow, intent => {
    setNotice('')
    if (intent.action === 'SEARCH') { setMode('CATEGORY'); onSearch(intent); return }
    if (intent.action === 'CLARIFY' && intent.awaiting === 'CATEGORY' && intent.appId) {
      setMode('CATEGORY'); onSelect(intent); return
    }
    if (intent.action === 'RESET') { onReset(); return }
    if (intent.action === 'REPLAY') {
      if (speech.canReplay) replay()
      else setNotice('다시 들을 요약이 없어요. 먼저 게임과 소식 분류를 선택해 주세요.')
      return
    }
    if (intent.action === 'STOP') {
      handledFlow.current = flow?.id; setStoppedFlow(flow?.id); stopSpeech()
      setNotice('음성 듣기와 재생을 중지했어요.'); return
    }
    if (['CLARIFY', 'CHOOSE_GAME', 'CHANGE_GAME'].includes(intent.action)) setMode('GAME')
    if (intent.action === 'CHANGE_GAME') stopSpeech(true)
    setNotice(intent.message)
    say(intent.message)
  }, searchCancelRef, conversationRef)
  const loadingVoiceResult = flow?.mode === 'READ' && result.loading && stoppedFlow !== flow.id
  const busy = voice.phase === 'LISTENING' || voice.phase === 'RESOLVING'
    || speech.status === 'SPEAKING' || speech.status === 'QUEUED' || loadingVoiceResult
  const { holding, cancelHold, holdHandlers } = usePressToTalk(() => {
    if (!busy) listen(mode)
  }, () => {
    pulseEnergyRef.current = Math.min(2, pulseEnergyRef.current + 1.25)
    if (busy) { stopAll(); return false }
    return true
  })
  useEffect(() => { currentFlow.current = flow }, [flow])
  useEffect(() => {
    const cancelExternal = (preserveConversation = false) => {
      cancelHold()
      searchCancelRef.current?.(preserveConversation)
      handledFlow.current = currentFlow.current?.id
      setStoppedFlow(currentFlow.current?.id)
      stopSpeech(true)
      setNotice('')
    }
    cancelRef.current = cancelExternal
    return () => {
      cancelSpeech(true)
      handledFlow.current = null
      if (cancelRef.current === cancelExternal) cancelRef.current = null
    }
  }, [cancelRef, cancelSpeech, stopSpeech, cancelHold])

  useEffect(() => {
    if (!flow || flow.key !== newsSearch(query) || window.location.search.replace(/^\?/, '') !== flow.key || handledFlow.current === flow.id) return
    if (flow.mode === 'CATEGORY') {
      handledFlow.current = flow.id
      say(flow.prompt || categoryPrompt(flow.gameName))
      return
    }
    if (result.loading) return
    handledFlow.current = flow.id
    if (result.error) { say('소식을 불러오지 못했어요. 게시판의 다시 시도 버튼으로 조회해 주세요.'); return }
    const latest = result.data?.content[0]
    cancelSpeech(true)
    if (!latest) { say('저장된 브리핑이 없습니다. 다른 분류를 선택해 주세요.'); return }
    const script = storedBriefingScript(latest)
    if (!script) { say('이 소식에는 읽을 수 있는 저장 요약이 없어요. 화면이나 공식 원문을 확인해 주세요.'); return }
    say(script, true)
  }, [flow, query, result.loading, result.error, result.data, say, cancelSpeech])

  function stopAll() {
    cancelHold()
    handledFlow.current = flow?.id
    setStoppedFlow(flow?.id)
    voice.stop()
    stopSpeech()
    setNotice('음성 듣기와 재생을 중지했어요.')
  }
  function listen(nextMode, changeGame = false) {
    cancelHold()
    handledFlow.current = flow?.id
    setStoppedFlow(flow?.id)
    stopSpeech(nextMode === 'GAME')
    setMode(nextMode)
    setNotice('')
    voice.start(changeGame)
  }
  const replaySummary = () => {
    cancelHold()
    voice.stop()
    setNotice('')
    replay()
  }
  const help = holding ? '계속 누르고 계세요 · 2초가 되면 음성 인식이 시작돼요'
    : voice.phase === 'LISTENING'
    ? (mode === 'CATEGORY' ? '듣고 있어요 · 원하는 소식 분류를 말씀해 주세요' : '듣고 있어요 · 게임명 또는 현재 후보 번호를 말씀해 주세요')
    : voice.phase === 'RESOLVING' ? '게임을 확인하고 있어요'
      : loadingVoiceResult ? '선택한 분류의 최신 소식을 조회하고 있어요'
        : mode === 'CATEGORY' ? '파동을 2초간 꾹 누른 뒤 분류나 “도타2 패치 알려줘”처럼 말씀해 주세요' : '파동을 2초간 꾹 누른 뒤 “도타2 패치 알려줘”처럼 말씀해 주세요'
  const activity = voice.phase === 'LISTENING' ? 'LISTENING'
    : speech.status === 'SPEAKING' ? 'MODEL_SPEAKING' : holding ? 'HOLDING' : 'IDLE'

  return <div className="news-wave-search">
    <div className={`news-wave-panel${voice.phase === 'LISTENING' ? ' is-listening' : ''}${holding ? ' is-holding' : ''}`}>
      <button type="button" className="news-wave-trigger" {...holdHandlers}
        aria-label={busy ? '음성 중지' : mode === 'CATEGORY' ? '2초간 눌러 음성으로 카테고리 선택 시작' : '2초간 눌러 음성으로 게임 검색 시작'}
        aria-describedby="news-wave-help" aria-pressed={Boolean(busy || holding)}>
        <NeonWaveCanvas pulseEnergyRef={pulseEnergyRef} activity={activity} />
      </button>
    </div>
    <div className="news-voice-actions" role="group" aria-label="음성 소식 제어">
      <button type="button" onClick={() => listen(mode)} disabled={voice.phase === 'LISTENING'}>{mode === 'CATEGORY' ? '카테고리 말하기' : '게임명 말하기'}</button>
      <button type="button" onClick={stopAll} disabled={!busy}>중지</button>
      <button type="button" onClick={replaySummary} disabled={!speech.canReplay}>다시 듣기</button>
      {query.appId && <button type="button" onClick={() => listen('GAME', true)}>게임 바꾸기</button>}
    </div>
    <div className="news-wave-caption">
      <p id="news-wave-help">{help}</p>
      <small>음성은 브라우저 인식 서비스로 전송될 수 있습니다. 앱 서버에 원본 음성을 저장하지 않습니다.</small>
      <small>낭독은 OpenAI가 생성한 AI 음성입니다. 읽을 문장이 OpenAI로 전송됩니다.</small>
      {!voice.supported && <small>이 브라우저는 음성 인식을 지원하지 않아요. 아래 검색창을 이용해 주세요.</small>}
      <p className="news-wave-status" role="status" aria-live="polite">{notice || (['LISTENING', 'RESOLVING', 'ERROR'].includes(voice.phase) ? voice.message : speech.message || voice.message)}</p>
      {voice.transcript && <p className="news-wave-transcript">인식한 말: <q>{voice.transcript}</q></p>}
    </div>
    {voice.candidates.length > 0 && <div className="news-wave-candidates" role="group" aria-label="음성 게임 검색 후보">
      {voice.candidates.map((game, index) => <button type="button" key={game.appId}
        disabled={voice.phase === 'RESOLVING' || voice.phase === 'LISTENING'} onClick={() => voice.selectCandidate(index + 1)}>
        <span>{index + 1}. {game.name}</span><small>Steam #{game.appId}</small>
      </button>)}
      <small>{voice.hasMore ? '후보가 더 있어요. 더 구체적인 게임명으로 다시 검색할 수 있어요.' : '게임을 누르거나 파동을 누른 뒤 “2번”처럼 말씀해 주세요.'}</small>
    </div>}
  </div>
}
