// 로그인·가입·비밀번호 찾기 폼의 입력 검사 (화면과 무관한 순수 함수)

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 칸 이름 → 잘못된 이유. 비어 있으면 통과
export function validateAuthForm(values, { isSignup, isReset }) {
  const errors = {}
  if (isSignup && values.name.trim().length < 2) errors.name = '닉네임을 2자 이상 입력해주세요.'
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = '올바른 이메일 주소를 입력해주세요.'
  if (!isReset && !values.password) errors.password = '비밀번호를 입력해주세요.'
  else if (isSignup && values.password.length < 8) errors.password = '비밀번호는 8자 이상 입력해주세요.'
  if (isSignup && values.confirm !== values.password) errors.confirm = '비밀번호가 일치하지 않아요.'
  return errors
}

// 서버 오류 문구가 어느 칸 이야기인지: 'email' | 'name' | 'password' | null(폼 전체 안내)
export function errorFieldOf(text) {
  if (text.includes('이메일')) return 'email'
  if (text.includes('닉네임')) return 'name'
  if (text.includes('비밀번호')) return 'password'
  return null
}
