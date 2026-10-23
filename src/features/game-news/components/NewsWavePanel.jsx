import { useRef } from 'react'
import NeonWaveCanvas from './NeonWaveCanvas'
import { useVoiceGameSearch } from '../hooks/useVoiceGameSearch'
import '../styles/newsWave.css'

export default function NewsWavePanel({ onSelect, cancelRef }) {
  const pulseEnergyRef = useRef(0)
  const voice = useVoiceGameSearch(onSelect, cancelRef)
  const busy = voice.phase === 'LISTENING' || voice.phase === 'RESOLVING'

  const triggerPulse = event => {
    pulseEnergyRef.current = Math.min(2, pulseEnergyRef.current + 1.25)
    event.currentTarget.dispatchEvent(new Event('news-wave-pulse'))
    if (busy) voice.stop()
    else voice.start()
  }

  return <div className="news-wave-search">
    <div className={`news-wave-panel${voice.phase === 'LISTENING' ? ' is-listening' : ''}`}>
    <button type="button" className="news-wave-trigger" onClick={triggerPulse}
      aria-label={busy ? '음성 게임 검색 중지' : '음성으로 게임 검색 시작'}
      aria-describedby="news-wave-help" aria-pressed={busy}>
      <NeonWaveCanvas pulseEnergyRef={pulseEnergyRef} />
    </button>
    </div>
    <div className="news-wave-caption">
      <p id="news-wave-help">{voice.phase === 'LISTENING' ? '듣고 있어요 · 파동을 다시 누르면 중지합니다'
        : voice.phase === 'RESOLVING' ? '게임 확인 중 · 파동을 누르면 취소합니다'
          : '파동을 눌러 게임명을 말씀해 주세요'}</p>
      <small>음성은 브라우저 인식 서비스로 전송될 수 있습니다. 앱 서버에 원본 음성을 저장하지 않습니다.</small>
      {!voice.supported && <small>이 브라우저는 음성 인식을 지원하지 않아요. 아래 검색창을 이용해 주세요.</small>}
      <p className="news-wave-status" role="status" aria-live="polite">{voice.message}</p>
      {voice.transcript && <p className="news-wave-transcript">인식한 말: <q>{voice.transcript}</q></p>}
    </div>
    {voice.candidates.length > 0 && <div className="news-wave-candidates" role="group" aria-label="음성 게임 검색 후보">
      {voice.candidates.map((game, index) => <button type="button" key={game.appId}
        disabled={busy} onClick={() => voice.selectCandidate(index + 1)}>
        <span>{index + 1}. {game.name}</span><small>Steam #{game.appId}</small>
      </button>)}
      <small>{voice.hasMore ? '후보가 더 있어요. 더 구체적인 게임명으로 다시 검색할 수 있어요.' : '게임을 누르거나 파동을 누른 뒤 “2번”처럼 말씀해 주세요.'}</small>
    </div>}
  </div>
}
