import { COACH_NAME } from '../../model/coachModel'
import CoachAvatar from '../CoachAvatar'
import { Evidence, GameCards } from '../CoachAnswerParts'

const BUBBLE = 'rounded-[14px] px-[16px] py-[12px] text-[12px] leading-[1.75] whitespace-pre-line'

export default function Message({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className={BUBBLE + ' max-w-[85%] bg-primary text-bg rounded-br-[4px]'}>{message.text}</p>
      </div>
    )
  }
  return (
    <div className="flex gap-[10px] items-start">
      <CoachAvatar />
      <div className="max-w-[85%] min-w-0">
        <span className="block mb-[4px] text-[11px] font-[650]">{COACH_NAME}</span>
        <p
          className={BUBBLE + ' rounded-tl-[4px] ' + (message.error ? 'bg-surface-soft text-muted border border-border' : 'bg-surface-soft')}
          role={message.error ? 'alert' : undefined}
        >
          {message.text}
        </p>
        <GameCards games={message.games} />
        <Evidence items={message.evidence} />
      </div>
    </div>
  )
}
