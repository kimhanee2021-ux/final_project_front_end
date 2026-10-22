import { VERDICTS } from '../../../model/verdict'

// 담은 게임 태그 한 개: 판단 색 점 + 이름. 고른 태그는 반전 색
export default function GameTag({ item, kind, active, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`inline-flex shrink-0 items-center gap-[8px] h-[36px] max-w-[220px] px-[14px] rounded-full text-[13px] font-[600] transition-colors ${
        active ? 'bg-text text-surface' : 'bg-surface text-muted hover:text-text'
      }`}
    >
      <i className="block w-[8px] h-[8px] shrink-0 rounded-full" style={{ background: kind ? VERDICTS[kind].bg : 'var(--border)' }} aria-hidden="true" />
      <span className="truncate">{item.name}</span>
    </button>
  )
}
