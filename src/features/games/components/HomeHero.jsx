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
export default function HomeHero() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  return (
    <section className={`gs-hero gs-hero-${index}`} aria-label="GameSense 소개">
      <div className="gs-hero-image" />
      <div className="gs-hero-copy" key={index}>
        <p className="gs-hero-eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p className="gs-hero-description">{slide.description}</p>
        <Link className="gs-primary-button" to={slide.to}>
          {slide.cta}
          <GSIcon name="arrow" size={18} />
        </Link>
      </div>
      <div className="gs-hero-signature">
        <span>
          FIND
          <br />
          PLAY
          <br />
          ANALYZE
          <br />
          GROW
        </span>
        <em>
          with
          <br />
          <strong>GameSense</strong>
        </em>
      </div>
      <div className="gs-hero-pagination" role="group" aria-label="배너 선택">
        {slides.map((item, number) => (
          <button
            key={item.eyebrow}
            className={index === number ? 'active' : ''}
            aria-label={`배너 ${number + 1}`}
            aria-pressed={index === number}
            onClick={() => setIndex(number)}
          />
        ))}
      </div>
    </section>
  )
}
