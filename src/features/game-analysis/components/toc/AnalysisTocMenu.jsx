import { useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useActiveSection, useDismiss } from '@/shared/hooks'
import { TOC_IDS } from '../../model/analysisSections'
import TocList from './TocList'

// 목차 카드
const CARD = 'w-[224px] max-h-[80vh] overflow-y-auto p-[8px] rounded-[20px] bg-surface border border-border shadow-[var(--shadow)]'

// 좁은 화면: 오른쪽 아래 도구 모음(FloatingDock)에 목차 버튼을 하나 더 두고, 누르면 그 옆으로 목차 카드를 연다.
// 버튼 모양은 FloatingDock의 맨 위/맨 아래 버튼과 같다.
export default function AnalysisTocMenu() {
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
