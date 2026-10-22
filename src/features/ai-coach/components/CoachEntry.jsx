import { Link } from 'react-router-dom'
import { BASIC_QUESTIONS, COACH_NAME, COACH_PATH, coachLink } from '../coachModel'
import CoachAvatar from './CoachAvatar'

// AI 분석 영역 안의 작은 "AI에게 직접 물어보기" 섹션. 입력창 없이 핵심 질문 몇 개만 보여주고,
// 질문을 누르면 그 질문을 들고 채팅 페이지로 가서 바로 묻는다. 버튼은 질문 없이 채팅 페이지만 연다.
// 왼쪽에 소개와 질문, 오른쪽에 버튼을 두고 버튼은 섹션 세로 가운데에 맞춘다.
export default function CoachEntry() {
  return (
    <section
      aria-label="AI에게 직접 물어보기"
      className="mt-[24px] flex items-center justify-between gap-[20px] rounded-[20px] bg-surface p-[20px] max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:p-[16px]"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-[12px] min-w-0">
          <CoachAvatar size={40} />
          <div className="min-w-0">
            <h3 className="text-[16px] font-[750] tracking-[-0.4px]">AI에게 직접 물어보기</h3>
            <p className="text-[12px] text-muted">AI 게임 마스터 {COACH_NAME}에게 내 소비와 플레이 기록에 대해 자유롭게 물어보세요.</p>
          </div>
        </div>
        <ul className="list-none m-0 mt-[14px] p-0 flex flex-wrap gap-[8px]" aria-label="추천 질문">
          {BASIC_QUESTIONS.map(question => (
            <li key={question}>
              <Link
                to={coachLink(question)}
                className="inline-block rounded-full bg-bg px-[14px] py-[7px] text-[12px] font-[600] text-muted hover:text-primary-text"
              >
                {question}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link
        to={COACH_PATH}
        className="shrink-0 inline-flex items-center justify-center gap-[6px] rounded-full bg-primary px-[20px] h-[42px] text-[13px] font-[700] text-on-primary hover:brightness-110"
      >
        {COACH_NAME}와 채팅하기 →
      </Link>
    </section>
  )
}
