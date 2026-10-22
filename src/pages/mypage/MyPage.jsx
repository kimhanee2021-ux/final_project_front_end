import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon, PanelPage, Panel } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { discoverGames } from '@/features/games'
import { gameStatuses, ProfileHero, PlayerDialog } from '@/features/player'
import { hardware, performanceSummary, mergeHardware, usePcSpecs } from '@/features/performance'
import { AccountSettings } from '@/features/user'
import { useAuth } from '@/features/auth'

// 패널 맨 위 한 줄 요약(제목 + 오른쪽 이동 링크)
function PanelTitle({ title, to, linkLabel, onLinkClick }) {
  return (
    <div className="flex items-center justify-between gap-[12px] mb-[32px]">
      <h2 className="text-[clamp(26px,3.4vw,40px)] font-[750] tracking-[-1.2px]">{title}</h2>
      {to && (
        <Link className="inline-flex items-center gap-[6px] text-[13px] text-muted hover:text-text" to={to} onClick={onLinkClick}>
          {linkLabel}
          <GSIcon name="arrow" size={15} />
        </Link>
      )}
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
    { label: '보유 게임', count: ownedGames.length, to: '/library' },
    { label: '플레이 중', count: playing.length, to: '/library?status=playing' },
    { label: '완료한 게임', count: completed.length, to: '/library?status=completed' },
    { label: '위시리스트', count: wishlist.length, to: '/wishlist' },
  ]
  const visibleGames = showAll ? ownedGames : playing.slice(0, 3)
  return (
    <section>
      <PanelTitle title="내 게임 현황" to="/library" linkLabel="모든 게임 보기" onLinkClick={() => setQuery('')} />
      <div className="grid grid-cols-4 gap-[24px] pb-[32px] border-b border-border max-[600px]:grid-cols-2">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.to} onClick={() => setQuery('')} className="block hover:opacity-80">
            <small className="block text-[13px] text-muted">{stat.label}</small>
            <strong className="block mt-[6px] text-[32px] font-[750] tracking-[-1px] tabular-nums">
              {stat.count}
              <small className="ml-[3px] text-[16px] font-[500] text-muted">개</small>
            </strong>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between mt-[32px] mb-[8px]">
        <h3 className="text-[16px] font-[650]">
          {showAll ? '내 게임 목록' : '현재 플레이 중'}
          <span className="ml-[8px] text-[14px] font-[500] text-faint">{showAll ? ownedGames.length : playing.length}</span>
        </h3>
        <button className="text-[13px] text-muted bg-transparent hover:text-text" aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>
          {showAll ? '간략히 보기' : '모두 보기'}
        </button>
      </div>
      <div>
        {visibleGames.map(game => {
          const record = player.games[game.id]
          const status = gameStatuses.find(item => item.id === record.status)
          return (
            <article key={game.id} className="flex items-center gap-[16px] py-[16px] border-b border-border last:border-0 max-[600px]:flex-wrap">
              <button
                className="group shrink-0 w-[120px] h-[68px] rounded-[12px] overflow-hidden p-0 bg-bg"
                onClick={() => setSelectedGame(game)}
                aria-label={`${game.name} 상세 보기`}
              >
                <img className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" src={game.banner} alt="" loading="lazy" />
              </button>
              <div className="min-w-0 flex-1">
                <button className="block p-0 bg-transparent text-left text-[15px] font-[600] [overflow-wrap:anywhere] hover:underline" onClick={() => setSelectedGame(game)}>
                  {game.shortName || game.name}
                </button>
                <p className="mt-[4px] text-[12px] text-faint">{game.genres.slice(0, 3).join(' · ')} · 플레이 시간 {game.hours}시간</p>
                <div className="flex items-center gap-[10px] mt-[10px] max-w-[280px]">
                  <div
                    className="flex-1 h-[6px] rounded-full bg-bg overflow-hidden"
                    role="meter"
                    aria-label={`${game.name} 예시 진행률`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={record.progress}
                  >
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${record.progress}%` }} />
                  </div>
                  <b className="text-[12px] font-[600] tabular-nums">{record.progress}%</b>
                </div>
              </div>
              <span className="shrink-0 text-[13px] text-muted">{status.label}</span>
              <button className="gs-secondary-button shrink-0" onClick={() => onEditGame(game)}>
                기록하기
              </button>
            </article>
          )
        })}
      </div>
      {!visibleGames.length && (
        <div className="py-[48px] text-center text-muted">
          <strong className="block text-text text-[15px]">다음 모험을 시작해보세요.</strong>
          <p className="mt-[6px] text-[13px]">모두 보기를 눌러 게임을 플레이 중으로 변경할 수 있어요.</p>
        </div>
      )}
    </section>
  )
}

function GamingEnvironment() {
  const { specs: inputSpecs } = usePcSpecs()
  const specs = [
    ...mergeHardware(hardware, inputSpecs).map(item => ({ label: item.name, value: item.model })),
    { label: '모니터', value: '2560 × 1440 (QHD)' },
    { label: '주 사용 입력장치', value: 'Xbox 무선 컨트롤러' },
  ]
  return (
    <section>
      <PanelTitle title="내 게임 환경" to="/pc-check" linkLabel="내 PC 사양 보기" />
      <div className="grid grid-cols-[1fr_1.6fr] gap-[48px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[28px]">
        <div role="img" aria-label={`예시 PC 성능 ${performanceSummary.score}점, ${performanceSummary.label}`}>
          <p className="flex items-baseline gap-[14px]">
            <strong className="text-[56px] font-[750] tracking-[-2px] leading-none tabular-nums">{performanceSummary.score}</strong>
            <span className="text-[16px] font-[600] text-primary-text">{performanceSummary.label}</span>
          </p>
          <p className="mt-[12px] text-[14px] text-muted">내 PC는 대부분의 최신 게임을 쾌적하게 실행할 수 있어요! (Demo PC · 예시 사양)</p>
        </div>
        <dl className="grid grid-cols-2 gap-[12px] max-[600px]:grid-cols-1">
          {specs.map(spec => (
            <div key={spec.label} className="p-[16px] rounded-[16px] bg-bg min-w-0">
              <dt className="text-[13px] text-muted">{spec.label}</dt>
              <dd className="mt-[4px] text-[14px] font-[500] [overflow-wrap:anywhere]">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default function MyPage() {
  const [dialog, setDialog] = useState(null)
  const { isAuthenticated } = useAuth()
  return (
    <PanelPage>
      <Panel id="profile">
        <ProfileHero onEdit={type => setDialog({ type })} />
      </Panel>
      <Panel id="games">
        <GameOverview onEditGame={game => setDialog({ type: 'game', game })} />
      </Panel>
      <Panel id="environment">
        <GamingEnvironment />
      </Panel>
      {isAuthenticated && <AccountSettings />}
      <PlayerDialog dialog={dialog} onClose={() => setDialog(null)} />
    </PanelPage>
  )
}
