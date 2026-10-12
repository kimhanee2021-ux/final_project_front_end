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
      <div className="grid grid-cols-3 gap-[20px] max-[1120px]:grid-cols-2 max-[600px]:grid-cols-1">
        {upcomingGames.map(game => (
          <article className="border border-gs-border bg-gs-panel rounded-[14px] overflow-hidden" key={game.id}>
            <img className="w-full aspect-[1.7] object-cover block" src={game.image} alt="" />
            <div className="p-[23px]">
              <span className="text-gs-mint text-[9px] tracking-[2px] font-[650]">{game.date}</span>
              <h2 className="text-[22px] m-[10px_0_7px]">{game.name}</h2>
              <p className="text-gs-muted text-[12px] mb-[16px]">{game.description}</p>
              <div className="flex flex-wrap gap-[5px]">
                {game.genres.map(genre => (
                  <span key={genre} className="bg-gs-raised text-gs-muted py-[3px] px-[6px] rounded-[5px] text-[9px] leading-[1.3] whitespace-nowrap">{genre}</span>
                ))}
              </div>
              <button
                className={`mt-[24px] ${reminders.includes(game.id) ? 'gs-secondary-button' : 'gs-primary-button'}`}
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
      <p className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]">
        출시 예정 게임명, 이미지 조합, 일정은 화면 시연을 위한 가상의 데이터입니다. 알림 선택은 현재
        세션에서만 유지됩니다.
      </p>
    </>
  )
}
