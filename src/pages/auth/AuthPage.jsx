import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import GSIcon from '../../components/discover/GSIcon'
import { useAuth } from '../../contexts/AuthContext'
import { authLink, safeReturnTo } from '../../features/auth/authSession'
import '../../styles/auth.css'

const content = {
  login: { eyebrow: 'WELCOME BACK', title: '다시 만나 반가워요', subtitle: 'GameSense에서 나의 게임 라이프를 이어가세요.', action: '로그인' },
  signup: { eyebrow: 'YOUR NEXT CHAPTER', title: '새로운 모험의 시작', subtitle: '당신만의 게임 라이프를 만들어보세요.', action: '회원가입' },
  'forgot-password': { eyebrow: 'LET’S GET YOU BACK', title: '비밀번호를 잊으셨나요?', subtitle: '가입할 때 사용한 이메일 주소를 입력해주세요.', action: '재설정 링크 받기' },
}

function GoogleIcon() {
  return <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.97-3.38.97-2.61 0-4.82-1.77-5.61-4.15H3.04v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.39 13.9a6 6 0 0 1 0-3.8V7.51H3.04a10 10 0 0 0 0 8.98l3.35-2.59Z" /><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.59C7.18 7.72 9.39 5.95 12 5.95Z" /></svg>
}

export default function AuthPage({ mode = 'login' }) {
  const copy = content[mode]
  const isSignup = mode === 'signup'
  const isReset = mode === 'forgot-password'
  const { isDemoSignedIn, startDemo } = useAuth()
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

  if (isDemoSignedIn) return <Navigate to={returnTo} replace />

  const change = event => {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    setMessage('')
  }
  const submit = event => {
    event.preventDefault()
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
    setValues(current => ({ ...current, password: '', confirm: '' }))
    setMessage(isReset
      ? '비밀번호 재설정은 준비 중이에요. 이메일은 발송되지 않았어요.'
      : isSignup
        ? '입력 내용을 확인했어요. 아직 실제 계정은 생성되지 않아요. 아래에서 데모를 체험해보세요.'
        : '계정 로그인은 준비 중이에요. 아래 데모 체험으로 로그인 후 화면을 둘러보세요.')
  }
  const field = (name, label, icon, placeholder, type = 'text') => (
    <div className="auth-field" key={name}>
      <label htmlFor={`auth-${name}`}>{label}</label>
      <div className={`auth-input ${errors[name] ? 'has-error' : ''}`}>
        <GSIcon name={icon} size={21} />
        <input id={`auth-${name}`} name={name} type={type} value={values[name]} onChange={change} placeholder={placeholder} required
          autoComplete={name === 'email' ? 'email' : name === 'name' ? 'nickname' : isSignup ? 'new-password' : 'current-password'}
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
            {location.state?.loginRequired && <p className="auth-context"><GSIcon name="lock" size={16} />이 기능은 로그인 후 이용할 수 있어요. 데모로 먼저 체험해보세요.</p>}
            <form ref={formRef} className="auth-form" onSubmit={submit} noValidate>
              {isSignup && field('name', '닉네임', 'user', '어떻게 불러드릴까요?')}
              {field('email', '이메일', 'mail', '이메일 주소를 입력하세요', 'email')}
              {!isReset && field('password', '비밀번호', 'lock', isSignup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요', showPassword ? 'text' : 'password')}
              {isSignup && field('confirm', '비밀번호 확인', 'lock', '비밀번호를 한 번 더 입력하세요', showPassword ? 'text' : 'password')}
              {mode === 'login' && <div className="auth-options"><label className="auth-remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />로그인 상태 유지</label><Link to={authLink('forgot-password', returnTo)}>비밀번호 찾기</Link></div>}
              <button type="submit" className="auth-primary">{copy.action}<GSIcon name="arrow" size={20} /></button>
            </form>
            {!isReset && <><div className="auth-divider"><span>또는</span></div><div className="auth-socials">
              <button type="button" onClick={() => setMessage('Steam 로그인은 준비 중이에요. 계정 연결 없이 아래 데모를 체험할 수 있어요.')}><GSIcon name="steam" size={23} /><span>Steam으로 계속하기</span></button>
              <button type="button" onClick={() => setMessage('Google 로그인은 준비 중이에요. 계정 연결 없이 아래 데모를 체험할 수 있어요.')}><GoogleIcon /><span>Google로 계속하기</span></button>
            </div></>}
            <div className="auth-message" role="status" aria-live="polite">{message && <p><GSIcon name="info" size={18} />{message}</p>}</div>
            <p className="auth-switch">{mode === 'login' ? <>아직 계정이 없으신가요? <Link to={authLink('signup', returnTo)}>회원가입</Link></> : <Link to={authLink('login', returnTo)}>로그인으로 돌아가기 <span aria-hidden="true">→</span></Link>}</p>
            <div className="auth-demo"><span>계정 없이 먼저 만나보세요</span><button type="button" onClick={() => { startDemo(remember); navigate(returnTo, { replace: true }) }}>데모 체험하기<GSIcon name="arrow" size={16} /></button><small>실제 로그인·회원가입은 준비 중이에요.</small></div>
          </div>
        </section>
      </main>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} GameSense</span><div>{['이용약관', '개인정보처리방침'].map(label => <button key={label} type="button" onClick={() => { setPolicy(label); policyRef.current.showModal() }}>{label}</button>)}</div></footer>
      <dialog ref={policyRef} className="auth-policy" aria-labelledby="auth-policy-title" onClick={event => { if (event.target === event.currentTarget) policyRef.current.close() }}>
        <div><h2 id="auth-policy-title">{policy} 안내</h2><p>현재 GameSense는 화면을 체험하는 데모입니다. 정식 서비스의 {policy}은 준비 중이에요.</p><p>입력한 이메일과 비밀번호는 서버로 전송하거나 브라우저 저장소에 저장하지 않습니다. 데모 체험 상태와 게임 취향·기록은 이 브라우저에서만 사용됩니다.</p><button type="button" className="auth-primary" onClick={() => policyRef.current.close()}>확인</button></div>
      </dialog>
    </div>
  )
}
