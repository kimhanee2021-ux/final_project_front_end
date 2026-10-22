import { useEffect, useRef, useState } from 'react'

// 랜딩(public/landing)의 영상 무대를 그대로 이어받은 배경. 움직임 줄이기 설정이면 영상을 멈춘다.
export default function Backdrop() {
  const video = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      if (!video.current) return
      if (media.matches) video.current.pause()
      else video.current.play().catch(() => {})
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return (
    <div className="fixed inset-0 -z-10 bg-[#17121a]" aria-hidden="true">
      {!failed && (
        <video
          ref={video}
          className="absolute inset-0 w-full h-full object-cover saturate-[.85]"
          src="/landing/videos/hades.mp4"
          autoPlay muted loop playsInline preload="auto"
          onError={() => setFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#17121ab3_0%,#17121a66_45%,#17121a26_100%),linear-gradient(0deg,#17121aaa,transparent_50%,#17121a33)]" />
    </div>
  )
}
