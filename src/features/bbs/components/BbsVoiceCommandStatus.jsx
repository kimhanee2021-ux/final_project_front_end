import '../styles/voiceCommand.css'

export default function BbsVoiceCommandStatus({ state, onCancel }) {
  if (state.phase === 'IDLE') return null
  const busy = ['INTERPRETING', 'CHOOSING', 'NEWS', 'SUMMARY'].includes(state.phase)
  return <section className="bbs-voice-command" aria-label="음성 요청 진행">
    <div className="bbs-command-copy"><span>음성 요청</span><p className="bbs-command-transcript">“{state.transcript}”</p>
      <p role={state.phase === 'ERROR' ? 'alert' : 'status'}>{state.message}</p></div>
    <button type="button" className="bbs-text-button" onClick={onCancel}>{busy ? '요청 취소' : '닫기'}</button>
  </section>
}
