import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { PRIMARY_BUTTON } from '../../spending/styles'
import { MAX_MESSAGE_LENGTH, SUGGESTED_QUESTIONS } from '../coachModel'
import { useCoachChat } from '../hooks/useCoachChat'

const BUBBLE = 'rounded-[14px] px-[16px] py-[12px] text-[12px] leading-[1.75] whitespace-pre-line'

function GameCards({ games }) {
  if (!games?.length) return null
  return (
    <ul className="list-none m-0 mt-[10px] p-0 grid gap-[8px]" aria-label="코치가 추천한 내 게임">
      {games.map(game => (
        <li key={game.appId} className="flex items-center gap-[12px] p-[8px] rounded-[10px] bg-surface border border-border">
          {game.thumbnailUrl ? (
            <img src={game.thumbnailUrl} alt="" className="w-[92px] h-[43px] rounded-[6px] object-cover shrink-0" />
          ) : (
            <span className="w-[92px] h-[43px] rounded-[6px] bg-surface-soft shrink-0" />
          )}
          <div className="min-w-0">
            <strong className="block text-[12px] truncate">{game.name}</strong>
            <span className="block text-[11px] text-muted leading-[1.5]">{game.reason}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Message({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className={BUBBLE + ' max-w-[85%] bg-primary text-bg rounded-br-[4px]'}>{message.text}</p>
      </div>
    )
  }
  return (
    <div className="flex gap-[10px] items-start">
      <span className="w-[30px] h-[30px] rounded-full grid place-items-center bg-primary-soft text-primary-text shrink-0" aria-hidden="true">
        <GSIcon name="spark" size={16} />
      </span>
      <div className="max-w-[85%] min-w-0">
        <p
          className={BUBBLE + ' rounded-tl-[4px] ' + (message.error ? 'bg-surface-soft text-muted border border-border' : 'bg-surface-soft')}
          role={message.error ? 'alert' : undefined}
        >
          {message.text}
        </p>
        <GameCards games={message.games} />
      </div>
    </div>
  )
}

// AI 게임 소비 코치와의 대화 화면. 처음에는 추천 질문을 보여주고, 답변에 추천 게임 카드를 붙인다.
export default function CoachChat() {
  const { messages, pending, send, reset } = useCoachChat()
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const submit = text => {
    if (!text.trim() || pending) return
    send(text)
    setInput('')
  }

  return (
    <section className="bg-surface border border-border rounded-[15px] shadow-[var(--shadow)] flex flex-col min-w-0 h-[min(680px,calc(100vh-220px))] min-h-[460px]">
      <div className="flex items-center justify-between gap-[12px] px-[24px] pt-[20px] pb-[14px] border-b border-border">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-0.4px]">코치에게 물어보기</h2>
          <p className="text-muted text-[10px] mt-[4px]">내 실제 결제액·플레이 시간을 보고 답해요</p>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={reset} disabled={pending}
            className="inline-flex items-center gap-[6px] text-[10px] text-muted bg-transparent hover:text-text disabled:opacity-60">
            <GSIcon name="refresh" size={14} />새 대화
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[16px]" aria-live="polite">
        {messages.length === 0 ? (
          <div className="m-auto text-center max-w-[460px]">
            <span className="inline-grid place-items-center w-[48px] h-[48px] rounded-full bg-primary-soft text-primary-text">
              <GSIcon name="spark" size={24} />
            </span>
            <strong className="block mt-[14px] text-[15px]">무엇이든 물어보세요</strong>
            <p className="text-muted text-[12px] mt-[6px] leading-[1.7]">
              지출, 가성비, 안 한 게임, 이번 달 예산까지. 숫자는 소비 분석 데이터 그대로 쓰고, 추천은 내가 가진 게임 중에서만 해요.
            </p>
            <div className="flex flex-wrap justify-center gap-[8px] mt-[18px]">
              {SUGGESTED_QUESTIONS.map(question => (
                <button key={question} type="button" onClick={() => submit(question)}
                  className="px-[12px] py-[7px] rounded-full border border-border bg-surface-soft text-[11px] hover:border-primary hover:text-primary-text">
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(message => <Message key={message.id} message={message} />)
        )}
        {pending && (
          <div className="flex gap-[10px] items-center text-muted text-[12px]" role="status">
            <span className="w-[30px] h-[30px] rounded-full grid place-items-center bg-primary-soft text-primary-text shrink-0" aria-hidden="true">
              <GSIcon name="spark" size={16} />
            </span>
            코치가 내 소비 기록을 살펴보는 중...
          </div>
        )}
      </div>

      <form
        className="flex gap-[10px] items-end px-[24px] py-[16px] border-t border-border max-[580px]:px-[16px]"
        onSubmit={event => {
          event.preventDefault()
          submit(input)
        }}
      >
        <textarea
          value={input}
          onChange={event => setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit(input)
            }
          }}
          rows={1}
          placeholder="예) 이번 달 예산 안에서 쓰고 있어?"
          aria-label="코치에게 보낼 질문"
          className="flex-1 resize-none max-h-[120px] px-[14px] py-[11px] rounded-[10px] border border-border bg-surface-soft text-text text-[12px] placeholder:text-muted"
        />
        <button type="submit" className={PRIMARY_BUTTON} disabled={pending || !input.trim()}>
          보내기
        </button>
      </form>
      <p className="px-[24px] pb-[14px] -mt-[6px] text-[10px] text-muted">
        AI가 작성한 답변이에요. 구매내역 원본과 결제 정보는 AI에 보내지 않아요.
      </p>
    </section>
  )
}
