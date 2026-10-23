import { COACH_NAME, COACH_PORTRAIT } from '../model/coachModel'

// 코치 화면 왼쪽의 큰 노바 그림. 배경이 투명한 일러스트라 아래에 맞춰 그린다.
export default function CoachPortrait() {
  return <img src={COACH_PORTRAIT} alt={COACH_NAME} className="absolute inset-x-0 bottom-0 mx-auto h-[104%] w-full object-contain object-bottom" />
}
