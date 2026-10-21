import GSIcon from '../icons/GSIcon'
import { scrollToBottom, scrollToTop } from '../../utils/smoothScroll'

const ROUND_BUTTON =
  'w-[46px] h-[46px] grid place-items-center rounded-full bg-surface text-text shadow-[var(--shadow)] border border-border hover:text-primary-text hover:-translate-y-[2px] transition-[transform,color]'

// 화면 오른쪽 아래에 세로로 쌓아 두는 도구 모음: 맨 위로 · 맨 아래로 이동 버튼, 그 아래에 children(다른 도구 버튼)이 있으면 이어 붙인다.
// 이동은 빠르게 부드럽게 움직이고, 모션 줄이기 설정이면 바로 이동한다.
export default function FloatingDock({ children }) {
  return (
    <div className="fixed right-[24px] bottom-[24px] z-40 grid justify-items-end gap-[10px] max-[600px]:right-[14px] max-[600px]:bottom-[14px]">
      <button type="button" className={ROUND_BUTTON} onClick={scrollToTop} aria-label="맨 위로 이동" title="맨 위로">
        <GSIcon name="arrowUp" size={20} />
      </button>
      <button type="button" className={ROUND_BUTTON} onClick={scrollToBottom} aria-label="맨 아래로 이동" title="맨 아래로">
        <GSIcon name="arrowDown" size={20} />
      </button>
      {children}
    </div>
  )
}
