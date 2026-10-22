import { GSIcon } from '@/shared/ui'
import { upgrades } from '../mocks/performanceMock'

// 추천 업그레이드: 타일을 누르면 자세한 안내를 다이얼로그로 연다. 3열 격자.
export default function UpgradeList({ onSelect }) {
  return (
    <ul className="gs-stagger grid grid-cols-3 gap-[16px] max-[900px]:grid-cols-1">
      {upgrades.map(item => (
        <li key={item.id}>
          <button
            className="w-full h-full flex flex-col items-start gap-[14px] p-[24px] rounded-[20px] bg-bg text-left transition-transform duration-200 hover:-translate-y-[3px]"
            onClick={() => onSelect(item)}
          >
            <span className="grid place-items-center w-[44px] h-[44px] rounded-full bg-surface text-muted">
              <GSIcon name={item.id} size={22} />
            </span>
            <strong className="min-h-[2.8em] text-[16px] font-[600] leading-[1.4] line-clamp-2">{item.title}</strong>
            <small className="text-[13px] text-muted leading-[1.6]">{item.description}</small>
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
