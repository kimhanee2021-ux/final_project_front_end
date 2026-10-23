import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { ACTION_BUTTON } from './accountStyles'
import Feedback from './Feedback'

// 닉네임 변경 (2자 이상, 지금과 달라야 한다)
export default function NicknameSetting({ actions }) {
  const { user, updateAccount } = useAuth()
  const { busy, results, setResult, run } = actions
  const [nickname, setNickname] = useState(user.nickname)
  const saveNickname = event => {
    event.preventDefault()
    const value = nickname.trim()
    if (value.length < 2) return setResult('nickname', '닉네임을 2자 이상 입력해주세요.', true)
    if (value === user.nickname) return setResult('nickname', '현재 닉네임과 같아요.', true)
    run('nickname', async () => {
      await updateAccount({ nickname: value })
      setResult('nickname', '닉네임을 변경했어요.')
    })
  }

  return (
    <section>
      <div>
        <h3>닉네임</h3>
        <small>다른 사용자와 중복될 수 없어요.</small>
      </div>
      <form className="flex flex-wrap items-center gap-[8px]" onSubmit={saveNickname}>
        <input
          className="min-w-0 w-[220px] h-[40px] px-[16px] rounded-full border-0 bg-bg text-text text-[14px] max-[700px]:w-full"
          aria-label="새 닉네임"
          value={nickname}
          maxLength={24}
          autoComplete="nickname"
          onChange={event => setNickname(event.target.value)}
        />
        <button type="submit" className={ACTION_BUTTON} disabled={busy === 'nickname'}>
          {busy === 'nickname' ? '저장 중...' : '닉네임 변경'}
        </button>
        <Feedback result={results.nickname} />
      </form>
    </section>
  )
}
