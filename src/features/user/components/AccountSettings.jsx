import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'
import { getErrorMessage } from '../../../utils/apiClient'

function Feedback({ result }) {
  if (!result) return null
  return (
    <p
      className={`basis-full text-[11px] text-gs-muted ${result.error ? 'text-[#ff7d8a]' : ''}`}
      role={result.error ? 'alert' : 'status'}
    >
      {result.text}
    </p>
  )
}

// 설정 화면(.gs-settings-panel) 안에 들어가는 계정 섹션들. 실제 로그인한 경우에만 렌더링한다.
export default function AccountSettings() {
  const { user, updateAccount, deleteAccount, startSteamLink } = useAuth()
  const { notify } = useGameSense()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(user.nickname)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [busy, setBusy] = useState('')
  const [results, setResults] = useState({})
  const setResult = (key, text, error = false) => setResults(current => ({ ...current, [key]: { text, error } }))

  const run = async (key, task) => {
    setBusy(key)
    setResults(current => ({ ...current, [key]: null }))
    try {
      await task()
    } catch (error) {
      setResult(key, getErrorMessage(error), true)
    } finally {
      setBusy('')
    }
  }

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

  const withdraw = () => {
    if (!window.confirm('정말 탈퇴할까요? 계정과 동기화된 스팀 보유 게임 정보가 모두 삭제되며 되돌릴 수 없어요.')) return
    run('delete', async () => {
      await deleteAccount()
      notify('회원 탈퇴가 완료되었어요.')
      navigate('/', { replace: true })
    })
  }

  return (
    <>
      <section>
        <div>
          <h2>내 계정</h2>
          <p>{user.email} · 닉네임은 다른 사용자와 중복될 수 없어요.</p>
        </div>
        <form className="flex flex-wrap items-center gap-[8px]" onSubmit={saveNickname}>
          <input
            className="min-w-0 w-[180px] p-[10px_12px] rounded-[9px] border border-gs-border bg-gs-raised text-gs-text text-[12px] max-[700px]:w-full"
            aria-label="새 닉네임"
            value={nickname}
            maxLength={24}
            autoComplete="nickname"
            onChange={event => setNickname(event.target.value)}
          />
          <button type="submit" className="gs-secondary-button" disabled={busy === 'nickname'}>
            {busy === 'nickname' ? '저장 중...' : '닉네임 변경'}
          </button>
          <Feedback result={results.nickname} />
        </form>
      </section>
      <section>
        <div>
          <h2>비밀번호 변경</h2>
          <p>보안을 위해 현재 비밀번호를 한 번 더 확인해요.</p>
        </div>
        <form className="flex flex-wrap items-center gap-[8px]" onSubmit={savePassword}>
          <input
            className="min-w-0 w-[180px] p-[10px_12px] rounded-[9px] border border-gs-border bg-gs-raised text-gs-text text-[12px] max-[700px]:w-full"
            type="password" aria-label="현재 비밀번호" placeholder="현재 비밀번호" autoComplete="current-password" value={passwords.currentPassword}
            onChange={event => setPasswords(current => ({ ...current, currentPassword: event.target.value }))} />
          <input
            className="min-w-0 w-[180px] p-[10px_12px] rounded-[9px] border border-gs-border bg-gs-raised text-gs-text text-[12px] max-[700px]:w-full"
            type="password" aria-label="새 비밀번호" placeholder="새 비밀번호 (8자 이상)" autoComplete="new-password" minLength={8} value={passwords.newPassword}
            onChange={event => setPasswords(current => ({ ...current, newPassword: event.target.value }))} />
          <button type="submit" className="gs-secondary-button" disabled={busy === 'password'}>
            {busy === 'password' ? '변경 중...' : '비밀번호 변경'}
          </button>
          <Feedback result={results.password} />
        </form>
      </section>
      <section>
        <div>
          <h2>Steam 계정 연동</h2>
          <p>스팀 로그인 페이지로 이동해 계정을 연결합니다. 이미 연동했다면 다른 스팀 계정으로 바꿀 수 있어요.</p>
        </div>
        <button type="button" className="gs-secondary-button" onClick={startSteamLink}>
          <GSIcon name="steam" size={17} />
          Steam 연동하기
        </button>
      </section>
      <section>
        <div>
          <h2>회원 탈퇴</h2>
          <p>계정과 동기화된 보유 게임 정보가 영구 삭제됩니다.</p>
          <Feedback result={results.delete} />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-[8px] p-[10px_18px] rounded-[25px] border border-[#ff7d8a80] text-[#ff7d8a] bg-transparent text-[12px] font-[650]"
          onClick={withdraw}
          disabled={busy === 'delete'}
        >
          {busy === 'delete' ? '처리 중...' : '회원 탈퇴'}
        </button>
      </section>
    </>
  )
}
