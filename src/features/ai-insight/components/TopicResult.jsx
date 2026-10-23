import { useTopicInsight } from '../hooks/useTopicInsight'
import InsightCard from './InsightCard'
import { TEXT_BUTTON } from '@/shared/ui'

function Loading() {
  return (
    <div role="status" aria-live="polite">
      <div className="grid gap-[12px]" aria-hidden="true">
        <div className="h-[30px] w-[92%] rounded-[10px] bg-surface animate-[pulse_1.4s_infinite_alternate]" />
        <div className="h-[30px] w-[64%] rounded-[10px] bg-surface animate-[pulse_1.4s_infinite_alternate]" />
      </div>
      <p className="mt-[16px] text-[13px] text-muted">AI가 내 게임 데이터를 분석하고 있어요...</p>
    </div>
  )
}

export function Failure({ message, onRetry }) {
  return (
    <div role="alert">
      <p className="text-[15px] text-muted leading-[1.6]">{message}</p>
      <button type="button" className={TEXT_BUTTON + ' mt-[8px]'} onClick={onRetry}>다시 시도</button>
    </div>
  )
}

// 고른 태그의 AI 결과. 태그를 바꾸면 key로 새로 만들어 그 태그의 결과를 불러온다.
export default function TopicResult({ topic }) {
  const { status, insight, error, retry } = useTopicInsight(topic)
  if (status === 'loading') return <Loading />
  if (status === 'error') return <Failure message={error} onRetry={retry} />
  return <InsightCard insight={insight} />
}
