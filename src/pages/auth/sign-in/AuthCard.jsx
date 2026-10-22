import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { authLink, useAuthForm } from '@/features/auth'
import { CARD, FOCUS_RING } from '../shell/authStyles'
import Stepper from '../shell/Stepper'
import AuthField from './AuthField'

const content = {
  login: { eyebrow: 'WELCOME BACK', title: '다시 만나 반가워요', subtitle: 'GameSense에서 나의 게임 라이프를 이어가세요.', action: '로그인' },
  signup: { eyebrow: 'YOUR NEXT CHAPTER', title: '새로운 모험의 시작', subtitle: '당신만의 게임 라이프를 만들어보세요.', action: '회원가입' },
  'forgot-password': { eyebrow: 'LET’S GET YOU BACK', title: '비밀번호를 잊으셨나요?', subtitle: '가입할 때 사용한 이메일 주소를 입력해주세요.', action: '재설정 링크 받기' },
}

// 로그인 · 회원가입 · 비밀번호 찾기 카드 (mode). returnTo: 로그인 뒤 돌아갈 주소
export default function AuthCard({ mode, returnTo }) {
  const copy = content[mode]
  const isSignup = mode === 'signup'
  const isReset = mode === 'forgot-password'
  const location = useLocation()
  const form = useAuthForm(mode)
  const { formRef, remember, setRemember, message, submitting, submit, showPassword } = form
  const titleRef = useRef(null)
  useEffect(() => {
    const previous = document.title
    document.title = `${copy.action} | GameSense`
    window.scrollTo(0, 0)
    titleRef.current?.focus({ preventScroll: true })
    return () => {
      document.title = previous
    }
  }, [copy.action])
  const fieldProps = { form, isSignup }
  const passwordType = showPassword ? 'text' : 'password'
  return (
    <section className="flex items-center justify-center min-w-0 max-[900px]:py-[8px]" aria-labelledby="auth-title">
      <div className={CARD}>
        {isSignup && <Stepper current={1} />}
        <p className="text-[#6af6d3] text-[11px] font-[750] tracking-[3px]">{copy.eyebrow}</p>
        <h1
          className="text-[clamp(26px,2.2vw,34px)] leading-[1.3] tracking-[-1.3px] mt-[16px] mb-[12px] font-[650] break-keep outline-none max-[420px]:text-[26px]"
          id="auth-title" ref={titleRef} tabIndex={-1}
        >{copy.title}</h1>
        <p className="text-[14px] text-auth-muted leading-[1.75] break-keep max-[420px]:text-[12px]">{copy.subtitle}</p>
        {location.state?.loginRequired && (
          <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] mt-[20px]">
            <GSIcon name="lock" size={16} className="mt-[2px] shrink-0" />
            이 기능은 로그인 후 이용할 수 있어요.
          </p>
        )}
        <form ref={formRef} className="mt-[28px] flex flex-col gap-[18px]" onSubmit={submit} noValidate>
          {isSignup && <AuthField {...fieldProps} name="name" label="닉네임" icon="user" placeholder="어떻게 불러드릴까요?" />}
          <AuthField {...fieldProps} name="email" label="이메일" icon="mail" placeholder="이메일 주소를 입력하세요" type="email" />
          {!isReset && (
            <AuthField {...fieldProps} name="password" label="비밀번호" icon="lock" placeholder={isSignup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'} type={passwordType} />
          )}
          {isSignup && <AuthField {...fieldProps} name="confirm" label="비밀번호 확인" icon="lock" placeholder="비밀번호를 한 번 더 입력하세요" type={passwordType} />}
          {mode === 'login' && (
            <div className="flex justify-between items-center gap-[12px] text-[12px]">
              <label className="flex items-center gap-[10px] cursor-pointer">
                <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} className="w-[18px] h-[18px] accent-auth-mint cursor-pointer shrink-0" />
                로그인 상태 유지
              </label>
              <Link to={authLink('forgot-password', returnTo)} className={`text-auth-muted underline-offset-[4px] hover:text-auth-mint hover:underline ${FOCUS_RING}`}>비밀번호 찾기</Link>
            </div>
          )}
          <button type="submit" className={`flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] disabled:opacity-70 ${FOCUS_RING}`} disabled={submitting} aria-busy={submitting}>
            {submitting ? '처리 중...' : isSignup ? '가입하고 스팀 연동하기' : copy.action}<GSIcon name="arrow" size={20} />
          </button>
        </form>
        <div role="status" aria-live="polite">{message && <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] mt-[18px]"><GSIcon name="info" size={18} className="mt-[2px] shrink-0" />{message}</p>}</div>
        <p className="flex flex-wrap justify-center gap-[7px] mt-[22px] text-auth-muted text-[12px]">{mode === 'login' ? <>아직 계정이 없으신가요? <Link to={authLink('signup', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${FOCUS_RING}`}>회원가입</Link></> : <Link to={authLink('login', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${FOCUS_RING}`}>로그인으로 돌아가기 <span aria-hidden="true">→</span></Link>}</p>
      </div>
    </section>
  )
}
