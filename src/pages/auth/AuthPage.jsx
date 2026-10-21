import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useAuth, authLink, safeReturnTo, checkEmailAvailability, checkNicknameAvailability } from '@/features/auth'
import { getErrorMessage } from '@/shared/lib/apiClient'

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
  const [policy, setPolicy] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)
  const policyRef = useRef(null)
  const titleRef = useRef(null)
  useEffect(() => {
    const previous = document.title
    document.title = `${copy.action} | GameSense`
    window.scrollTo(0, 0)
    titleRef.current?.focus({ preventScroll: true })
    return () => { document.title = previous }
  }, [copy.action])

  // 로그인/가입이 성공하면 isAuthenticated가 바뀌면서 여기서 원래 보던 화면으로 돌아간다.
  if (isAuthenticated) return <Navigate to={returnTo} replace />

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
      <div className={`flex items-center gap-[13px] min-h-[54px] px-[17px] bg-[#151f28] border rounded-[10px] transition-[border-color,box-shadow] duration-150 focus-within:border-auth-mint focus-within:shadow-[0_0_0_3px_#35edbe10] ${errors[name] ? 'border-[#e97f86]' : 'border-auth-border'}`}>
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
    <div className="min-h-[100svh] bg-auth-bg text-auth-text px-[clamp(24px,3.5vw,64px)] flex flex-col max-[800px]:px-[24px] max-[420px]:px-[20px]">
      <a className="fixed left-[16px] top-[-80px] z-[100] p-[12px] bg-surface focus:top-[10px]" href="#auth-main">본문으로 이동</a>
      <header className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-[20px] shrink-0 min-h-[105px] max-[800px]:min-h-[90px] max-[420px]:min-h-[82px] max-[420px]:gap-[12px]">
        <Link to="/" className={`inline-flex gap-[14px] items-center max-[420px]:gap-[9px] ${focusRing}`} aria-label="GameSense 홈">
          <GSIcon name="gamepad" size={49} className="text-auth-mint shrink-0 max-[800px]:w-[40px] max-[420px]:w-[35px]" />
          <span className="flex flex-col">
            <strong className="text-[28px] leading-[1.15] font-[760] tracking-[-1px] max-[800px]:text-[24px] max-[420px]:text-[22px]">GameSense</strong>
            <small className="text-auth-muted text-[12px] mt-[4px] max-[420px]:text-[10px]">Play Smarter</small>
          </span>
        </Link>
        <Link to="/" className={`inline-flex items-center gap-[10px] text-auth-muted text-[13px] py-[10px] hover:text-auth-mint max-[420px]:text-[11px] max-[420px]:gap-[5px] ${focusRing}`}>
          <GSIcon name="arrowLeft" size={19} className="max-[420px]:w-[15px]" />
          <span>홈으로 돌아가기</span>
        </Link>
      </header>
      <main className="p-0 w-full max-w-[1600px] mx-auto grid grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)] gap-[clamp(38px,4vw,72px)] flex-1 max-[1100px]:gap-[34px] max-[1100px]:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)] max-[800px]:grid-cols-1 max-[800px]:gap-0" id="auth-main">
        <section
          className="relative isolate min-h-[720px] border border-[#34434b] rounded-[20px] overflow-hidden flex flex-col justify-between p-[clamp(28px,3vw,48px)] bg-[#15252e] min-[1600px]:min-h-[800px] max-[1100px]:p-[30px] max-[800px]:hidden after:content-[''] after:absolute after:inset-0 after:-z-[1] after:bg-[linear-gradient(180deg,#04131b22_0%,#06101a00_30%,#07111980_58%,#0c1218fa_100%)]"
          aria-label="GameSense 소개"
        >
          <img src="/images/fantasy-world.png" className="w-full h-full absolute inset-0 -z-[2] object-cover object-[66%_center]" alt="" fetchPriority="high" />
          <p className="text-[#6af6d3] text-[11px] font-[750] tracking-[3px] [text-shadow:0_2px_10px_#000]">YOUR PLAY, YOUR STORY</p>
          <div className="pt-[240px]">
            <h2 className="text-[clamp(29px,2.8vw,46px)] font-[750] tracking-[-1.8px] leading-[1.36] break-keep text-balance max-[1100px]:text-[32px]">좋은 게임이<br />더 좋은 일상을 만든다.</h2>
            <p className="mt-[19px] text-[#c0d0df] text-[15px] leading-[1.75] break-keep">당신의 취향에 맞는 다음 모험을 만나보세요.</p>
            <ul className="list-none p-0 mt-[42px] mb-[5px] flex flex-wrap gap-[20px_26px] max-[1100px]:flex-col max-[1100px]:gap-[16px]">
              <li className="inline-flex items-center gap-[10px] text-[12px] text-[#c1d1e1] whitespace-nowrap"><GSIcon name="compass" className="text-[#a8bfd5]" />맞춤 게임 추천</li>
              <li className="inline-flex items-center gap-[10px] text-[12px] text-[#c1d1e1] whitespace-nowrap"><GSIcon name="book" className="text-[#a8bfd5]" />나만의 라이브러리</li>
              <li className="inline-flex items-center gap-[10px] text-[12px] text-[#c1d1e1] whitespace-nowrap"><GSIcon name="chart" className="text-[#a8bfd5]" />플레이 기록</li>
            </ul>
          </div>
        </section>
        <section className="flex items-center justify-center py-[28px] min-w-0 max-[800px]:pt-[35px] max-[800px]:pb-[40px] max-[420px]:pt-[27px]" aria-labelledby="auth-title">
          <div className="w-full max-w-[440px] max-[800px]:max-w-[430px]">
            <p className="text-[#6af6d3] text-[11px] font-[750] tracking-[3px]">{copy.eyebrow}</p>
            <h1
              className="text-[clamp(27px,2.35vw,38px)] leading-[1.3] tracking-[-1.3px] mt-[19px] mb-[13px] font-[750] break-keep outline-none max-[800px]:text-[32px] max-[420px]:text-[28px]"
              id="auth-title" ref={titleRef} tabIndex={-1}
            >{copy.title}</h1>
            <p className="text-[14px] text-auth-muted leading-[1.75] break-keep max-[420px]:text-[12px]">{copy.subtitle}</p>
            {location.state?.loginRequired && (
              <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] mt-[20px]">
                <GSIcon name="lock" size={16} className="mt-[2px] shrink-0" />
                이 기능은 로그인 후 이용할 수 있어요. 계정이 없다면 데모로 먼저 체험해보세요.
              </p>
            )}
            <form ref={formRef} className="mt-[34px] flex flex-col gap-[20px]" onSubmit={submit} noValidate>
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
              <button type="submit" className={`flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] ${focusRing}`} disabled={submitting} aria-busy={submitting}>{submitting ? '처리 중...' : copy.action}<GSIcon name="arrow" size={20} /></button>
            </form>
            <div role="status" aria-live="polite">{message && <p className="flex items-start gap-[9px] px-[14px] py-[12px] border border-[#28483f] rounded-[9px] bg-[#10231f] text-[12px] leading-[1.7] text-[#c0e3d9] mt-[18px]"><GSIcon name="info" size={18} className="mt-[2px] shrink-0" />{message}</p>}</div>
            <p className="flex flex-wrap justify-center gap-[7px] mt-[24px] text-auth-muted text-[12px]">{mode === 'login' ? <>아직 계정이 없으신가요? <Link to={authLink('signup', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${focusRing}`}>회원가입</Link></> : <Link to={authLink('login', returnTo)} className={`text-[#6af6d3] font-semibold underline-offset-[4px] hover:underline ${focusRing}`}>로그인으로 돌아가기 <span aria-hidden="true">→</span></Link>}</p>
          </div>
        </section>
      </main>
      <footer className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-[20px] shrink-0 min-h-[80px] text-[11px] text-[#94a3b6] max-[800px]:min-h-[74px] max-[420px]:flex-wrap max-[420px]:justify-center max-[420px]:gap-[3px] max-[420px]:py-[16px]">
        <span className="max-[420px]:w-full max-[420px]:text-center">© {new Date().getFullYear()} GameSense</span>
        <div className="flex gap-[20px]">{['이용약관', '개인정보처리방침'].map(label => <button key={label} type="button" className={`py-[8px] bg-transparent text-[11px] hover:text-auth-text ${focusRing}`} onClick={() => { setPolicy(label); policyRef.current.showModal() }}>{label}</button>)}</div>
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
          <p className="text-auth-muted text-[13px] leading-[1.9] mt-[17px] break-keep">입력한 이메일과 비밀번호는 로그인·회원가입을 위해 GameSense 서버로 전송되며, 비밀번호는 암호화되어 저장됩니다. 로그인 토큰은 이 브라우저에 저장되고, 데모 체험 상태와 게임 취향·기록은 이 브라우저에서만 사용됩니다.</p>
          <button type="button" className={`flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] mt-[24px] ${focusRing}`} onClick={() => policyRef.current.close()}>확인</button>
        </div>
      </dialog>
    </div>
  )
}
