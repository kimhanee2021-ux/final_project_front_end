import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import Feedback from './Feedback'

// 회원 탈퇴 (확인 후 계정 삭제 → 처음 화면으로)
export default function WithdrawSetting({ actions }) {
  const { deleteAccount } = useAuth()
  const { notify } = useGameSense()
  const navigate = useNavigate()
  const { busy, results, run } = actions
  const withdraw = () => {
    if (!window.confirm('정말 탈퇴할까요? 계정과 동기화된 스팀 보유 게임 정보가 모두 삭제되며 되돌릴 수 없어요.')) return
    run('delete', async () => {
      await deleteAccount()
      notify('회원 탈퇴가 완료되었어요.')
      navigate('/', { replace: true })
    })
  }

  return (
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
  )
}
