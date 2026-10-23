// 사양을 알려주는 세 가지 방법. 위쪽 탭으로 하나씩 골라서 본다.
const METHODS = [
  { key: 'command', number: 1, label: '명령어 결과' },
  { key: 'manual', number: 2, label: '직접 입력' },
  { key: 'photo', number: 3, label: '사진' },
]

// 입력 방법 탭 (번호 + 이름)
export default function SpecMethodTabs({ method, onChange }) {
  return (
    <div
      className="grid grid-cols-3 gap-[4px] p-[4px] mb-[18px] rounded-[18px] bg-bg"
      role="tablist"
      aria-label="사양 입력 방법"
    >
      {METHODS.map(item => {
        const active = item.key === method
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`flex items-center justify-center gap-[8px] h-[44px] rounded-[14px] text-[13px] whitespace-nowrap transition-colors ${
              active
                ? 'bg-surface text-text font-[650] shadow-[var(--shadow)]'
                : 'bg-transparent text-muted hover:text-text'
            }`}
            onClick={() => onChange(item.key)}
          >
            <span
              className={`grid place-items-center w-[20px] h-[20px] rounded-full text-[11px] font-[700] ${active ? 'bg-primary text-on-primary' : 'bg-surface text-muted'}`}
            >
              {item.number}
            </span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
