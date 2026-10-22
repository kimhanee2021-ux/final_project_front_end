import { GSIcon } from '@/shared/ui'

// 부품 하나를 타일로: 아이콘 · 이름/모델 → 주요 사양. 2×2 격자 안에서 쓴다.
// 사용률처럼 브라우저가 실제로 측정할 수 없는 값은 싣지 않는다. item.custom이면 사용자가 입력한 사양이다.
export default function HardwareCard({ item }) {
  return (
    <article
      className="flex flex-col gap-[20px] p-[24px] rounded-[20px] bg-bg min-w-0"
      aria-label={`${item.name} ${item.custom ? '입력한' : '예시'} 사양`}
    >
      <div className="flex items-center gap-[14px]">
        <span className="grid place-items-center w-[44px] h-[44px] rounded-full bg-surface text-muted shrink-0">
          <GSIcon name={item.id} size={22} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[13px] text-muted">
            {item.name}
            <span className="ml-[8px] text-[12px] text-faint">{item.custom ? '입력한 사양' : '예시'}</span>
          </h3>
          <p className="mt-[2px] text-[16px] font-[600] leading-[1.4] text-pretty">{item.model}</p>
        </div>
      </div>
      {item.facts.length > 0 && (
        <ul className="grid gap-[8px] text-[13px] text-muted">
          {item.facts.map(([icon, text]) => (
            <li key={text} className="flex items-start gap-[8px] leading-[1.5]">
              <GSIcon name={icon} size={15} className="shrink-0 mt-[3px] text-faint" />
              {text}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
