import { useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../components/discover/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import { discoverGames } from '../../mocks/discoverMock'
import { gameStatuses } from '../../mocks/playerMock'
import { hardware, performanceSummary } from '../../mocks/performanceMock'
import ProfileHero from './ProfileHero'
import ActivityTimeline from './ActivityTimeline'
import PlayerDialog from './PlayerDialog'
import '../../styles/mypage.css'

function SectionHeading({ icon, title, description, children }) {
  return (
    <div className="mp-section-heading">
      <GSIcon name={icon} size={28} />
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}

function GameOverview({ onEditGame }) {
  const { player, wishlist, setQuery, setSelectedGame } = useGameSense()
  const [showAll, setShowAll] = useState(false)
  const ownedGames = discoverGames.filter(game => game.owned)
  const playing = ownedGames.filter(game => player.games[game.id].status === 'playing')
  const completed = ownedGames.filter(game => player.games[game.id].status === 'completed')
  const stats = [
    {
      label: '보유 게임',
      count: ownedGames.length,
      icon: 'chart',
      tone: 'blue',
      to: '/library',
      caption: '내 라이브러리',
    },
    {
      label: '플레이 중',
      count: playing.length,
      icon: 'play',
      tone: 'blue',
      to: '/library?status=playing',
      caption: '이어지는 모험',
    },
    {
      label: '완료한 게임',
      count: completed.length,
      icon: 'check',
      tone: 'mint',
      to: '/library?status=completed',
      caption: '나의 완주 기록',
    },
    {
      label: '위시리스트',
      count: wishlist.length,
      icon: 'heart',
      tone: 'pink',
      to: '/wishlist',
      caption: '만나고 싶은 세계',
    },
  ]
  const visibleGames = showAll ? ownedGames : playing.slice(0, 3)
  return (
    <section className="mp-panel mp-games-panel">
      <SectionHeading
        icon="gamepad"
        title="내 게임 현황"
        description="지금까지의 게임 라이프를 한눈에 확인해보세요."
      >
        <Link className="mp-text-link" to="/library" onClick={() => setQuery('')}>
          모든 게임 보기
          <GSIcon name="arrow" size={17} />
        </Link>
      </SectionHeading>
      <div className="mp-stat-grid">
        {stats.map(stat => (
          <Link
            key={stat.label}
            to={stat.to}
            onClick={() => setQuery('')}
            className={`mp-stat-card mp-${stat.tone}`}
          >
            <div>
              <span className="mp-stat-icon">
                <GSIcon name={stat.icon} size={23} />
              </span>
              <span>{stat.label}</span>
            </div>
            <strong>
              {stat.count}
              <small>개</small>
            </strong>
            <p>
              {stat.caption}
              <GSIcon name="arrow" size={13} />
            </p>
          </Link>
        ))}
      </div>
      <div className="mp-current-games">
        <div className="mp-subheading">
          <h3>
            <GSIcon name="gamepad" size={18} />
            {showAll ? '내 게임 목록' : '현재 플레이 중'}
            <span>{showAll ? ownedGames.length : playing.length}</span>
          </h3>
          <button
            className="mp-text-link"
            aria-expanded={showAll}
            onClick={() => setShowAll(value => !value)}
          >
            {showAll ? '간략히 보기' : '모두 보기'}
            <GSIcon name="arrow" size={14} />
          </button>
        </div>
        <div className="mp-game-list">
          {visibleGames.map(game => {
            const record = player.games[game.id]
            const status = gameStatuses.find(item => item.id === record.status)
            return (
              <article key={game.id} className="mp-game-row">
                <button
                  className="mp-game-art"
                  onClick={() => setSelectedGame(game)}
                  aria-label={`${game.name} 상세 보기`}
                >
                  <img src={game.banner} alt="" loading="lazy" />
                </button>
                <div className="mp-game-identity">
                  <button onClick={() => setSelectedGame(game)}>
                    {game.shortName || game.name}
                  </button>
                  <div className="mp-game-tags">
                    {game.genres.slice(0, 3).map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mp-game-progress">
                  <div>
                    <div
                      role="meter"
                      aria-label={`${game.name} 예시 진행률`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={record.progress}
                    >
                      <span style={{ width: `${record.progress}%` }} />
                    </div>
                    <b>{record.progress}%</b>
                  </div>
                  <small>플레이 시간 {game.hours}시간</small>
                </div>
                <span className={`mp-status-pill mp-${status.tone}`}>
                  <i />
                  {status.label}
                </span>
                <button className="mp-record-button" onClick={() => onEditGame(game)}>
                  기록하기
                </button>
                <button
                  className="mp-game-more"
                  aria-label={`${game.name} 상태 및 메모 수정`}
                  onClick={() => onEditGame(game)}
                >
                  <GSIcon name="more" size={17} />
                </button>
              </article>
            )
          })}
        </div>
        {!visibleGames.length && (
          <div className="mp-empty-games">
            <GSIcon name="gamepad" size={30} />
            <strong>다음 모험을 시작해보세요.</strong>
            <p>모두 보기를 눌러 게임을 플레이 중으로 변경할 수 있어요.</p>
          </div>
        )}
        <p className="mp-game-note">
          <GSIcon name="note" size={14} />
          게임을 실행하기 전에, 다음에 할 일을 한 줄로 남겨보세요.
        </p>
      </div>
      <div className="mp-library-foot">
        <span className="mp-mini-dot" />내 속도로 즐기는 게임 라이프
        <span>YOUR PLAY, YOUR STORY</span>
      </div>
    </section>
  )
}

function GamingEnvironment() {
  const specs = [
    ...hardware.map(item => ({ icon: item.id, label: item.name, value: item.model })),
    { icon: 'monitor', label: '모니터', value: '2560 × 1440 (QHD)' },
    { icon: 'gamepad', label: '주 사용 입력장치', value: 'Xbox 무선 컨트롤러' },
  ]
  return (
    <section className="mp-panel mp-environment">
      <SectionHeading
        icon="monitor"
        title="내 게임 환경"
        description="더 쾌적한 게임을 위한 나의 PC 환경을 확인하세요."
      >
        <Link className="mp-text-link" to="/pc-check">
          PC 성능 체크로 이동
          <GSIcon name="arrow" size={17} />
        </Link>
      </SectionHeading>
      <div className="mp-environment-body">
        <div
          className="mp-pc-gauge"
          role="img"
          aria-label={`예시 PC 성능 ${performanceSummary.score}점, ${performanceSummary.label}`}
        >
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <defs>
              <linearGradient id="mp-gauge-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop stopColor="#00bdbb" />
                <stop offset="1" stopColor="#38f3b6" />
              </linearGradient>
            </defs>
            <path className="mp-gauge-track" d="M 35 145 A 72 72 0 1 1 145 145" pathLength="100" />
            <path
              className="mp-gauge-value"
              d="M 35 145 A 72 72 0 1 1 145 145"
              pathLength="100"
              strokeDasharray={`${performanceSummary.score} 100`}
            />
          </svg>
          <div>
            <strong>{performanceSummary.score}</strong>
            <span>{performanceSummary.label}</span>
          </div>
        </div>
        <div className="mp-environment-info">
          <h3>
            내 PC는 대부분의 최신 게임을
            <br className="mp-tablet-break" /> 쾌적하게 실행할 수 있어요!
          </h3>
          <p>Demo PC · PC 성능 체크와 동일한 예시 사양</p>
          <div className="mp-spec-grid">
            {specs.map(spec => (
              <div key={spec.label}>
                <GSIcon name={spec.icon} size={23} />
                <span>
                  <small>{spec.label}</small>
                  <strong>{spec.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function MyPage() {
  const { player } = useGameSense()
  const [dialog, setDialog] = useState(null)
  return (
    <div className="mp-page">
      <ProfileHero onEdit={type => setDialog({ type })} />
      <div className="mp-dashboard">
        <GameOverview onEditGame={game => setDialog({ type: 'game', game })} />
        <div className="mp-right-column">
          <GamingEnvironment />
          <section className="mp-panel mp-records">
            <SectionHeading
              icon="clock"
              title="최근 게임 기록"
              description="나의 게임 여정을 돌아보세요."
            >
              <button className="mp-text-link" onClick={() => setDialog({ type: 'history' })}>
                전체 기록 보기
                <GSIcon name="arrow" size={17} />
              </button>
            </SectionHeading>
            <ActivityTimeline activities={player.activities.slice(0, 5)} />
            <p className="mp-records-note">샘플 기록과 이 브라우저에서 남긴 기록입니다.</p>
          </section>
        </div>
      </div>
      <PlayerDialog dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  )
}
