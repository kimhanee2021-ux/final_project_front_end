import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useAuth, authLink, safeReturnTo, checkEmailAvailability, checkNicknameAvailability } from '@/features/auth'
import { getErrorMessage } from '@/shared/lib/apiClient'
import AuthShell, { CARD, Stepper } from './AuthShell'
import { onboardingLink } from './onboardingFlow'

const content = {
  login: { eyebrow: 'WELCOME BACK', title: '다시 만나 반가워요', subtitle: 'GameSense에서 나의 게임 라이프를 이어가세요.', action: '로그인' },
  signup: { eyebrow: 'YOUR NEXT CHAPTER', title: '새로운 모험의 시작', subtitle: '당신만의 게임 라이프를 만들어보세요.', action: '회원가입' },
  'forgot-password': { eyebrow: 'LET’S GET YOU BACK', title: '비밀번호를 잊으셨나요?', subtitle: '가입할 때 사용한 이메일 주소를 입력해주세요.', action: '재설정 링크 받기' },
}

export default function AuthPage({ mode = 'login' }) {
  const copy = content[mode]
  const isSignup = mode === 'signup'
  const isReset = mode === 'forgot-password'
  const { isAuthenticated, login, signup } = useAuth()
  const location = useLocation()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('next'))
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)
  const titleRef = useRef(null)
  useEffect(() => {
    const previous = document.title
    document.title = `${copy.action} | GameSense`
    window.scrollTo(0, 0)
    titleRef.current?.focus({ preventScroll: true })
    return () => { document.title = previous }
  }, [copy.action])

  // 로그인/가입이 성공하면 isAuthenticated가 바뀌면서 온보딩(스팀 연동 확인)으로 넘어간다.
  // 이미 연동을 마친 사람은 온보딩이 바로 returnTo로 다시 보내 준다.
  if (isAuthenticated) return <Navigate to={onboardingLink(returnTo)} replace />

  const change = event => {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    setMessage('')
  }
  // 회원가입 폼: 입력을 마친 칸에서 벗어날 때 서버에 중복 여부를 바로 확인한다.
  const checkAvailability = async event => {
    if (!isSignup) return
    const { name } = event.target
    const value = values[name].trim()
    if (name === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      try {
        if (!(await checkEmailAvailability(value))) setErrors(current => ({ ...current, email: '이미 가입된 이메일입니다.' }))
      } catch { /* 제출 시 서버가 다시 검사한다. */ }
    }
    if (name === 'name' && value.length >= 2) {
      try {
        if (!(await checkNicknameAvailability(value))) setErrors(current => ({ ...current, name: '이미 사용 중인 닉네임입니다.' }))
      } catch { /* 제출 시 서버가 다시 검사한다. */ }
    }
  }
  const submit = async event => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = {}
    if (isSignup && values.name.trim().length < 2) nextErrors.name = '닉네임을 2자 이상 입력해주세요.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = '올바른 이메일 주소를 입력해주세요.'
    if (!isReset && !values.password) nextErrors.password = '비밀번호를 입력해주세요.'
    else if (isSignup && values.password.length < 8) nextErrors.password = '비밀번호는 8자 이상 입력해주세요.'
    if (isSignup && values.confirm !== values.password) nextErrors.confirm = '비밀번호가 일치하지 않아요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    if (isReset) {
      setMessage('비밀번호 재설정은 준비 중이에요. 이메일은 발송되지 않았어요.')
      return
    }
    setSubmitting(true)
    try {
      if (isSignup) await signup({ email: values.email.trim(), nickname: values.name.trim(), password: values.password })
      else await login({ email: values.email.trim(), password: values.password, remember })
    } catch (error) {
      const text = getErrorMessage(error)
      setValues(current => ({ ...current, password: '', confirm: '' }))
      if (text.includes('이메일')) setErrors({ email: text })
      else if (text.includes('닉네임')) setErrors({ name: text })
      else if (text.includes('비밀번호')) setErrors({ password: text })
      else setMessage(text)
    } finally {
      setSubmitting(false)
    }
  }
  const focusRing = 'focus-visible:outline-2 focus-visible:outline-auth-mint focus-visible:outline-offset-[4px]'
  const field = (name, label, icon, placeholder, type = 'text') => (
    <div className="flex flex-col" key={name}>
      <label className="text-[13px] inline-block font-[550] mb-[9px]" htmlFor={`auth-${name}`}>{label}</label>
      <div className={`flex items-center gap-[13px] min-h-[54px] px-[17px] bg-[#ffffff0d] border rounded-[10px] transition-[border-color,box-shadow] duration-150 focus-within:border-auth-mint focus-within:shadow-[0_0_0_3px_#35edbe10] ${errors[name] ? 'border-[#e97f86]' : 'border-[#ffffff2e]'}`}>
        <GSIcon name={icon} size={21} className="text-[#8499ad] shrink-0" />
        <input id={`auth-${name}`} name={name} type={type} value={values[name]} onChange={change} placeholder={placeholder} required
          autoComplete={name === 'email' ? 'email' : name === 'name' ? 'nickname' : isSignup ? 'new-password' : 'current-password'}
          onBlur={name === 'email' || name === 'name' ? checkAvailability : undefined}
          maxLength={name === 'name' ? 24 : name === 'email' ? 254 : 128}
          minLength={isSignup && name === 'password' ? 8 : undefined}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `auth-${name}-error` : undefined}
          className={`w-full min-w-0 py-[16px] text-[14px] text-auth-text bg-transparent border-0 outline-none placeholder:text-[#91a2b5] ${focusRing}`} />
        {name === 'password' && <button type="button" className={`grid place-items-center bg-transparent text-[#afc3d9] p-[10px] mr-[-9px] shrink-0 rounded-[6px] ${focusRing}`} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword}><GSIcon name={showPassword ? 'eyeOff' : 'eye'} size={21} /></button>}
      </div>
      {errors[name] && <p className="text-[12px] text-[#ff9e9e] mt-[7px]" id={`auth-${name}-error`}>{errors[name]}</p>}
    </div>
  )
  return (
    <AuthShell>
      <section className="auth-enter-copy max-[900px]:hidden" aria-label="GameSense 소개">
        <p className="text-[#b9d5c5] text-[11px] font-[600] tracking-[3px]">YOUR PLAY, YOUR STORY</p>
        <h2 className="mt-[22px] text-[clamp(36px,4.2vw,64px)] font-[400] leading-[1.35] tracking-[-2.6px] break-keep text-[#e8ece6] [text-shadow:0_2px_22px_#10171b55]">
          게임은 많으니까.<br /><em className="not-italic text-[#b9d5c5]">내 취향부터.</em>
        </h2>
        <p className="mt-[24px] text-[14px] font-[300] leading-[2] text-[#d5ded6] break-keep">
          스팀 계정을 연결하면 보유 게임과 플레이 시간으로<br />소비 패턴을 분석하고, 다음에 할 게임을 추천해 드려요.
        </p>
        <ol className="list-none p-0 mt-[40px] grid gap-[16px] text-[13px] text-[#c8d4cc]">
          {[
            ['user', '1', '계정 만들기', '이메일로 간단하게 시작해요.'],
            ['steam', '2', '스팀 연동', '필수 · 보유 게임을 불러와요.'],
            ['monitor', '3', '구매 내역 · PC 사양', '선택 · 넣으면 AI 분석이 더 정확해져요.'],
          ].map(([icon, number, title, text]) => (
            <li key={number} className="flex items-center gap-[14px]">
              <span className="grid place-items-center w-[38px] h-[38px] rounded-full border border-[#ffffff2e] bg-[#ffffff0a] text-[#b9dcc8] shrink-0"><GSIcon name={icon} size={18} /></span>
              <span><strong className="font-[600] text-[#e8ece6]">{title}</strong><br /><span className="text-[12px] text-[#a9b8ae]">{text}</span></span>
            </li>
          ))}
        </ol>
      </section>
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
            {isSignup && field('name', '닉네임', 'user', '어떻게 불러드릴까요?')}
            {field('email', '이메일', 'mail', '이메일 주소를 입력하세요', 'email')}
            {!isReset && field('password', '비밀번호', 'lock', isSignup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요', showPassword ? 'text' : 'password')}
            {isSignup && field('confirm', '비밀번호 확인', 'lock', '비밀번호를 한 번 더 입력하세요', showPassword ? 'text' : 'password')}
            {mode === 'login' && (
              <div className="flex justify-between items-center gap-[12px] text-[12px]">
                <label className="flex items-center gap-[10px] cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} className="w-[18px] h-[18px] accent-auth-mint cursor-pointer shrink-0" />
                  로그인 상태 유지
                </label>
                <Link to={authLink('forgot-password', returnTo)} className={`text-auth-muted underline-offset-[4px] hover:text-auth-mint hover:underline ${focusRing}`}>비밀번호 찾기</Link>
              </div>
            )}
            <button type="submit" className={`flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] disabled:opacity-70 ${focusRing}`} disabled={submitting} aria-busy={submitting}>
              {submitting ? '처리 중...' : isSignup ? '가입하고 스팀 연동하기' : copy.action}<GSIcon name="arrow" size={20} />
            </button>
          </form>
          <div role="status" aria-live="polite">{message && <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] mt-[18px]"><GSIcon name="info" size={18} className="mt-[2px] shrink-0" />{message}</p>}</div>
          <p className="flex flex-wrap justify-center gap-[7px] mt-[22px] text-auth-muted text-[12px]">{mode === 'login' ? <>아직 계정이 없으신가요? <Link to={authLink('signup', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${focusRing}`}>회원가입</Link></> : <Link to={authLink('login', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${focusRing}`}>로그인으로 돌아가기 <span aria-hidden="true">→</span></Link>}</p>
        </div>
      </section>
    </AuthShell>
  )
}
