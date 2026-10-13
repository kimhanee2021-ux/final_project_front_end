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
    <section className="gs-panel gs-steam-library" aria-labelledby="gs-steam-library-title" aria-busy={loading}>
      <div className="gs-panel-heading">
        <GSIcon name="steam" size={24} />
        <div>
          <h2 id="gs-steam-library-title">
            Steam 라이브러리
            {games && <span className="gs-result-count">{games.length}</span>}
          </h2>
          <p>연동한 스팀 계정의 보유 게임과 플레이 시간을 불러옵니다.</p>
        </div>
        {!notLinked && (
          <button type="button" className="gs-secondary-button" onClick={sync} disabled={loading}>
            <GSIcon name="refresh" size={16} />
            {loading ? '동기화 중...' : '다시 동기화'}
          </button>
        )}
      </div>
      {notLinked ? (
        <div className="gs-steam-state">
          <p>스팀 계정을 연동하면 보유 게임을 자동으로 가져올 수 있어요.</p>
          <button type="button" className="gs-primary-button" onClick={startSteamLink}>
            <GSIcon name="steam" size={17} />
            Steam 계정 연동하기
          </button>
        </div>
      ) : error ? (
        <div className="gs-steam-state" role="alert">
          <p>{error}</p>
          <button type="button" className="gs-primary-button" onClick={sync} disabled={loading}>다시 시도</button>
        </div>
      ) : loading && !games ? (
        <p className="gs-steam-state">스팀에서 보유 게임을 불러오는 중이에요...</p>
      ) : games && !visible.length ? (
        <p className="gs-steam-state">{games.length ? '검색어와 일치하는 스팀 게임이 없어요.' : '스팀 계정에 보유한 게임이 없어요.'}</p>
      ) : (
        <ul className="gs-steam-list">
          {visible.map(game => (
            <li key={game.appId}>
              {game.iconUrl ? <img src={game.iconUrl} alt="" loading="lazy" /> : <span className="gs-steam-icon"><GSIcon name="gamepad" size={18} /></span>}
              <div>
                <strong>{game.name}</strong>
                <small>최근 플레이 {playedAt(game.lastPlayedAt)}</small>
              </div>
              <span>
                <b>{hours(game.playtimeForever)}</b>
                <small>최근 2주 {hours(game.playtime2Weeks)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
