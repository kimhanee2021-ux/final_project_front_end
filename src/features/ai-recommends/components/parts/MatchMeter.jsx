

// 잘 맞는 정도: 막대 3칸 + 문구. %가 아니라 목록 안의 순위 구간이다.
export default function MatchMeter({ match, className = 'text-primary-text' }) {
  return (
    <span className={`inline-flex items-center gap-[6px] text-[12px] font-[700] ${className}`}>
      <span className="flex gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map(step => (
          <i key={step} className={`block w-[10px] h-[4px] rounded-full ${step <= match.level ? 'bg-current' : 'bg-current opacity-25'}`} />
        ))}
      </span>
      {match.label}
    </span>
  )
}
