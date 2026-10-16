import { Link } from 'react-router-dom'
import { COACH_NAME, coachLink } from '../coachModel'
import CoachAvatar from './CoachAvatar'

const QUICK_QUESTIONS = ['이번 달 얼마 썼어?', '나 세일 때 너무 많이 사는 편이야?', '사 놓고 안 한 게임 중에 뭐부터 할까?']

// 소비 패턴 화면에 두는 AI 코치 입구. 질문을 누르면 코치 화면으로 넘어가 그 질문을 바로 보낸다.
export default function CoachPromptCard() {
  return (
    <section className="flex items-center gap-[18px] mb-[20px] px-[22px] py-[18px] bg-surface border border-border rounded-[15px] shadow-[var(--shadow)] max-[760px]:flex-col max-[760px]:items-start">
      <CoachAvatar size={64} />
      <div className="flex-1 min-w-0">
        <span className="text-primary-text text-[9px] tracking-[1.9px] font-bold">AI SPENDING COACH</span>
        <h2 className="mt-[4px] text-[15px] font-bold tracking-[-0.4px]">차트만 봐선 잘 모르겠다면 {COACH_NAME}에게 물어보세요</h2>
        <div className="flex flex-wrap gap-[8px] mt-[10px]">
          {QUICK_QUESTIONS.map(question => (
            <Link key={question} to={coachLink(question)}
              className="px-[12px] py-[7px] rounded-full border border-border bg-surface-soft text-[11px] hover:border-primary hover:text-primary-text">
              {question}
            </Link>
          ))}
        </div>
      </div>
      <Link to={coachLink()} className="text-[11px] font-[650] text-primary-text whitespace-nowrap hover:underline">
        대화하러 가기 →
      </Link>
    </section>
  )
}
