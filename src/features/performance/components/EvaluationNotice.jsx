import { Link } from 'react-router-dom'
import { STATUS_MESSAGES } from '../model/pcEvaluation'

// 사양·로그인·동의가 갖춰지지 않아 확인할 수 없을 때, 각 칸 안에 이유를 보여준다.
// 사양 입력 버튼은 화면 맨 위(내 PC 종합평가 제목 줄)에 한 번만 두므로 여기에는 넣지 않는다.
// 로그인 버튼도 맨 위 종합 등급 칸에서만(showLogin) 보여주고, 나머지 칸은 문구만 둔다.
export default function EvaluationNotice({ status, showLogin = false }) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-[16px] p-[20px] rounded-[16px] bg-bg max-[600px]:flex-col max-[600px]:items-start"
    >
      <p className="text-[14px] text-muted leading-[1.7]">{STATUS_MESSAGES[status]}</p>
      {status === 'login' && showLogin && (
        <Link to="/login?next=%2Fpc-check" className="gs-primary-button shrink-0">
          로그인하기
        </Link>
      )}
    </div>
  )
}
