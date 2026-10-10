import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  discoverGames,
  genrePreferences,
  playHistory,
  recentActivity,
  recommendedIds,
} from '../mocks/discoverMock'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'

export function PlayPattern() {
  const [month, setMonth] = useState(5)
  const hours = playHistory[month]
  const change =
    month > 0 ? Math.round(((hours - playHistory[month - 1]) / playHistory[month - 1]) * 100) : null
  const stops = genrePreferences
    .map((item, index) => {
      const start = genrePreferences.slice(0, index).reduce((sum, genre) => sum + genre.value, 0)
      return `${item.color} ${start}% ${start + item.value}%`
    })
    .join(', ')
  return (
    <section className="gs-panel gs-pattern" aria-labelledby="gs-pattern-title">
      <div className="gs-panel-heading">
        <span className="gs-widget-icon gs-mint">
          <GSIcon name="chart" size={28} />
        </span>
        <div>
          <h2 id="gs-pattern-title">나의 게임 소비 패턴</h2>
          <p>당신의 플레이가 만들어내는 이야기</p>
        </div>
        <Link to="/analysis" className="gs-text-link">
          상세 보기
          <GSIcon name="arrow" size={16} />
        </Link>
      </div>
      <div className="gs-pattern-grid">
        <div className="gs-chart-card">
          <h3>{month + 1}월 플레이 시간</h3>
          <div className="gs-hours" aria-live="polite">
            <strong>
              {hours}
              <span>시간</span>
            </strong>
            {change !== null && (
              <span className={change < 0 ? 'gs-negative' : ''}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%<small>지난달 대비</small>
              </span>
            )}
          </div>
          <div className="gs-mini-bars" role="group" aria-label="2026년 월별 플레이 시간">
            {playHistory.map((value, index) => (
              <button
                key={index}
                className={month === index ? 'is-active' : ''}
                aria-label={`${index + 1}월 ${value}시간`}
                aria-pressed={month === index}
                onClick={() => setMonth(index)}
              >
                <span className="gs-bar-track">
                  <span className="gs-bar-value" style={{ height: `${(value / 48) * 100}%` }} />
                  <span className="gs-bar-tooltip">{value}h</span>
                </span>
                <span>{index + 1}월</span>
              </button>
            ))}
          </div>
        </div>
        <div className="gs-chart-card gs-genre-chart">
          <h3>
            <span className="gs-orange">
              <GSIcon name="compass" size={17} />
            </span>
            선호 장르
          </h3>
          <div className="gs-genre-chart-body">
            <div
              className="gs-donut"
              role="img"
              aria-label={genrePreferences.map(item => `${item.name} ${item.value}%`).join(', ')}
              style={{ background: `conic-gradient(${stops})` }}
            >
              <div>
                <span>FAVORITE</span>
                <strong>RPG</strong>
              </div>
            </div>
            <ul>
              {genrePreferences.map(item => (
                <li key={item.name}>
                  <span style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.value}%</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Recommendations() {
  const [offset, setOffset] = useState(0)
  const { setSelectedGame } = useGameSense()
  const games = Array.from({ length: 4 }, (_, index) =>
    discoverGames.find(game => game.id === recommendedIds[(offset + index) % recommendedIds.length])
  )
  return (
    <section className="gs-panel gs-recommendations" aria-labelledby="gs-recommend-title">
      <div className="gs-panel-heading">
        <span className="gs-widget-icon gs-purple">
          <GSIcon name="spark" size={28} />
        </span>
        <div>
          <h2 id="gs-recommend-title">
            AI 추천 <span className="gs-tiny-badge">PREVIEW</span>
          </h2>
          <p>당신의 플레이 스타일을 닮은 새로운 발견</p>
        </div>
        <Link to="/recommendations" className="gs-text-link">
          더보기
          <GSIcon name="arrow" size={16} />
        </Link>
      </div>
      <div className="gs-recommendation-row">
        <div className="gs-recommendation-grid">
          {games.map(game => (
            <button
              className="gs-recommendation"
              key={game.id}
              onClick={() => setSelectedGame(game)}
            >
              <img src={game.banner} alt="" loading="lazy" />
              <strong>{game.name}</strong>
              <span>{game.genres[0]}</span>
            </button>
          ))}
        </div>
        <button
          className="gs-round-button"
          aria-label="다음 추천 게임"
          onClick={() => setOffset((offset + 1) % recommendedIds.length)}
        >
          <GSIcon name="arrow" size={19} />
        </button>
      </div>
    </section>
  )
}

export function RecentActivity({ expanded = false }) {
  const { setSelectedGame } = useGameSense()
  return (
    <section
      className={`gs-panel gs-recent ${expanded ? 'gs-recent-expanded' : ''}`}
      aria-labelledby="gs-recent-title"
    >
      <div className="gs-panel-heading">
        <span className="gs-widget-icon">
          <GSIcon name="clock" size={23} />
        </span>
        <div>
          <h2 id="gs-recent-title">최근 활동</h2>
        </div>
        <p className="gs-recent-description">다시 이어갈 당신의 모험</p>
        {!expanded && (
          <Link to="/activity" className="gs-text-link">
            더보기
            <GSIcon name="arrow" size={16} />
          </Link>
        )}
      </div>
      <div className="gs-activity-grid">
        {recentActivity.map(activity => {
          const game = discoverGames.find(item => item.id === activity.gameId)
          return (
            <button key={game.id} className="gs-activity" onClick={() => setSelectedGame(game)}>
              <img src={game.image} alt="" loading="lazy" />
              <span>
                <strong>{game.shortName || game.name}</strong>
                <small>{activity.when}</small>
                {expanded && (
                  <>
                    <span>{activity.duration} 플레이</span>
                    <span className="gs-activity-achievement">
                      <GSIcon name="trophy" size={14} />
                      {activity.achievement}
                    </span>
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
