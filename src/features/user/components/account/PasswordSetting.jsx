import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { ACTION_BUTTON } from './accountStyles'
import Feedback from './Feedback'

// 비밀번호 변경: 현재 비밀번호 확인 + 새 비밀번호(8자 이상)
export default function PasswordSetting({ actions }) {
  const { updateAccount } = useAuth()
  const { busy, results, setResult, run } = actions
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const savePassword = event => {
    event.preventDefault()
    if (!passwords.currentPassword) return setResult('password', '현재 비밀번호를 입력해주세요.', true)
    if (passwords.newPassword.length < 8) return setResult('password', '새 비밀번호는 8자 이상 입력해주세요.', true)
    run('password', async () => {
      await updateAccount(passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      setResult('password', '비밀번호를 변경했어요.')
    })
  }

  return (
    <section>
      <div>
        <h3>비밀번호 변경</h3>
        <small>보안을 위해 현재 비밀번호를 한 번 더 확인해요.</small>
      </div>
      <form className="flex flex-wrap items-center gap-[8px]" onSubmit={savePassword}>
        <input
          className="min-w-0 w-[200px] h-[40px] px-[16px] rounded-full border-0 bg-bg text-text text-[14px] max-[700px]:w-full"
          type="password" aria-label="현재 비밀번호" placeholder="현재 비밀번호" autoComplete="current-password" value={passwords.currentPassword}
          onChange={event => setPasswords(current => ({ ...current, currentPassword: event.target.value }))} />
        <input
          className="min-w-0 w-[200px] h-[40px] px-[16px] rounded-full border-0 bg-bg text-text text-[14px] max-[700px]:w-full"
          type="password" aria-label="새 비밀번호" placeholder="새 비밀번호 (8자 이상)" autoComplete="new-password" minLength={8} value={passwords.newPassword}
          onChange={event => setPasswords(current => ({ ...current, newPassword: event.target.value }))} />
        <button type="submit" className={ACTION_BUTTON} disabled={busy === 'password'}>
          {busy === 'password' ? '변경 중...' : '비밀번호 변경'}
        </button>
        <Feedback result={results.password} />
      </form>
    </section>
  )
}
