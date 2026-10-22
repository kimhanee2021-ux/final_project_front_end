import { useAuth } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { resetSteamLibraryCache } from '@/features/library'
import { ACTION_BUTTON } from './accountStyles'
import Feedback from './Feedback'

// 스팀 연동 / 연동 해제. 해제하면 불러온 보유 게임을 지우고 분석 데이터를 다시 받는다.
export default function SteamSetting({ actions, steamLinked, loading, reload }) {
  const { startSteamLink, unlinkSteam } = useAuth()
  const { notify } = useGameSense()
  const { busy, results, run } = actions
  const disconnectSteam = () => {
    if (!window.confirm('스팀 연동을 해제할까요? 불러온 보유 게임 목록이 지워지고, 다시 연동하면 새로 불러와요.')) return
    run('steam', async () => {
      await unlinkSteam()
      resetSteamLibraryCache()
      await reload()
      notify('스팀 연동을 해제했어요.')
    })
  }

  return (
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
  )
}
