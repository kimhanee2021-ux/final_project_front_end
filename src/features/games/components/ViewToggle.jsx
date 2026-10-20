import { GSIcon } from '@/shared/ui'

const buttonClass = active =>
  `w-[36px] h-[32px] grid place-items-center rounded-full p-0 ${active ? 'bg-surface text-text shadow-[var(--shadow)]' : 'bg-transparent text-muted'}`

// 게임 목록의 그리드/리스트 보기 전환 버튼. 상태는 부모가 가진다.
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="inline-flex p-[3px] rounded-full bg-bg shrink-0" role="group" aria-label="게임 목록 보기 방식">
      <button className={buttonClass(view === 'grid')} aria-label="그리드 보기" aria-pressed={view === 'grid'} onClick={() => onChange('grid')}>
        <GSIcon name="grid" size={17} />
      </button>
      <button className={buttonClass(view === 'list')} aria-label="리스트 보기" aria-pressed={view === 'list'} onClick={() => onChange('list')}>
        <GSIcon name="list" size={19} />
      </button>
    </div>
  )
}
