import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/discover/GSIcon'
import { useAuth } from '../../contexts/AuthContext'
import { authLink, safeReturnTo } from '../../features/auth/authSession'
import { checkEmailAvailability, checkNicknameAvailability } from '../../features/auth/api'
import { getErrorMessage } from '../../utils/apiClient'
import '../../styles/auth.css'

const content = {
  login: { eyebrow: 'WELCOME BACK', title: '다시 만나 반가워요', subtitle: 'GameSense에서 나의 게임 라이프를 이어가세요.', action: '로그인' },
  signup: { eyebrow: 'YOUR NEXT CHAPTER', title: '새로운 모험의 시작', subtitle: '당신만의 게임 라이프를 만들어보세요.', action: '회원가입' },
  'forgot-password': { eyebrow: 'LET’S GET YOU BACK', title: '비밀번호를 잊으셨나요?', subtitle: '가입할 때 사용한 이메일 주소를 입력해주세요.', action: '재설정 링크 받기' },
}

export default function AuthPage({ mode = 'login' }) {
  const copy = content[mode]
  const isSignup = mode === 'signup'
  const isReset = mode === 'forgot-password'
  const { isSignedIn, login, signup, startDemo } = useAuth()
  const navigate = useNavigate()
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

  // 로그인/가입이 성공하면 isSignedIn이 바뀌면서 여기서 원래 보던 화면으로 돌아간다.
  if (isSignedIn) return <Navigate to={returnTo} replace />

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
  const field = (name, label, icon, placeholder, type = 'text') => (
    <div className="auth-field" key={name}>
      <label htmlFor={`auth-${name}`}>{label}</label>
      <div className={`auth-input ${errors[name] ? 'has-error' : ''}`}>
        <GSIcon name={icon} size={21} />
        <input id={`auth-${name}`} name={name} type={type} value={values[name]} onChange={change} placeholder={placeholder} required
          autoComplete={name === 'email' ? 'email' : name === 'name' ? 'nickname' : isSignup ? 'new-password' : 'current-password'}
          onBlur={name === 'email' || name === 'name' ? checkAvailability : undefined}
          maxLength={name === 'name' ? 24 : name === 'email' ? 254 : 128}
          minLength={isSignup && name === 'password' ? 8 : undefined}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `auth-${name}-error` : undefined} />
        {name === 'password' && <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword}><GSIcon name={showPassword ? 'eyeOff' : 'eye'} size={21} /></button>}
      </div>
      {errors[name] && <p className="auth-error" id={`auth-${name}-error`}>{errors[name]}</p>}
    </div>
  )
  return (
    <div className="auth-page">
      <a className="skip-link" href="#auth-main">본문으로 이동</a>
      <header className="auth-header">
        <Link to="/" className="auth-brand" aria-label="GameSense 홈"><GSIcon name="gamepad" size={49} /><span><strong>GameSense</strong><small>Play Smarter</small></span></Link>
        <Link to="/" className="auth-home"><GSIcon name="arrowLeft" size={19} /><span>홈으로 돌아가기</span></Link>
      </header>
      <main className="auth-main" id="auth-main">
        <section className="auth-story" aria-label="GameSense 소개">
          <img src="/images/fantasy-world.png" className="auth-story-image" alt="" fetchPriority="high" />
          <p className="auth-story-eyebrow">YOUR PLAY, YOUR STORY</p>
          <div className="auth-story-copy"><h2>좋은 게임이<br />더 좋은 일상을 만든다.</h2><p>당신의 취향에 맞는 다음 모험을 만나보세요.</p>
            <ul className="auth-benefits"><li><GSIcon name="compass" />맞춤 게임 추천</li><li><GSIcon name="book" />나만의 라이브러리</li><li><GSIcon name="chart" />플레이 기록</li></ul>
          </div>
        </section>
        <section className="auth-form-panel" aria-labelledby="auth-title">
          <div className="auth-form-content">
            <p className="auth-eyebrow">{copy.eyebrow}</p>
            <h1 id="auth-title" ref={titleRef} tabIndex={-1}>{copy.title}</h1>
            <p className="auth-subtitle">{copy.subtitle}</p>
            {location.state?.loginRequired && <p className="auth-context"><GSIcon name="lock" size={16} />이 기능은 로그인 후 이용할 수 있어요. 계정이 없다면 데모로 먼저 체험해보세요.</p>}
            <form ref={formRef} className="auth-form" onSubmit={submit} noValidate>
              {isSignup && field('name', '닉네임', 'user', '어떻게 불러드릴까요?')}
              {field('email', '이메일', 'mail', '이메일 주소를 입력하세요', 'email')}
              {!isReset && field('password', '비밀번호', 'lock', isSignup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요', showPassword ? 'text' : 'password')}
              {isSignup && field('confirm', '비밀번호 확인', 'lock', '비밀번호를 한 번 더 입력하세요', showPassword ? 'text' : 'password')}
              {mode === 'login' && <div className="auth-options"><label className="auth-remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />로그인 상태 유지</label><Link to={authLink('forgot-password', returnTo)}>비밀번호 찾기</Link></div>}
              <button type="submit" className="auth-primary" disabled={submitting} aria-busy={submitting}>{submitting ? '처리 중...' : copy.action}<GSIcon name="arrow" size={20} /></button>
            </form>
            <div className="auth-message" role="status" aria-live="polite">{message && <p><GSIcon name="info" size={18} />{message}</p>}</div>
            <p className="auth-switch">{mode === 'login' ? <>아직 계정이 없으신가요? <Link to={authLink('signup', returnTo)}>회원가입</Link></> : <Link to={authLink('login', returnTo)}>로그인으로 돌아가기 <span aria-hidden="true">→</span></Link>}</p>
            <div className="auth-demo"><span>계정 없이 먼저 만나보세요</span><button type="button" onClick={() => { startDemo(remember); navigate(returnTo, { replace: true }) }}>데모 체험하기<GSIcon name="arrow" size={16} /></button><small>데모는 서버 계정 없이 이 브라우저에서만 동작해요.</small></div>
          </div>
        </section>
      </main>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} GameSense</span><div>{['이용약관', '개인정보처리방침'].map(label => <button key={label} type="button" onClick={() => { setPolicy(label); policyRef.current.showModal() }}>{label}</button>)}</div></footer>
      <dialog ref={policyRef} className="auth-policy" aria-labelledby="auth-policy-title" onClick={event => { if (event.target === event.currentTarget) policyRef.current.close() }}>
        <div><h2 id="auth-policy-title">{policy} 안내</h2><p>정식 서비스의 {policy}은 준비 중이에요.</p><p>입력한 이메일과 비밀번호는 로그인·회원가입을 위해 GameSense 서버로 전송되며, 비밀번호는 암호화되어 저장됩니다. 로그인 토큰은 이 브라우저에 저장되고, 데모 체험 상태와 게임 취향·기록은 이 브라우저에서만 사용됩니다.</p><button type="button" className="auth-primary" onClick={() => policyRef.current.close()}>확인</button></div>
      </dialog>
    </div>
  )
}
