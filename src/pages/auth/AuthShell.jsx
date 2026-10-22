import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-auth-mint focus-visible:outline-offset-[4px]'

// 랜딩(public/landing)의 영상 무대를 그대로 이어받은 배경. 움직임 줄이기 설정이면 영상을 멈춘다.
function Backdrop() {
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

// 랜딩이 페이지를 넘기기 직전에 sessionStorage에 남긴 표시. 있으면 넘겨지는 동안 문구와 카드가 차례로 올라온다.
const CHAPTER_KEY = 'gamesense-chapter'
function readChapter() {
  try { return sessionStorage.getItem(CHAPTER_KEY) } catch { return null }
}

// 로그인·가입·온보딩이 함께 쓰는 틀: 영상 배경 + 상단 로고 + 하단 약관. 가운데는 각 화면이 채운다.
export default function AuthShell({ children }) {
  const policyRef = useRef(null)
  const [policy, setPolicy] = useState('')
  // StrictMode가 초기화 함수를 두 번 부르므로 읽기만 하고, 지우는 건 아래 effect에서 한다.
  const [turning] = useState(readChapter)
  useEffect(() => {
    try { sessionStorage.removeItem(CHAPTER_KEY) } catch { /* 다음 방문에 한 번 더 보일 뿐이다. */ }
  }, [])
  return (
    <div className={`relative isolate min-h-[100svh] bg-[#17121a] text-auth-text px-[clamp(24px,3.5vw,64px)] flex flex-col max-[800px]:px-[24px] max-[420px]:px-[20px] ${turning ? 'auth-intro' : ''}`}>
      <a className="fixed left-[16px] top-[-80px] z-[100] p-[12px] bg-surface focus:top-[10px]" href="#auth-main">본문으로 이동</a>
      <Backdrop />
      <header className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-[20px] shrink-0 min-h-[96px] max-[800px]:min-h-[82px]">
        <Link to="/" className={`inline-flex gap-[10px] items-center opacity-90 ${focusRing}`} aria-label="GameSense 처음으로">
          <GSIcon name="gamepad" size={36} className="text-[#dcb99e] shrink-0 max-[420px]:w-[30px]" />
          <strong className="text-[22px] leading-none font-[500] tracking-[-1px]">GameSense</strong>
        </Link>
        <Link to="/" className={`inline-flex items-center gap-[10px] text-[#d3d9d3] text-[13px] py-[10px] opacity-85 hover:text-[#b9dcc8] hover:opacity-100 max-[420px]:text-[11px] ${focusRing}`}>
          <GSIcon name="arrowLeft" size={18} />
          <span>처음으로</span>
        </Link>
      </header>
      <main className="w-full max-w-[1600px] mx-auto flex-1 grid grid-cols-[minmax(0,1.2fr)_minmax(360px,460px)] gap-[clamp(38px,6vw,120px)] items-center py-[24px] max-[900px]:grid-cols-1 max-[900px]:gap-0" id="auth-main">
        {children}
      </main>
      <footer className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-[20px] shrink-0 min-h-[72px] text-[11px] text-[#a7b0ab] max-[420px]:flex-wrap max-[420px]:justify-center max-[420px]:py-[14px]">
        <span>© {new Date().getFullYear()} GameSense</span>
        <div className="flex gap-[20px]">
          {['이용약관', '개인정보처리방침'].map(label => (
            <button key={label} type="button" className={`py-[8px] bg-transparent text-[11px] hover:text-auth-text ${focusRing}`} onClick={() => { setPolicy(label); policyRef.current.showModal() }}>{label}</button>
          ))}
        </div>
      </footer>
      <dialog
        ref={policyRef}
        className="bg-[#11191f] text-auth-text border border-auth-border rounded-[16px] max-w-[min(460px,calc(100vw-32px))] p-0 backdrop:bg-[#02070ac9] backdrop:backdrop-blur-[5px]"
        aria-labelledby="auth-policy-title"
        onClick={event => { if (event.target === event.currentTarget) policyRef.current.close() }}
      >
        <div className="p-[28px]">
          <h2 className="text-[21px]" id="auth-policy-title">{policy} 안내</h2>
          <p className="text-auth-muted text-[13px] leading-[1.9] mt-[17px] break-keep">정식 서비스의 {policy}은 준비 중이에요.</p>
          <p className="text-auth-muted text-[13px] leading-[1.9] mt-[17px] break-keep">입력한 이메일과 비밀번호는 로그인·회원가입을 위해 GameSense 서버로 전송되며, 비밀번호는 암호화되어 저장됩니다. 로그인 토큰은 이 브라우저에 저장되고, 입력한 PC 사양은 이 브라우저에만 저장됩니다.</p>
          <button type="button" className={`flex items-center justify-center w-full min-h-[54px] px-[20px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] hover:bg-[#69f5d0] mt-[24px] ${focusRing}`} onClick={() => policyRef.current.close()}>확인</button>
        </div>
      </dialog>
    </div>
  )
}

// 랜딩 결의 얇은 테두리 + 강한 투명 유리 카드. 영상이 비쳐 보이고, 폼과 온보딩 단계가 공통으로 쓴다.
export const CARD = 'auth-enter-card w-full rounded-[22px] border border-[#ffffff29] bg-[#0b1115]/45 backdrop-blur-[18px] shadow-[0_30px_90px_#0006] p-[clamp(24px,2.6vw,40px)]'

// 1 계정 → 2 스팀 연동 → 3 추가 정보. current는 지금 단계 번호(1~3).
const STEPS = ['계정', '스팀 연동', '추가 정보']
export function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-[10px] list-none p-0 m-0 mb-[26px] text-[12px]" aria-label="가입 진행 단계">
      {STEPS.map((label, index) => {
        const number = index + 1
        const done = number < current
        const active = number === current
        return (
          <li key={label} className="flex items-center gap-[10px]" aria-current={active ? 'step' : undefined}>
            <span className={`grid place-items-center w-[24px] h-[24px] rounded-full text-[11px] font-[700] ${done ? 'bg-auth-mint text-[#062c23]' : active ? 'border border-auth-mint text-auth-mint' : 'border border-[#ffffff33] text-[#8fa0b3]'}`}>
              {done ? <GSIcon name="check" size={13} /> : number}
            </span>
            <span className={active ? 'text-auth-text font-[600]' : 'text-[#8fa0b3]'}>{label}</span>
            {number < STEPS.length && <span className="w-[18px] h-px bg-[#ffffff2a] max-[420px]:w-[8px]" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
