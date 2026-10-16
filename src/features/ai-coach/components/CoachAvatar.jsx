import { useState } from 'react'
import { COACH_AVATAR_FALLBACK, COACH_FACE } from '../coachModel'

// 코치 세나의 동그란 얼굴 사진. 사진 파일이 없으면 기본 일러스트로 바꾼다.
export default function CoachAvatar({ size = 40 }) {
  const [src, setSrc] = useState(COACH_FACE)
  const isPhoto = src === COACH_FACE
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      onError={() => setSrc(COACH_AVATAR_FALLBACK)}
      className={
        'rounded-full shrink-0 bg-surface-soft shadow-[0_4px_14px_#0003] ring-2 ring-surface ' +
        (isPhoto ? 'object-cover' : 'object-contain')
      }
    />
  )
}
