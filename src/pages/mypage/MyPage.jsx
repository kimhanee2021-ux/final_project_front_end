import { useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../components/common/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import { discoverGames } from '../../features/games/mocks/discoverMock'
import { gameStatuses } from '../../features/player/mocks/playerMock'
import { hardware, performanceSummary } from '../../features/performance/mocks/performanceMock'
import ProfileHero from '../../features/player/components/ProfileHero'
import ActivityTimeline from '../../features/player/components/ActivityTimeline'
import PlayerDialog from '../../features/player/components/PlayerDialog'

// wrap=true는 GamingEnvironment에서만 쓴다 — 좁은 화면에서 제목 줄과
// 오른쪽 링크가 같이 줄바꿈되어야 하는 패널이 그것 하나뿐이다.
function SectionHeading({ icon, title, description, children, className = '', wrap = false }) {
  return (
    <div
      className={`flex items-start gap-[12px] mb-[18px] max-[480px]:gap-[9px] max-[480px]:mb-[16px] ${wrap ? 'max-[1500px]:flex-wrap max-[1500px]:gap-[9px] max-[1200px]:flex-nowrap max-[700px]:flex-wrap' : ''} ${className}`}
    >
      <GSIcon name={icon} size={28} className="text-gs-mint shrink-0 mt-[1px] max-[480px]:w-[23px] max-[480px]:h-[23px]" />
      <div className="min-w-0">
        <h2 className="text-[18px] leading-[1.4] font-[680] tracking-[-0.4px] max-[700px]:text-[16px] max-[480px]:text-[16px]">{title}</h2>
        <p className="text-gs-muted mt-[2px] text-[10px] leading-[1.5] max-[700px]:text-[9px] max-[480px]:text-[8px]">{description}</p>
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
    <section className="border border-gs-border rounded-[11px] p-[18px] bg-[linear-gradient(135deg,#3d9d9d05,transparent_70%),var(--gs-panel)] min-w-0 flex flex-col min-[1750px]:p-[20px] max-[700px]:p-[16px] max-[480px]:p-[15px_12px]">
      <SectionHeading
        icon="gamepad"
        title="내 게임 현황"
        description="지금까지의 게임 라이프를 한눈에 확인해보세요."
      >
        <Link
          className="ml-auto self-start pt-[5px] shrink-0 inline-flex items-center justify-center gap-[8px] bg-transparent text-[10px] text-gs-muted py-[3px] hover:text-gs-mint whitespace-nowrap"
          to="/library"
          onClick={() => setQuery('')}
        >
          모든 게임 보기
          <GSIcon name="arrow" size={17} />
        </Link>
      </SectionHeading>
      <div className="grid grid-cols-4 gap-[9px] max-[480px]:grid-cols-2 max-[480px]:gap-[8px]">
        {stats.map(stat => (
          <Link
            key={stat.label}
            to={stat.to}
            onClick={() => setQuery('')}
            className={`mp-${stat.tone} border border-gs-border bg-[linear-gradient(130deg,#377d8b06,#57b2b403)] rounded-[10px] p-[14px] min-w-0 hover:border-[color-mix(in_srgb,var(--mp-tone)_50%,transparent)] hover:bg-gs-raised hover:-translate-y-[2px] min-[1750px]:p-[15px] max-[1500px]:p-[11px] max-[480px]:p-[13px]`}
          >
            <div className="flex items-center gap-[10px] text-gs-muted text-[10px] whitespace-nowrap min-[1750px]:text-[11px] max-[1500px]:flex-col max-[1500px]:items-start max-[1500px]:gap-[7px] max-[1200px]:flex-row max-[700px]:flex-col max-[700px]:items-start max-[480px]:flex-row max-[480px]:gap-[9px] max-[480px]:text-[10px]">
              <span className="grid place-items-center w-[38px] h-[38px] shrink-0 text-[var(--mp-tone)] bg-[color-mix(in_srgb,var(--mp-tone)_9%,transparent)] border border-[color-mix(in_srgb,var(--mp-tone)_22%,transparent)] rounded-[12px] max-[480px]:w-[31px] max-[480px]:h-[33px] max-[480px]:rounded-[10px] [&_svg]:max-[480px]:w-[20px] [&_svg]:max-[480px]:h-[20px]">
                <GSIcon name={stat.icon} size={23} />
              </span>
              <span>{stat.label}</span>
            </div>
            <strong className="block text-[34px] font-[720] leading-[1.3] mt-[7px] tracking-[-1px] min-[1750px]:text-[39px] max-[480px]:text-[32px] max-[480px]:mt-[9px]">
              {stat.count}
              <small className="text-[21px] ml-[3px] font-medium max-[480px]:text-[19px]">개</small>
            </strong>
            <p className="flex items-center gap-[7px] text-gs-muted text-[9px] mt-[2px] max-[480px]:text-[8px] [&_svg]:text-gs-mint">
              {stat.caption}
              <GSIcon name="arrow" size={13} />
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-[15px] p-[13px_12px_12px] border border-gs-border rounded-[11px] bg-[#639fa203] max-[480px]:p-[12px_8px] max-[480px]:mt-[12px]">
        <div className="flex items-center justify-between gap-[10px] m-[0_3px_13px]">
          <h3 className="flex items-center gap-[9px] text-[12px] font-[650] [&_svg]:text-gs-mint">
            <GSIcon name="gamepad" size={18} />
            {showAll ? '내 게임 목록' : '현재 플레이 중'}
            <span className="text-gs-muted text-[10px] font-medium">{showAll ? ownedGames.length : playing.length}</span>
          </h3>
          <button
            className="inline-flex items-center justify-center gap-[8px] bg-transparent text-[9px] text-gs-muted py-[3px] hover:text-gs-mint whitespace-nowrap"
            aria-expanded={showAll}
            onClick={() => setShowAll(value => !value)}
          >
            {showAll ? '간략히 보기' : '모두 보기'}
            <GSIcon name="arrow" size={14} />
          </button>
        </div>
        <div className="grid gap-[10px]">
          {visibleGames.map(game => {
            const record = player.games[game.id]
            const status = gameStatuses.find(item => item.id === record.status)
            return (
              <article
                key={game.id}
                className="grid grid-cols-[104px_minmax(85px,1fr)_95px_auto_auto_24px] gap-[10px] items-center p-[8px] border border-gs-border rounded-[9px] bg-[#44717e05] min-[1750px]:grid-cols-[114px_minmax(100px,1fr)_105px_auto_auto_24px] max-[1500px]:grid-cols-[80px_minmax(85px,1fr)_85px_auto_24px] max-[1500px]:gap-[8px] max-[1200px]:grid-cols-[110px_minmax(110px,1fr)_130px_auto_auto_26px] max-[1200px]:gap-[12px] max-[700px]:grid-cols-[82px_minmax(90px,1fr)_88px_auto_24px] max-[700px]:gap-[8px] max-[480px]:grid-cols-[75px_minmax(0,1fr)_auto_23px] max-[480px]:gap-[8px] max-[480px]:p-[9px]"
              >
                <button
                  className="group block w-full h-[65px] rounded-[6px] overflow-hidden p-0 bg-gs-raised min-[1750px]:h-[71px] max-[480px]:h-[59px] max-[480px]:[grid-column:1] max-[480px]:[grid-row:1]"
                  onClick={() => setSelectedGame(game)}
                  aria-label={`${game.name} 상세 보기`}
                >
                  <img className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" src={game.banner} alt="" loading="lazy" />
                </button>
                <div className="min-w-0 max-[480px]:[grid-column:2/-1] max-[480px]:[grid-row:1]">
                  <button
                    className="block p-0 text-left text-[11px] leading-[1.45] font-[650] bg-transparent [overflow-wrap:anywhere] hover:text-gs-mint min-[1750px]:text-[12px] max-[480px]:text-[11px]"
                    onClick={() => setSelectedGame(game)}
                  >
                    {game.shortName || game.name}
                  </button>
                  <div className="flex flex-wrap gap-[3px] mt-[7px] max-[480px]:gap-[4px]">
                    {game.genres.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex bg-gs-raised rounded-[15px] text-gs-muted py-[2px] px-[6px] text-[7px] whitespace-nowrap">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="max-[1500px]:[grid-column:3] max-[1500px]:[grid-row:1] max-[1500px]:self-start max-[1500px]:pt-[6px] max-[700px]:[grid-column:3] max-[700px]:[grid-row:1] max-[700px]:self-start max-[700px]:pt-[8px] max-[480px]:[grid-column:1] max-[480px]:[grid-row:2] max-[480px]:self-center max-[480px]:pt-0">
                  <div className="flex gap-[6px] items-center">
                    <div
                      className="min-w-0 flex-1 h-[5px] rounded-[10px] bg-gs-border overflow-hidden"
                      role="meter"
                      aria-label={`${game.name} 예시 진행률`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={record.progress}
                    >
                      <span className="block h-full bg-[linear-gradient(90deg,#0cbeb3,#38ebc3)] rounded-[inherit]" style={{ width: `${record.progress}%` }} />
                    </div>
                    <b className="text-[9px] font-medium">{record.progress}%</b>
                  </div>
                  <small className="block text-[8px] text-gs-muted mt-[6px] max-[1500px]:hidden max-[700px]:hidden max-[1200px]:block">플레이 시간 {game.hours}시간</small>
                </div>
                <span
                  className={`mp-${status.tone} inline-flex items-center justify-center gap-[4px] border border-[color-mix(in_srgb,var(--mp-tone)_40%,transparent)] text-[var(--mp-tone)] bg-[color-mix(in_srgb,var(--mp-tone)_7%,transparent)] text-[8px] rounded-[20px] py-[4px] px-[6px] whitespace-nowrap max-[1500px]:[grid-column:3] max-[1500px]:[grid-row:1] max-[1500px]:self-end max-[1500px]:mb-[3px] max-[1500px]:justify-self-start max-[700px]:[grid-column:3] max-[700px]:[grid-row:1] max-[700px]:self-end max-[700px]:mb-[3px] max-[480px]:[grid-column:2] max-[480px]:[grid-row:2] max-[480px]:self-center max-[480px]:justify-self-start max-[480px]:mb-0`}
                >
                  <i className="w-[5px] h-[5px] rounded-full bg-[var(--mp-tone)]" />
                  {status.label}
                </span>
                <button
                  className="border border-gs-border rounded-[6px] bg-gs-raised min-h-[29px] p-[5px_8px] text-[9px] whitespace-nowrap hover:border-gs-mint hover:text-gs-mint max-[480px]:[grid-column:3] max-[480px]:[grid-row:2] max-[480px]:text-[8px] max-[480px]:p-[5px_7px]"
                  onClick={() => onEditGame(game)}
                >
                  기록하기
                </button>
                <button
                  className="grid place-items-center p-0 w-[24px] border border-gs-border rounded-[6px] bg-gs-raised min-h-[29px] hover:border-gs-mint hover:text-gs-mint max-[480px]:[grid-column:4] max-[480px]:[grid-row:2] max-[480px]:w-[23px]"
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
          <div className="p-[33px_16px] text-center text-gs-muted">
            <GSIcon name="gamepad" size={30} />
            <strong className="block mt-[10px] text-gs-text text-[13px]">다음 모험을 시작해보세요.</strong>
            <p className="mt-[6px] text-[10px]">모두 보기를 눌러 게임을 플레이 중으로 변경할 수 있어요.</p>
          </div>
        )}
        <p className="flex items-center gap-[6px] text-[9px] text-gs-muted leading-[1.6] m-[13px_2px_2px] [&_svg]:text-gs-mint [&_svg]:shrink-0">
          <GSIcon name="note" size={14} />
          게임을 실행하기 전에, 다음에 할 일을 한 줄로 남겨보세요.
        </p>
      </div>
      <div className="flex items-center gap-[6px] text-[9px] text-gs-muted mt-auto p-[20px_1px_2px]">
        <span className="w-[5px] h-[5px] rounded-full bg-gs-mint" />내 속도로 즐기는 게임 라이프
        <span className="ml-auto text-[7px] tracking-[1.2px] opacity-60">YOUR PLAY, YOUR STORY</span>
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
    <section className="border border-gs-border rounded-[11px] p-[18px] bg-[linear-gradient(135deg,#3d9d9d05,transparent_70%),var(--gs-panel)] min-w-0 min-[1750px]:p-[20px] max-[700px]:p-[16px] max-[480px]:p-[15px_12px]">
      <SectionHeading
        icon="monitor"
        title="내 게임 환경"
        description="더 쾌적한 게임을 위한 나의 PC 환경을 확인하세요."
        wrap
      >
        <Link
          className="ml-auto self-start pt-[5px] shrink-0 inline-flex items-center justify-center gap-[8px] bg-transparent text-[10px] text-gs-muted py-[3px] hover:text-gs-mint whitespace-nowrap"
          to="/pc-check"
        >
          PC 성능 체크로 이동
          <GSIcon name="arrow" size={17} />
        </Link>
      </SectionHeading>
      <div className="flex items-center gap-[21px] max-[480px]:flex-col max-[480px]:gap-[14px]">
        <div
          className="relative shrink-0 basis-[142px] h-[151px] border border-gs-border rounded-full bg-[radial-gradient(circle,#00d4b008_0,transparent_72%)] min-[1750px]:basis-[158px] min-[1750px]:h-[167px] max-[1500px]:basis-[120px] max-[1500px]:h-[129px] max-[1200px]:basis-[151px] max-[1200px]:h-[160px] max-[480px]:basis-auto max-[480px]:w-[138px] max-[480px]:h-[146px]"
          role="img"
          aria-label={`예시 PC 성능 ${performanceSummary.score}점, ${performanceSummary.label}`}
        >
          <svg className="w-full h-full" viewBox="0 0 180 180" aria-hidden="true">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-[10px]">
            <strong className="text-[39px] font-[720] leading-[1.2] tracking-[-1px] max-[1500px]:text-[33px]">{performanceSummary.score}</strong>
            <span className="text-[12px] font-[650] text-gs-mint mt-[2px]">{performanceSummary.label}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 max-[480px]:w-full">
          <h3 className="text-[13px] leading-[1.6] tracking-[-0.25px] font-semibold min-[1750px]:text-[14px] max-[480px]:text-[12px] max-[480px]:text-center">
            내 PC는 대부분의 최신 게임을 쾌적하게 실행할 수 있어요!
          </h3>
          <p className="text-[9px] text-gs-muted mt-[3px] max-[480px]:text-center max-[480px]:text-[8px]">Demo PC · PC 성능 체크와 동일한 예시 사양</p>
          <div className="grid grid-cols-3 gap-[6px] mt-[13px] min-[1750px]:gap-[7px] max-[1500px]:grid-cols-2 max-[700px]:grid-cols-2 max-[480px]:gap-[7px]">
            {specs.map(spec => (
              <div key={spec.label} className="flex items-center gap-[9px] p-[9px_10px] min-w-0 border border-gs-border rounded-[6px] bg-[#5c859c05] max-[1500px]:p-[8px] max-[1500px]:gap-[7px] max-[1200px]:p-[12px] max-[700px]:p-[9px] max-[480px]:p-[10px_9px]">
                <GSIcon name={spec.icon} size={23} className="shrink-0 text-gs-text" />
                <span>
                  <small className="text-gs-muted text-[8px] block max-[480px]:text-[9px]">{spec.label}</small>
                  <strong className="text-gs-muted text-[8px] leading-[1.45] block font-[450] mt-[3px] [overflow-wrap:anywhere] min-[1750px]:text-[9px] max-[480px]:text-[9px]">{spec.value}</strong>
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
    <div className="grid gap-[15px] max-[480px]:gap-[12px]">
      <ProfileHero onEdit={type => setDialog({ type })} />
      <div className="grid grid-cols-2 gap-[14px] max-[1200px]:grid-cols-1">
        <GameOverview onEditGame={game => setDialog({ type: 'game', game })} />
        <div className="flex flex-col gap-[13px] min-w-0">
          <GamingEnvironment />
          <section className="border border-gs-border rounded-[11px] p-[18px] bg-[linear-gradient(135deg,#3d9d9d05,transparent_70%),var(--gs-panel)] min-w-0 flex-1 pb-[13px] min-[1750px]:p-[20px] max-[700px]:p-[16px] max-[480px]:p-[15px_12px]">
            <SectionHeading
              icon="clock"
              title="최근 게임 기록"
              description="나의 게임 여정을 돌아보세요."
              className="mb-[8px]!"
            >
              <button
                className="ml-auto self-start pt-[5px] shrink-0 inline-flex items-center justify-center gap-[8px] bg-transparent text-[10px] text-gs-muted py-[3px] hover:text-gs-mint whitespace-nowrap"
                onClick={() => setDialog({ type: 'history' })}
              >
                전체 기록 보기
                <GSIcon name="arrow" size={17} />
              </button>
            </SectionHeading>
            <ActivityTimeline activities={player.activities.slice(0, 5)} />
            <p className="m-[5px_0_0_36px] text-[8px] text-gs-muted">샘플 기록과 이 브라우저에서 남긴 기록입니다.</p>
          </section>
        </div>
      </div>
      <PlayerDialog dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  )
}
