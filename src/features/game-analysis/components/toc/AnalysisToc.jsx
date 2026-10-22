import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useActiveSection } from '@/shared/hooks'
import { scrollToPanel } from '@/shared/utils/smoothScroll'
import { TOC_GROUPS, TOC_IDS } from '../../model/analysisSections'

// 넓은 화면에 펼쳐 둘 섹션들 (묶음 구분 없이 같은 간격으로 늘어놓는다)
const TOC_ITEMS = TOC_GROUPS.flatMap(group => group.items)

// 넓은 화면: 오른쪽 가장자리에 섹션마다 가로줄 하나를 같은 간격으로 늘어놓는다 (노션 목차처럼).
// 지금 보는 섹션은 줄을 보라로 길게 칠하고, 왼쪽에 아이콘 + 섹션 이름 라벨을 띄운다 (아이콘은 각 섹션 제목의 아이콘과 같다).
// 다른 줄에 마우스를 올리거나 키보드로 들어오면 라벨이 그 섹션으로 옮겨 가고, 누르면 그 섹션으로 이동한다.
// 본문(최대 1100px) 옆에 여백이 충분할 때만 보이고, 좁은 화면은 아래 AnalysisTocMenu가 맡는다.
export default function AnalysisToc() {
  const active = useActiveSection(TOC_IDS)
  // 라벨은 한 번에 하나만: 가리키는 섹션이 있으면 그것, 없으면 지금 보는 섹션
  const [pointed, setPointed] = useState(null)
  const labeled = pointed ?? active
  return (
    <nav aria-label="AI 분석 목차" className="fixed right-[16px] top-1/2 -translate-y-1/2 z-[25] max-[1239px]:hidden">
      <ul className="list-none m-0 p-0 grid gap-[6px]" onMouseLeave={() => setPointed(null)}>
        {TOC_ITEMS.map(item => {
          const current = item.id === active
          const showLabel = item.id === labeled
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                aria-label={item.label}
                onClick={event => scrollToPanel(event, item.id)}
                onMouseEnter={() => setPointed(item.id)}
                onFocus={() => setPointed(item.id)}
                onBlur={() => setPointed(null)}
                // 줄보다 넓은 칸 전체가 눌리는 영역이라 커서를 정확히 줄 위에 두지 않아도 된다
                className="group/item relative flex items-center justify-end w-[56px] h-[28px] pr-[4px] outline-none!"
              >
                <span
                  className={`rounded-full transition-[width,height,background-color] duration-200 group-hover/item:w-[44px] group-hover/item:h-[6px] group-focus-visible/item:w-[44px] group-focus-visible/item:h-[6px] ${
                    current ? 'w-[34px] h-[5px] bg-primary' : 'w-[22px] h-[5px] bg-faint/50 group-hover/item:bg-primary/60 group-focus-visible/item:bg-primary/60'
                  }`}
                  aria-hidden="true"
                />
                <span
                  aria-hidden="true"
                  className={`absolute right-full top-1/2 -translate-y-1/2 mr-[8px] flex items-center gap-[6px] px-[12px] py-[6px] rounded-full bg-surface border border-border shadow-[var(--shadow)] text-[12px] font-[650] whitespace-nowrap pointer-events-none transition-[opacity,translate] duration-200 ${
                    showLabel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[6px]'
                  } ${current ? 'text-primary-text' : 'text-text'}`}
                >
                  <GSIcon name={item.icon} size={14} className="text-primary-text shrink-0" />
                  {item.label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
