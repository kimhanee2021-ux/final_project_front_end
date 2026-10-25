import { useRef } from 'react'
import NeonWaveCanvas from './NeonWaveCanvas'
import '../styles/voiceOrb.css'

const BUSY = ['STARTING', 'LISTENING', 'TRANSCRIBING']

// 검색창 끝에 들어가는 작은 음성 버튼. AI 게임 검색의 원형 버튼을 줄인 모양이고, 누르면 시작·다시 누르면 취소한다.
export default function BbsVoiceMiniOrb({ phase, onStart, onCancel, className = '' }) {
  const pulseEnergyRef = useRef(0)
  const busy = BUSY.includes(phase)
  const toggle = () => {
    pulseEnergyRef.current = busy ? 0 : 1.5
    if (busy) onCancel()
    else onStart()
  }
  return (
    <span className={`bbs-voice-mini${busy ? ' is-busy' : ''}${phase === 'LISTENING' ? ' is-listening' : ''}${phase === 'ERROR' ? ' has-error' : ''} ${className}`}>
      <button type="button" className="bbs-voice-mini-trigger" onClick={toggle} aria-pressed={busy}
        aria-label={busy ? '음성 인식 취소' : '음성으로 게임 검색'} title={busy ? '음성 인식 취소' : '음성으로 게임 검색'}>
        <NeonWaveCanvas pulseEnergyRef={pulseEnergyRef} activity={phase} />
      </button>
    </span>
  )
}
