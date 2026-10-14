import { useAuth } from '../../auth/context/AuthContext'
import GSIcon from '../../../components/common/GSIcon'
import { useSteamLibrary } from '../hooks/useSteamLibrary'

const hours = minutes => `${(minutes / 60).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}시간`
const playedAt = value =>
  value ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '플레이 기록 없음'

export default function SteamLibraryPanel({ query = '' }) {
  const { user, startSteamLink } = useAuth()
  const { games, loading, error, notLinked, sync } = useSteamLibrary(user?.id)
  const keyword = query.trim().toLowerCase()
  const visible = (games ?? []).filter(game => game.name.toLowerCase().includes(keyword))
  return (
    <section
      className="min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] p-[15px_16px] mb-[22px] min-[1600px]:p-[16px_18px] max-[1350px]:p-[13px] max-[1120px]:p-[18px] max-[600px]:p-[16px]"
      aria-labelledby="gs-steam-library-title"
      aria-busy={loading}
    >
      <div className="flex items-center gap-[12px] mb-[13px] max-[1350px]:gap-[8px]">
        <GSIcon name="steam" size={24} className="text-gs-mint shrink-0" />
        <div>
          <h2 className="text-[15px] font-[660] tracking-[-0.3px] leading-[1.3] min-[1600px]:text-[17px] max-[1350px]:text-[13px] max-[1120px]:text-[17px] max-[600px]:text-[15px]" id="gs-steam-library-title">
            Steam 라이브러리
            {games && <span className="inline-block ml-[12px] align-middle text-[13px] p-[4px_8px] bg-gs-raised text-gs-muted rounded-[6px] max-[600px]:ml-[8px] max-[600px]:text-[11px]">{games.length}</span>}
          </h2>
          <p className="text-[10px] text-gs-muted mt-[3px] leading-[1.4] min-[1600px]:text-[11px] max-[1120px]:text-[11px] max-[600px]:text-[9px]">연동한 스팀 계정의 보유 게임과 플레이 시간을 불러옵니다.</p>
        </div>
        {!notLinked && (
          <button type="button" className="gs-secondary-button ml-auto" onClick={sync} disabled={loading}>
            <GSIcon name="refresh" size={16} />
            {loading ? '동기화 중...' : '다시 동기화'}
          </button>
        )}
      </div>
      {notLinked ? (
        <div className="flex flex-wrap items-center justify-between gap-[14px] p-[16px_2px_4px] text-gs-muted text-[12px] max-[700px]:flex-col max-[700px]:items-start">
          <p>스팀 계정을 연동하면 보유 게임을 자동으로 가져올 수 있어요.</p>
          <button type="button" className="gs-primary-button" onClick={startSteamLink}>
            <GSIcon name="steam" size={17} />
            Steam 계정 연동하기
          </button>
        </div>
      ) : error ? (
        <div className="flex flex-wrap items-center justify-between gap-[14px] p-[16px_2px_4px] text-gs-muted text-[12px] max-[700px]:flex-col max-[700px]:items-start" role="alert">
          <p>{error}</p>
          <button type="button" className="gs-primary-button" onClick={sync} disabled={loading}>다시 시도</button>
        </div>
      ) : loading && !games ? (
        <p className="flex flex-wrap items-center justify-between gap-[14px] p-[16px_2px_4px] text-gs-muted text-[12px]">스팀에서 보유 게임을 불러오는 중이에요...</p>
      ) : games && !visible.length ? (
        <p className="flex flex-wrap items-center justify-between gap-[14px] p-[16px_2px_4px] text-gs-muted text-[12px]">{games.length ? '검색어와 일치하는 스팀 게임이 없어요.' : '스팀 계정에 보유한 게임이 없어요.'}</p>
      ) : (
        <ul className="list-none m-0 p-0 grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-[8px] max-h-[420px] overflow-y-auto">
          {visible.map(game => (
            <li key={game.appId} className="flex items-center gap-[12px] p-[10px_12px] border border-gs-border rounded-[10px] bg-gs-raised min-w-0">
              {game.iconUrl ? (
                <img className="w-[32px] h-[32px] rounded-[7px] shrink-0" src={game.iconUrl} alt="" loading="lazy" />
              ) : (
                <span className="w-[32px] h-[32px] rounded-[7px] shrink-0 grid place-items-center bg-gs-hover text-gs-muted"><GSIcon name="gamepad" size={18} /></span>
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                <strong className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis">{game.name}</strong>
                <small className="text-[10px] text-gs-muted">최근 플레이 {playedAt(game.lastPlayedAt)}</small>
              </div>
              <span className="flex flex-col items-end gap-[3px] whitespace-nowrap">
                <b className="text-[12px] text-gs-mint">{hours(game.playtimeForever)}</b>
                <small className="text-[10px] text-gs-muted">최근 2주 {hours(game.playtime2Weeks)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
