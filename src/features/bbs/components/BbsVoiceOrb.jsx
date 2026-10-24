import { useId, useRef } from 'react'
import NeonWaveCanvas from './NeonWaveCanvas'
import { useHoldToSpeak } from '../hooks/useHoldToSpeak'
import '../styles/voiceOrb.css'

export default function BbsVoiceOrb({ phase, message, transcript = '', onStart, onCancel }) {
  const guideId = useId()
  const pulseEnergyRef = useRef(0)
  const busy = ['STARTING', 'LISTENING', 'TRANSCRIBING'].includes(phase)
  const listening = phase === 'LISTENING'
  const activate = () => {
    pulseEnergyRef.current = busy ? 0 : 1.5
    if (busy) onCancel()
    else onStart()
  }
  const { holding, handlers } = useHoldToSpeak(activate, busy ? 500 : 200)
  const label = busy ? '0.5초간 눌러 음성 인식 취소' : '0.2초간 눌러 음성으로 게임 검색'
  const activity = busy ? phase : holding ? 'HOLDING' : phase
  return <section className="bbs-voice-panel" aria-label="음성으로 게임 검색" data-state={activity}>
    <div className={`bbs-voice-orb${holding ? ' is-holding' : ''}${phase === 'STARTING' ? ' is-starting' : ''}${phase === 'LISTENING' ? ' is-listening' : ''}${phase === 'TRANSCRIBING' ? ' is-processing' : ''}${phase === 'ERROR' ? ' has-error' : ''}`}>
      <button type="button" className="bbs-voice-trigger" {...handlers} aria-label={label} title={message ? `${message} ${label}` : label}
        aria-pressed={busy} aria-describedby={listening ? guideId : undefined}>
        <NeonWaveCanvas pulseEnergyRef={pulseEnergyRef} activity={activity} />
      </button>
    </div>
    {listening && <div className="bbs-voice-guide" id={guideId}>
      <div className="bbs-voice-guide-copy" role="status" aria-live="polite" aria-atomic="true">
        <span className="bbs-voice-badge"><i aria-hidden="true" />음성 인식 ON</span>
        <h2>듣고 있어요. 게임 이름과 요청을 말씀해 주세요.</h2>
        <p>“카운터스트라이크 2 최신 소식 들려줘”<br />“다음 소식 들려줘” · “멈춰” · “계속 읽어줘”</p>
      </div>
      <ol className="bbs-voice-steps" aria-label="음성 검색 순서">
        {['0.2초 누르기', '원하는 소식 말하기', '검색부터 브리핑까지'].map((text, index) =>
          <li key={text} aria-current={index === 1 ? 'step' : undefined}>
            <span aria-hidden="true">{index + 1}</span>{text}
          </li>)}
      </ol>
      <div className="bbs-live-transcript" aria-label="실시간 음성 입력" role="status" aria-live="polite" aria-atomic="true">
        <span>지금 하시는 말씀</span>
        <p className={transcript ? '' : 'is-empty'}>{transcript || '말씀하시면 이곳에 표시돼요…'}</p>
      </div>
      <p className="bbs-voice-guide-tip">말을 마치면 자동 검색 · 원형을 다시 0.5초 누르면 취소 · Esc로도 취소</p>
    </div>}
  </section>
}
