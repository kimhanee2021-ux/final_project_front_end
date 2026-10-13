import { useState } from 'react'
import { upcomingGames } from '../../features/games/mocks/discoverMock'
import { useGameSense } from '../../contexts/GameSenseContext'
import GSIcon from '../../components/common/GSIcon'
import PageHeading from '../../components/common/PageHeading'

export default function UpcomingPage() {
  const { notify } = useGameSense()
  const [reminders, setReminders] = useState([])
  return (
    <>
      <PageHeading
        title="On the Horizon"
        description="곧 만나게 될 새로운 세계를 미리 둘러보세요."
      />
      <div className="gs-upcoming-grid">
        {upcomingGames.map(game => (
          <article className="gs-upcoming-card" key={game.id}>
            <img src={game.image} alt="" />
            <div>
              <span className="gs-eyebrow">{game.date}</span>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <div className="gs-tags">
                {game.genres.map(genre => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
              <button
                className={
                  reminders.includes(game.id) ? 'gs-secondary-button' : 'gs-primary-button'
                }
                aria-pressed={reminders.includes(game.id)}
                onClick={() => {
                  const saved = reminders.includes(game.id)
                  setReminders(
                    saved ? reminders.filter(id => id !== game.id) : [...reminders, game.id]
                  )
                  notify(
                    saved
                      ? '출시 알림을 해제했어요'
                      : '출시 알림을 선택했어요. 데모에서는 실제 알림을 보내지 않아요.'
                  )
                }}
              >
                <GSIcon name={reminders.includes(game.id) ? 'check' : 'bell'} size={17} />
                {reminders.includes(game.id) ? '알림 선택됨' : '출시 알림 받기'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="gs-inline-note">
        출시 예정 게임명, 이미지 조합, 일정은 화면 시연을 위한 가상의 데이터입니다. 알림 선택은 현재
        세션에서만 유지됩니다.
      </p>
    </>
  )
}
