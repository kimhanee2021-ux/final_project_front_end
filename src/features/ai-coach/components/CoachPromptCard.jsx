import { Link } from 'react-router-dom'
import { COACH_NAME, coachLink } from '../coachModel'
import CoachAvatar from './CoachAvatar'

// 소비 패턴 제목 오른쪽에 두는 작은 AI 코치 입구. 누르면 코치 화면으로 간다.
export default function CoachPromptCard() {
  return (
    <Link
      to={coachLink()}
      className="group flex items-center gap-[12px] pl-[8px] pr-[16px] py-[8px] rounded-full bg-insight-bg border border-insight-border shadow-[var(--shadow)] transition-transform hover:-translate-y-[1px] hover:border-primary max-[760px]:self-stretch max-[760px]:rounded-[14px]"
    >
      <CoachAvatar size={44} />
      <span className="min-w-0">
        <span className="block text-[8px] tracking-[1.6px] font-bold text-primary-text">AI SPENDING COACH</span>
        <strong className="block text-[12px] tracking-[-0.3px] whitespace-nowrap">{COACH_NAME}에게 내 소비 물어보기</strong>
        <span className="block text-[10px] text-muted whitespace-nowrap">지출 습관·가성비·다음에 할 게임</span>
      </span>
      <span className="ml-auto text-[16px] text-primary-text transition-transform group-hover:translate-x-[2px]" aria-hidden="true">›</span>
    </Link>
  )
}
