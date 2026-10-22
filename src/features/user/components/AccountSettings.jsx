import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import { GSIcon, Panel } from '@/shared/ui'
import { resetSteamLibraryCache } from '@/features/library'
import { PurchaseImportDialog } from '@/features/purchaseImport'
import { usePcSpecs } from '@/features/performance'
import { useMySpendingContext } from '@/features/spending'
import { getErrorMessage } from '@/shared/lib/apiClient'

// 계정 섹션의 버튼은 모두 같은 모양(보조 버튼 + 아이콘)으로 통일한다.
// gs-secondary-button은 12px·굵기 750이라 한글이 뭉개져 보여서, 이 섹션에서는 글자를 키우고 굵기를 낮춘다
// (gamesense.css는 레이어 밖 규칙이라 Tailwind 유틸리티가 이기려면 !가 필요하다).
const ACTION_BUTTON = 'gs-secondary-button disabled:opacity-60 !text-[14px] !font-[600] !tracking-normal !min-h-[40px] !px-[20px] antialiased'

function Feedback({ result }) {
  if (!result) return null
  return (
    <p
      className={`basis-full text-[13px] text-muted ${result.error ? 'text-[#e5484d]' : ''}`}
      role={result.error ? 'alert' : 'status'}
    >
      {result.text}
    </p>
  )
}

// 설정 화면(.gs-settings-panel) 안에 들어가는 계정 섹션들. 실제 로그인한 경우에만 렌더링한다.
export default function AccountSettings() {
  const { user, updateAccount, deleteAccount, startSteamLink, unlinkSteam } = useAuth()
  const { data, loading, notLinked, reload } = useMySpendingContext()
  const { hasSavedSpecs, openSpecDialog } = usePcSpecs()
  const [importOpen, setImportOpen] = useState(false)
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

  // 스팀 연동 상태는 소비 분석 데이터에서 읽는다 (데이터가 있으면 연동됨, 연동 안 됨 오류면 미연동).
  const steamLinked = Boolean(data) && !notLinked
  const hasHistory = Boolean(data?.hasPurchaseHistory)

  const disconnectSteam = () => {
    if (!window.confirm('스팀 연동을 해제할까요? 불러온 보유 게임 목록이 지워지고, 다시 연동하면 새로 불러와요.')) return
    run('steam', async () => {
      await unlinkSteam()
      resetSteamLibraryCache()
      await reload()
      notify('스팀 연동을 해제했어요.')
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
    <Panel id="account">
      <h2 className="text-[clamp(24px,2.8vw,32px)] font-[750] tracking-[-1px] leading-[1.3]">내 계정</h2>
      <p className="mt-[8px] text-[14px] text-muted">
        아이디(이메일) <strong className="ml-[6px] text-text font-[600]">{user.email}</strong>
      </p>
      <div className="mt-[28px] [&>section]:grid [&>section]:grid-cols-[200px_1fr] [&>section]:gap-[16px] [&>section]:items-center [&>section]:py-[22px] [&>section]:border-t [&>section]:border-border max-[700px]:[&>section]:grid-cols-1 [&_h3]:text-[16px] [&_h3]:font-[650] [&_small]:block [&_small]:mt-[4px] [&_small]:text-[13px] [&_small]:text-muted [&_small]:font-normal">
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
        <section>
          <div>
            <h3>Steam 계정 연동</h3>
            <small>{steamLinked ? '연동된 스팀 계정을 해제할 수 있어요. 해제하면 불러온 보유 게임이 지워져요.' : '스팀 계정을 연동하면 보유 게임을 불러와 분석해요.'}</small>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            {steamLinked ? (
              <button type="button" className={ACTION_BUTTON} onClick={disconnectSteam} disabled={busy === 'steam'}>
                <GSIcon name="steam" size={17} />
                {busy === 'steam' ? '해제 중...' : 'Steam 연동 해제'}
              </button>
            ) : (
              <button type="button" className={ACTION_BUTTON} onClick={startSteamLink} disabled={loading}>
                <GSIcon name="steam" size={17} />
                {loading ? '연동 상태 확인 중...' : 'Steam 연동하기'}
              </button>
            )}
            {steamLinked && (
              <span className="inline-flex items-center gap-[5px] text-[13px] font-[600] text-[#2fbf71]">
                <GSIcon name="check" size={16} />
                연동완료
              </span>
            )}
            <Feedback result={results.steam} />
          </div>
        </section>
        <section>
          <div>
            <h3>구매 내역</h3>
            <small>스팀 구매내역을 가져오면 실제 결제액으로 분석하고, 더 많은 AI 분석을 쓸 수 있어요.</small>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <button type="button" className={ACTION_BUTTON} onClick={() => setImportOpen(true)} disabled={!steamLinked}>
              <GSIcon name="wallet" size={17} />
              {hasHistory ? '구매 내역 바꾸기' : '구매 내역 가져오기'}
            </button>
            {!steamLinked && <p className="basis-full text-[13px] text-muted">스팀 연동 후에 가져올 수 있어요.</p>}
          </div>
        </section>
        <section>
          <div>
            <h3>PC 사양</h3>
            <small>사양을 입력하면 내 PC 기준으로 평가하고, 더 많은 AI 분석을 쓸 수 있어요. 이 브라우저에만 저장돼요.</small>
          </div>
          <div>
            <button type="button" className={ACTION_BUTTON} onClick={openSpecDialog}>
              <GSIcon name="monitor" size={17} />
              {hasSavedSpecs ? '내 PC 사양 바꾸기' : '내 PC 사양 입력'}
            </button>
          </div>
        </section>
        <section>
          <div>
            <h3>회원 탈퇴</h3>
            <small>계정과 동기화된 보유 게임 정보가 영구 삭제됩니다.</small>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <button
              type="button"
              className="inline-flex items-center gap-[8px] h-[40px] px-[20px] rounded-full bg-bg text-[#e5484d] text-[14px] font-[650] hover:opacity-80"
              onClick={withdraw}
              disabled={busy === 'delete'}
            >
              {busy === 'delete' ? '처리 중...' : '회원 탈퇴'}
            </button>
            <Feedback result={results.delete} />
          </div>
        </section>
      </div>
      <PurchaseImportDialog open={importOpen} hasHistory={hasHistory} onClose={() => setImportOpen(false)} onImported={reload} />
    </Panel>
  )
}
