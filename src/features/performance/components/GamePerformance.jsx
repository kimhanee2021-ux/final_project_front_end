import { useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { getPerformanceRating, performanceGames, resolutions } from '../mocks/performanceMock'
import PanelHeading from './PanelHeading'

export default function GamePerformance({ onDetails }) {
  const [showAll, setShowAll] = useState(false)
  const [resolution, setResolution] = useState('fhd')
  const games = showAll ? performanceGames : performanceGames.slice(0, 6)
  return (
    <section className="pc-panel pc-games">
      <PanelHeading
        icon="gamepad"
        title="게임별 예상 성능"
        subtitle="주요 게임에서의 예상 프레임을 확인해보세요."
        action={
          <button
            className="pc-text-button"
            onClick={() => setShowAll(value => !value)}
            aria-expanded={showAll}
          >
            {showAll ? '접기' : '전체 보기'}
            <GSIcon name="arrow" size={15} />
          </button>
        }
      />
      <div className="pc-game-options">
        <span>
          <i />
          높음 설정 · 더미 FPS
        </span>
        <label>
          평가 기준
          <select
            aria-label="게임 성능 평가 해상도"
            value={resolution}
            onChange={event => setResolution(event.target.value)}
          >
            {resolutions.map(item => (
              <option key={item.id} value={item.id}>
                {item.label} ({item.pixels})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="pc-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="게임별 해상도 성능 비교표"
      >
        <table className="pc-game-table">
          <caption className="sr-only">
            예시 PC의 게임별 예상 FPS. 모든 수치는 화면 시연용이며 실제 벤치마크가 아닙니다.
          </caption>
          <thead>
            <tr>
              <th scope="col">게임 제목</th>
              {resolutions.map(item => (
                <th
                  scope="col"
                  key={item.id}
                  className={resolution === item.id ? 'is-selected' : ''}
                >
                  {item.label}
                  <small>({item.pixels})</small>
                </th>
              ))}
              <th scope="col">평가</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => {
              const rating = getPerformanceRating(game.fps?.[resolution])
              return (
                <tr key={game.id}>
                  <th scope="row">
                    <button
                      className="pc-game-button"
                      onClick={() => onDetails({ type: 'game', item: game })}
                    >
                      <img src={game.image} alt="" loading="lazy" />
                      <span>{game.name}</span>
                    </button>
                  </th>
                  {resolutions.map(item => (
                    <td
                      key={item.id}
                      className={`pc-fps-${item.id} ${resolution === item.id ? 'is-selected' : ''}`}
                    >
                      {game.fps ? (
                        <>
                          <strong>{game.fps[item.id]}</strong>
                          <small> FPS</small>
                        </>
                      ) : (
                        <span className="pc-unavailable" aria-label="PC 평가 대상 아님">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                  <td>
                    <span className={`pc-rating pc-${rating.tone}`}>{rating.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="pc-table-note">
        <GSIcon name="info" size={13} />
        예시 수치 · 60 FPS 이상 원활 / 30–59 보통 · Switch 게임 제외
      </p>
    </section>
  )
}
