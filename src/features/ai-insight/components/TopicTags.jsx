const TAG = 'px-[14px] h-[38px] rounded-full text-[13px] font-[650] whitespace-nowrap transition-colors'

// 분석 태그. 서버가 알려 준 태그만 그리므로 구매내역이 있어야 하는 태그는 구매내역이 없으면 보이지 않는다.
export default function TopicTags({ topics, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-[8px]" role="group" aria-label="분석 주제">
      {topics.map(topic => (
        <button
          key={topic.key}
          type="button"
          aria-pressed={topic.key === selected}
          onClick={() => onSelect(topic.key)}
          className={`${TAG} ${topic.key === selected ? 'bg-primary text-on-primary' : 'bg-surface text-muted hover:text-text'}`}
        >
          {topic.label}
        </button>
      ))}
    </div>
  )
}
