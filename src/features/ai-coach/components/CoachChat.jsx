import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { PRIMARY_BUTTON } from '../../spending/styles'
import { MAX_MESSAGE_LENGTH, SUGGESTED_QUESTIONS } from '../coachModel'
import { useCoachChat } from '../hooks/useCoachChat'

const BUBBLE = 'rounded-[14px] px-[16px] py-[12px] text-[12px] leading-[1.75] whitespace-pre-line'
// 코치 캐릭터 (public/images, 직접 그린 일러스트). 말풍선 옆 얼굴은 avatar, 왼쪽 큰 그림은 character. 다른 이미지로 바꾸려면 파일만 교체
const COACH_NAME = '코치 세나'
const COACH_AVATAR = '/images/ai-coach-avatar.svg'
const COACH_CHARACTER = '/images/ai-coach-character.svg'

function CoachAvatar({ size = 40 }) {
  return (
    <img
      src={COACH_AVATAR}
      alt=""
      width={size}
      height={size}
      className="rounded-full shrink-0 shadow-[0_4px_14px_#0003] ring-2 ring-surface"
    />
  )
}

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
      </div>
    </div>
  )
}

// AI 게임 소비 코치와의 대화 화면. 왼쪽에 큰 코치 캐릭터와 추천 질문, 오른쪽에 대화(답변에 추천 게임 카드).
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
    <section className="grid grid-cols-[minmax(240px,0.72fr)_minmax(0,1.65fr)] gap-[12px] p-[12px] bg-surface border border-border rounded-[18px] shadow-[var(--shadow)] h-[min(720px,calc(100vh-200px))] min-h-[580px] max-[1000px]:grid-cols-1 max-[1000px]:h-auto">
      {/* 왼쪽: 크게 보이는 코치 캐릭터 + 인사 + 추천 질문 */}
      <aside className="flex flex-col min-h-0 overflow-hidden rounded-[14px] bg-surface-soft border border-border">
        <div className="relative flex-1 min-h-[210px] overflow-hidden max-[1000px]:min-h-[230px] max-[1000px]:flex-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,var(--primary-soft),transparent_70%)]" />
          <img
            src={COACH_CHARACTER}
            alt={COACH_NAME + ' 캐릭터'}
            className="absolute inset-x-0 bottom-0 mx-auto h-[104%] w-full object-contain object-bottom"
          />
          <div className="absolute inset-x-0 bottom-0 h-[56px] bg-[linear-gradient(to_top,var(--surface-soft),transparent)]" />
        </div>
        <div className="relative min-h-0 overflow-y-auto px-[20px] pb-[18px] pt-[4px]">
          <p className="text-[20px] font-bold text-primary-text">안녕하세요!</p>
          <p className="mt-[6px] text-[12px] leading-[1.7]">
            저는 <strong>{COACH_NAME}</strong>예요. 내 실제 결제액과 플레이 시간을 보고 지출, 가성비, 다음에 할 게임을 알려 드려요.
          </p>
          <h3 className="mt-[16px] text-[11px] font-bold text-primary-text">이렇게 물어보세요</h3>
          <div className="mt-[8px] grid gap-[6px]">
            {SUGGESTED_QUESTIONS.map(question => (
              <button key={question} type="button" onClick={() => submit(question)} disabled={pending}
                className="group flex items-center gap-[10px] rounded-[10px] px-[12px] py-[9px] text-left text-[11px] font-[600] bg-surface border border-border transition-transform hover:-translate-y-[1px] hover:border-primary disabled:opacity-60">
                <span className="flex-1">{question}</span>
                <span className="text-primary-text transition-transform group-hover:translate-x-[2px]">›</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 오른쪽: 대화 */}
      <div className="flex flex-col min-h-0 min-w-0 rounded-[14px] border border-border overflow-hidden max-[1000px]:h-[620px]">
        <div className="flex items-center justify-between gap-[12px] px-[22px] pt-[18px] pb-[14px] border-b border-border">
          <div className="flex items-center gap-[10px]">
            <CoachAvatar size={34} />
            <div>
              <h2 className="text-[14px] font-bold tracking-[-0.4px]">{COACH_NAME}</h2>
              <p className="text-muted text-[10px] mt-[2px]">AI 게임 소비 코치 · 내 실제 결제액·플레이 시간 기준</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button type="button" onClick={reset} disabled={pending}
              className="inline-flex items-center gap-[6px] text-[10px] text-muted bg-transparent hover:text-text disabled:opacity-60">
              <GSIcon name="refresh" size={14} />새 대화
            </button>
          )}
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-[22px] py-[20px] flex flex-col gap-[16px]" aria-live="polite">
          {messages.length === 0 ? (
            <div className="m-auto text-center max-w-[380px] text-muted">
              <CoachAvatar size={56} />
              <p className="mt-[12px] text-[12px] leading-[1.7]">
                추천 질문을 누르거나 아래에 직접 물어보세요.
                <br />숫자는 소비 분석 데이터 그대로 쓰고, 추천은 내가 가진 게임 중에서만 해요.
              </p>
            </div>
          ) : (
            messages.map(message => <Message key={message.id} message={message} />)
          )}
          {pending && (
            <div className="flex gap-[10px] items-start" role="status">
              <CoachAvatar />
              <div>
                <span className="block mb-[4px] text-[11px] font-[650]">{COACH_NAME}</span>
                <span className="inline-flex items-center gap-[5px] rounded-[14px] rounded-tl-[4px] bg-surface-soft px-[16px] py-[14px]" aria-label="코치가 답변을 쓰는 중">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-[6px] h-[6px] rounded-full bg-muted animate-bounce" style={{ animationDelay: delay + 'ms' }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          className="flex gap-[10px] items-end px-[22px] py-[14px] border-t border-border max-[580px]:px-[14px]"
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
        <p className="px-[22px] pb-[12px] -mt-[4px] text-[10px] text-muted">
          AI가 작성한 답변이에요. 구매내역 원본과 결제 정보는 AI에 보내지 않아요.
        </p>
      </div>
    </section>
  )
}
