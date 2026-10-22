import test from 'node:test'
import assert from 'node:assert/strict'
import { errorFieldOf, validateAuthForm } from '../src/features/auth/model/authForm.js'

const values = { name: '게이머', email: 'me@example.com', password: 'password1', confirm: 'password1' }

test('signup checks nickname length, email, 8+ char password and matching confirmation', () => {
  assert.deepEqual(validateAuthForm(values, { isSignup: true, isReset: false }), {})
  const errors = validateAuthForm({ name: 'a', email: 'nope', password: 'short', confirm: 'x' }, { isSignup: true, isReset: false })
  assert.deepEqual(Object.keys(errors), ['name', 'email', 'password', 'confirm'])
})
test('login only needs an email and any password, reset only an email', () => {
  assert.deepEqual(validateAuthForm({ ...values, password: 'x', name: '' }, { isSignup: false, isReset: false }), {})
  assert.deepEqual(validateAuthForm({ ...values, password: '' }, { isSignup: false, isReset: true }), {})
  assert.ok(validateAuthForm({ ...values, password: '' }, { isSignup: false, isReset: false }).password)
})
test('server messages are routed to the field they talk about', () => {
  assert.equal(errorFieldOf('이미 가입된 이메일입니다.'), 'email')
  assert.equal(errorFieldOf('닉네임이 중복돼요'), 'name')
  assert.equal(errorFieldOf('비밀번호가 틀렸어요'), 'password')
  assert.equal(errorFieldOf('서버 오류'), null)
})
