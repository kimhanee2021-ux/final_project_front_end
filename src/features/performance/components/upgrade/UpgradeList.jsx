import { GSIcon } from '@/shared/ui'
import EvaluationNotice from '../EvaluationNotice'

// 개선·업그레이드 방향: 부품 네 개를 타일로 보여주고, 누르면 AI가 분석한 자세한 안내를 다이얼로그로 연다.
export default function UpgradeList({ evaluation, onSelect }) {
  if (evaluation.status !== 'ready') return <EvaluationNotice status={evaluation.status} />
  return (
    <ul className="gs-stagger grid grid-cols-4 gap-[16px] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
      {evaluation.judgements.map(item => (
        <li key={item.category}>
          <button
            className="w-full h-full flex flex-col items-start gap-[14px] p-[24px] rounded-[20px] bg-bg text-left transition-transform duration-200 hover:-translate-y-[3px]"
            onClick={() => onSelect(item)}
          >
            <span className="grid place-items-center w-[44px] h-[44px] rounded-full bg-surface text-muted">
              <GSIcon name={item.icon} size={22} />
            </span>
            <strong className="text-[16px] font-[600] leading-[1.4]">
              {item.label} · {item.verdict?.label ?? '분석 전'}
            </strong>
            <small className="text-[13px] text-muted leading-[1.6] line-clamp-3">
              {item.advice?.reason ?? 'AI 분석이 끝나면 이 부품의 개선 방향을 알려드려요.'}
            </small>
            <span className="mt-auto inline-flex items-center gap-[6px] text-[13px] text-primary-text">
              자세히 보기
              <GSIcon name="arrow" size={15} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
