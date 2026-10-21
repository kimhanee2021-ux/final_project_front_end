import { Link } from 'react-router-dom'
import { STATUS_MESSAGES } from '../model/pcEvaluation'
import PcSpecButton from './PcSpecButton'

// 사양·로그인·동의가 갖춰지지 않아 확인할 수 없을 때, 각 칸 안에 이유와 다음 행동을 보여준다.
export default function EvaluationNotice({ status }) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-[16px] p-[20px] rounded-[16px] bg-bg max-[600px]:flex-col max-[600px]:items-start"
    >
      <p className="text-[14px] text-muted leading-[1.7]">{STATUS_MESSAGES[status]}</p>
      {status === 'login' ? (
        <Link to="/login?next=%2Fpc-check%2Fevaluation" className="gs-primary-button shrink-0">
          로그인하기
        </Link>
      ) : (
        <PcSpecButton className="shrink-0" />
      )}
    </div>
  )
}
