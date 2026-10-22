import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import Backdrop from './Backdrop'
import { FOCUS_RING } from './authStyles'

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
        <Link to="/" className={`inline-flex gap-[10px] items-center opacity-90 ${FOCUS_RING}`} aria-label="GameSense 처음으로">
          <GSIcon name="gamepad" size={36} className="text-[#dcb99e] shrink-0 max-[420px]:w-[30px]" />
          <strong className="text-[22px] leading-none font-[500] tracking-[-1px]">GameSense</strong>
        </Link>
        <Link to="/" className={`inline-flex items-center gap-[10px] text-[#d3d9d3] text-[13px] py-[10px] opacity-85 hover:text-[#b9dcc8] hover:opacity-100 max-[420px]:text-[11px] ${FOCUS_RING}`}>
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
            <button key={label} type="button" className={`py-[8px] bg-transparent text-[11px] hover:text-auth-text ${FOCUS_RING}`} onClick={() => { setPolicy(label); policyRef.current.showModal() }}>{label}</button>
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
          <button type="button" className={`flex items-center justify-center w-full min-h-[54px] px-[20px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] hover:bg-[#69f5d0] mt-[24px] ${FOCUS_RING}`} onClick={() => policyRef.current.close()}>확인</button>
        </div>
      </dialog>
    </div>
  )
}
