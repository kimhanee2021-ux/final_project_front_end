import { useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useDismiss } from '@/shared/hooks'
import { TOC_GROUPS, TOC_IDS } from '../model/analysisSections'
import { useActiveSection } from '../hooks/useActiveSection'
import { scrollToPanel } from './scrollToPanel'

// 작은 화면 목차 카드
const CARD = 'w-[224px] max-h-[80vh] overflow-y-auto p-[8px] rounded-[20px] bg-surface border border-border shadow-[var(--shadow)]'

// 작은 화면 목차 목록: 묶음 제목 아래로 섹션 이름. 지금 보는 섹션은 보라 점 + 옅은 보라 배경으로 표시한다.
function TocList({ active, onNavigate }) {
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

// 넓은 화면에 펼쳐 둘 섹션들 (묶음 구분 없이 같은 간격으로 늘어놓는다)
const TOC_ITEMS = TOC_GROUPS.flatMap(group => group.items)

// 넓은 화면: 오른쪽 가장자리에 섹션마다 가로줄 하나를 같은 간격으로 늘어놓는다 (노션 목차처럼).
// 지금 보는 섹션은 줄을 보라로 길게 칠하고, 왼쪽에 아이콘 + 섹션 이름 라벨을 띄운다 (아이콘은 각 섹션 제목의 아이콘과 같다).
// 다른 알약에 마우스를 올리거나 키보드로 들어오면 라벨이 그 섹션으로 옮겨 가고, 누르면 그 섹션으로 이동한다.
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

// 좁은 화면: 오른쪽 아래 도구 모음(FloatingDock)에 목차 버튼을 하나 더 두고, 누르면 그 옆으로 목차 카드를 연다.
// 버튼 모양은 FloatingDock의 맨 위/맨 아래 버튼과 같다.
export function AnalysisTocMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = useActiveSection(TOC_IDS)
  useDismiss(ref, open, () => setOpen(false))
  return (
    <div ref={ref} className="relative min-[1240px]:hidden">
      {open && (
        <nav aria-label="AI 분석 목차" className={`${CARD} absolute right-[58px] bottom-0 max-h-[70vh] animate-[gs-appear_.2s_ease]`}>
          <TocList active={active} onNavigate={() => setOpen(false)} />
        </nav>
      )}
      <button
        type="button"
        className={`w-[46px] h-[46px] grid place-items-center rounded-full shadow-[var(--shadow)] border border-border hover:-translate-y-[2px] transition-[transform,color] ${
          open ? 'bg-primary-soft text-primary-text' : 'bg-surface text-text hover:text-primary-text'
        }`}
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-label="목차"
        title="목차"
      >
        <GSIcon name="list" size={20} />
      </button>
    </div>
  )
}
