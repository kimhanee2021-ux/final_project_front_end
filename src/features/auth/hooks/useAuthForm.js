import { useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { checkEmailAvailability, checkNicknameAvailability } from '../api'
import { useAuth } from '../context/AuthContext'
import { EMAIL_PATTERN, errorFieldOf, validateAuthForm } from '../model/authForm'

// 로그인·가입·비밀번호 찾기 폼 상태: 입력값, 칸별 오류, 안내 문구, 제출.
// 가입 폼은 이메일·닉네임 칸을 벗어날 때 중복을 바로 확인한다. 잘못된 칸이 있으면 첫 칸으로 포커스를 옮긴다(formRef).
export function useAuthForm(mode) {
  const isSignup = mode === 'signup'
  const isReset = mode === 'forgot-password'
  const { login, signup } = useAuth()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

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
    if (name === 'email' && EMAIL_PATTERN.test(value)) {
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
    const nextErrors = validateAuthForm(values, { isSignup, isReset })
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
      const field = errorFieldOf(text)
      if (field) setErrors({ [field]: text })
      else setMessage(text)
    } finally {
      setSubmitting(false)
    }
  }

  return { formRef, values, errors, showPassword, setShowPassword, remember, setRemember, message, submitting, change, checkAvailability, submit }
}
