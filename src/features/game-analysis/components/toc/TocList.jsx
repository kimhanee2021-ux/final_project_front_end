import { scrollToPanel } from '@/shared/utils/smoothScroll'
import { TOC_GROUPS } from '../../model/analysisSections'

// 목차 목록: 묶음 제목 아래로 섹션 이름. 지금 보는 섹션은 보라 점 + 옅은 보라 배경으로 표시한다.
export default function TocList({ active, onNavigate }) {
  return TOC_GROUPS.map(group => (
    <div key={group.title ?? 'top'} className="[&+&]:mt-[6px]">
      {group.title && <p className="px-[10px] pt-[8px] pb-[4px] text-[11px] font-[700] text-faint">{group.title}</p>}
      <ul className="list-none m-0 p-0">
        {group.items.map(item => {
          const current = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                onClick={event => {
                  scrollToPanel(event, item.id)
                  onNavigate?.()
                }}
                className={`flex items-center gap-[10px] px-[10px] py-[7px] rounded-[10px] text-[13px] transition-colors ${
                  current ? 'bg-primary-soft text-primary-text font-[650]' : 'text-muted hover:bg-bg hover:text-text'
                }`}
              >
                <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${current ? 'bg-primary' : 'bg-faint/40'}`} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  ))
}
