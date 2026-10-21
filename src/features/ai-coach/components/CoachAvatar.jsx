import { COACH_FACE } from '../coachModel'

// 코치 노바의 동그란 얼굴 그림
export default function CoachAvatar({ size = 40 }) {
  return (
    <img
      src={COACH_FACE}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-full shrink-0 bg-surface-soft shadow-[0_4px_14px_#0003] ring-2 ring-surface object-cover"
    />
  )
}
