import { useEffect, useRef } from 'react'
import { GameImage, GSIcon } from '@/shared/ui'
import { formatHours, formatPlayedDate } from '../model/libraryList'

// 라이브러리 게임 한 개의 상세 창. game이 있으면 열리고 null이면 닫힌다.
// 보유 게임 응답에 들어 있는 정보(플레이시간·마지막 플레이)만 보여주고, 자세한 소개는 스팀 상점으로 연결한다.
export default function LibraryGameDialog({ game, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (game && !dialog.open) dialog.showModal()
    else if (!game && dialog.open) dialog.close()
  }, [game])

  const stats = game
    ? [
        ['총 플레이시간', formatHours(game.playtimeForever)],
        ['최근 2주 플레이', formatHours(game.playtime2Weeks)],
        ['마지막 플레이', formatPlayedDate(game.lastPlayedAt)],
        ['장르', game.genre],
      ]
    : []

  return (
    <dialog
      ref={ref}
      className="m-auto w-[min(480px,calc(100%-32px))] p-0 border-0 rounded-[24px] bg-surface text-text shadow-[0_24px_80px_#0004] backdrop:bg-[#11102199] backdrop:backdrop-blur-[6px]"
      aria-labelledby="library-game-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {game && (
        <div className="p-[28px] max-[480px]:p-[20px]">
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex items-center gap-[16px] min-w-0">
              <GameImage className="w-[64px] h-[64px] rounded-[16px] shrink-0" src={game.iconUrl} iconSize={28} />
              <h2
                id="library-game-title"
                className="!m-0 text-[22px] font-[700] tracking-[-0.5px] leading-[1.35] [overflow-wrap:anywhere]"
              >
                {game.name}
              </h2>
            </div>
            <button
              autoFocus
              type="button"
              className="gs-icon-button shrink-0"
              aria-label="게임 상세 닫기"
              onClick={onClose}
            >
              <GSIcon name="close" />
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-[10px] mt-[24px]">
            {stats.map(([label, value]) => (
              <div key={label} className="p-[16px] rounded-[16px] bg-bg">
                <dt className="text-[12px] text-muted">{label}</dt>
                <dd className="mt-[6px] text-[16px] font-[650]">{value}</dd>
              </div>
            ))}
          </dl>
          <a
            className="gs-primary-button mt-[22px] w-full"
            href={`https://store.steampowered.com/app/${game.appId}`}
            target="_blank"
            rel="noreferrer"
          >
            스팀 상점에서 보기
            <GSIcon name="arrow" size={16} />
          </a>
        </div>
      )}
    </dialog>
  )
}
