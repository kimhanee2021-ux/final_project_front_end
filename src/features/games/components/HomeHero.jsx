import { useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../../components/common/GSIcon'

const slides = [
  {
    eyebrow: 'PLAY  EXPLORE  TRACK  IMPROVE',
    title: (
      <>
        Good Games
        <br />
        Make a Better You
      </>
    ),
    description: (
      <>
        게임은 단순한 놀이가 아니라,
        <br />
        당신의 일상을 채우는 또 하나의 경험입니다.
      </>
    ),
    cta: '지금 탐험하기',
    to: '/explore',
  },
  {
    eyebrow: 'DISCOVER YOUR NEXT FAVORITE',
    title: (
      <>
        A New World.
        <br />
        Your Next Story.
      </>
    ),
    description: (
      <>
        수많은 세계 속에서 발견하는 나만의 취향.
        <br />
        다음으로 사랑하게 될 게임을 만나보세요.
      </>
    ),
    cta: '추천 게임 보기',
    to: '/recommendations',
  },
  {
    eyebrow: 'LESS GUESSING. MORE PLAYING.',
    title: (
      <>
        Know Your Play.
        <br />
        Find Your Balance.
      </>
    ),
    description: (
      <>
        나의 플레이와 소비 패턴을 한눈에.
        <br />더 즐거운 게임 라이프를 시작해 보세요.
      </>
    ),
    cta: '나의 패턴 보기',
    to: '/analysis',
  },
]
// 슬라이드별 배경 위치(gs-hero-1/2)는 인라인 style로 직접 준다 — 클래스 3개를
// 두는 것보다 index로 바로 계산하는 쪽이 더 명확하다.
const heroImagePosition = ['50% 55%', '50% 40%', '50% 65%']

export default function HomeHero() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  return (
    <section
      className="relative min-h-[285px] h-[clamp(270px,18vw,348px)] border border-[#314350] rounded-[13px] isolate overflow-hidden text-white min-[1600px]:h-[294px] max-[900px]:h-[286px] max-[600px]:h-[305px] max-[600px]:min-h-[305px] max-[600px]:rounded-[12px]"
      aria-label="GameSense 소개"
    >
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#02090dcc_0%,#040b1044_45%,#08121e03_70%,#09121b70_100%),linear-gradient(0deg,#02080d45,transparent_55%),url('/images/fantasy-world.png')] [background-size:cover] transition-[background-position] duration-[600ms] max-[600px]:bg-[linear-gradient(90deg,#040b11de,#06101b40),url('/images/fantasy-world.png')] max-[600px]:[background-position:61%_center]"
        style={{ backgroundPosition: heroImagePosition[index] }}
      />
      <div
        className="p-[clamp(25px,2.2vw,40px)_34px] animate-[gs-appear_.4s_ease_both] max-[900px]:p-[29px] max-[600px]:p-[30px_24px] max-[360px]:px-[20px]"
        key={index}
      >
        <p className="text-[#c1ccd7] text-[10px] tracking-[4px] font-medium m-[0_0_13px] whitespace-pre-wrap max-[900px]:text-[9px] max-[900px]:tracking-[3px] max-[600px]:text-[8px] max-[600px]:tracking-[2.5px] max-[600px]:max-w-[240px] max-[600px]:leading-[1.8] max-[600px]:mb-[15px]">
          {slide.eyebrow}
        </p>
        <h1 className="text-[clamp(32px,2.75vw,48px)] tracking-[-0.9px] leading-[1.07] font-[640] m-[0_0_13px] max-w-[620px] min-[1600px]:text-[45px] max-[900px]:text-[37px] max-[600px]:text-[clamp(27px,7.6vw,38px)] max-[600px]:leading-[1.12] max-[600px]:tracking-[-0.7px] max-[600px]:mb-[16px]">
          {slide.title}
        </h1>
        <p className="text-[12px] text-[#d1d9df] leading-[1.65] mb-[17px] min-[1600px]:text-[13px] max-[600px]:text-[11px] max-[600px]:leading-[1.8] max-[600px]:mb-[20px]">
          {slide.description}
        </p>
        <Link
          className="inline-flex items-center justify-center gap-[12px] px-[23px] min-h-[38px] rounded-[25px] bg-gs-accent text-[#05291f] text-[12px] font-[750] border border-transparent transition-[transform,box-shadow] duration-[180ms] hover:bg-[#63f8d1] hover:shadow-[0_4px_20px_#35edbe24] hover:-translate-y-[1px] min-[1600px]:text-[13px] max-[600px]:text-[11px] max-[600px]:py-[9px] max-[600px]:px-[20px]"
          to={slide.to}
        >
          {slide.cta}
          <GSIcon name="arrow" size={18} />
        </Link>
      </div>
      <div className="absolute right-[34px] bottom-[44px] flex flex-col items-start rotate-[-3deg] max-[600px]:hidden">
        <span className="text-[9px] leading-[1.8] tracking-[2.6px] text-[#d1dce8]">
          FIND
          <br />
          PLAY
          <br />
          ANALYZE
          <br />
          GROW
        </span>
        <em className="font-['Segoe_Print','Comic_Sans_MS',cursive] text-[20px] leading-[1.05] mt-[8px] rotate-[-10deg] text-[#dae2ec]">
          with
          <br />
          <strong className="text-[#40f8cb] text-[22px] font-semibold ml-[7px]">GameSense</strong>
        </em>
      </div>
      <div className="absolute right-[22px] bottom-[15px] flex items-center gap-[7px] max-[600px]:right-[18px] max-[600px]:bottom-[13px]" role="group" aria-label="배너 선택">
        {slides.map((item, number) => (
          <button
            key={item.eyebrow}
            className={`w-[16px] h-[15px] py-[5px] relative bg-transparent after:content-[''] after:block after:w-full after:h-[4px] after:rounded-[5px] ${index === number ? 'w-[29px] after:bg-white' : 'after:bg-[#788c9b66]'}`}
            aria-label={`배너 ${number + 1}`}
            aria-pressed={index === number}
            onClick={() => setIndex(number)}
          />
        ))}
      </div>
    </section>
  )
}
