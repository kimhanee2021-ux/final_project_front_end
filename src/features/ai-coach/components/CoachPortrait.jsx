import { useState } from 'react'
import { COACH_CHARACTER_FALLBACK, COACH_NAME, COACH_PORTRAIT } from '../coachModel'

// 코치 화면 왼쪽의 큰 세나 사진. 사진은 꽉 채워 얼굴이 위쪽에 오게 자르고, 사진 파일이 없으면 기본 일러스트(투명 배경)를 아래에 맞춰 그린다.
export default function CoachPortrait() {
  const [src, setSrc] = useState(COACH_PORTRAIT)
  const isPhoto = src === COACH_PORTRAIT
  return (
    <img
      src={src}
      alt={COACH_NAME}
      onError={() => setSrc(COACH_CHARACTER_FALLBACK)}
      className={
        isPhoto
          ? 'absolute inset-0 h-full w-full object-cover object-[50%_15%]'
          : 'absolute inset-x-0 bottom-0 mx-auto h-[104%] w-full object-contain object-bottom'
      }
    />
  )
}
