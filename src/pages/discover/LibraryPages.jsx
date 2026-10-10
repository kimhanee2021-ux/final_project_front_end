import { useState } from 'react'
import { Link } from 'react-router-dom'
import { discoverGames, upcomingGames } from '../../mocks/discoverMock'
import { useGameSense } from '../../contexts/GameSenseContext'
import { useTheme } from '../../hooks/useTheme'
import GSIcon from '../../components/discover/GSIcon'
import { RecentActivity } from '../../components/discover/DashboardWidgets'
import { useAuth } from '../../contexts/AuthContext'
import AccountSettings from '../../features/user/components/AccountSettings'

function PageHeading({ title, description }) {
  return (
    <div className="gs-section-heading gs-subpage-heading">
      <div>
        <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function UpcomingPage() {
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

export function CollectionsPage() {
  const collections = [
    { title: 'Epic Adventures', subtitle: '끝없이 펼쳐지는 세계', genre: 'RPG', game: 'elden' },
    {
      title: 'One More Round',
      subtitle: '한 판만 더, 멈출 수 없는 즐거움',
      genre: 'Action',
      game: 'hades',
    },
    {
      title: 'Slow & Cozy',
      subtitle: '나만의 속도로 쉬어가는 시간',
      genre: 'Simulation',
      game: 'dave',
    },
  ]
  return (
    <>
      <PageHeading title="Your Collections" description="그날의 기분에 맞는 게임을 발견해보세요." />
      <div className="gs-collections-grid">
        {collections.map(collection => (
          <Link
            className="gs-collection"
            key={collection.genre}
            to={`/explore?genre=${collection.genre}`}
          >
            <img src={discoverGames.find(game => game.id === collection.game).image} alt="" />
            <div>
              <span className="gs-collection-count">
                {discoverGames.filter(game => game.genres.includes(collection.genre)).length} GAMES
              </span>
              <h2>{collection.title}</h2>
              <p>{collection.subtitle}</p>
              <span className="gs-round-button">
                <GSIcon name="arrow" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="gs-inline-note">
        장르별로 구성한 데모 컬렉션입니다. 컬렉션을 선택하면 해당 장르의 게임을 볼 수 있습니다.
      </p>
    </>
  )
}

export function ActivityPage() {
  return (
    <>
      <PageHeading
        title="Recently Played"
        description="당신의 모험이 남긴 작은 기록들. 데모 플레이 기록을 확인해보세요."
      />
      <RecentActivity expanded />
    </>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, changeLanguage, wishlist } = useGameSense()
  const { isAuthenticated } = useAuth()
  return (
    <>
      <PageHeading title="Make It Yours" description="당신에게 편안한 GameSense를 만들어보세요." />
      <div className="gs-settings-panel gs-panel">
        {isAuthenticated && <AccountSettings />}
        <section>
          <div>
            <h2>화면 테마</h2>
            <p>편안한 밝기로 게임을 탐색하세요.</p>
          </div>
          <div className="gs-settings-options" role="group" aria-label="테마 설정">
            {[
              ['dark', 'moon', '다크'],
              ['light', 'sun', '라이트'],
              ['system', 'settings', '시스템'],
            ].map(([value, icon, label]) => (
              <button
                key={value}
                aria-pressed={theme === value}
                className={theme === value ? 'active' : ''}
                onClick={() => setTheme(value)}
              >
                <GSIcon name={icon} size={20} />
                {label}
              </button>
            ))}
          </div>
        </section>
        <section>
          <div>
            <h2>메뉴 언어</h2>
            <p>탐색 메뉴와 목록 제목의 표시 언어를 선택하세요.</p>
          </div>
          <div className="gs-settings-options" role="group" aria-label="메뉴 언어 설정">
            {[
              ['en', 'English'],
              ['ko', '한국어'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={language === value ? 'active' : ''}
                aria-pressed={language === value}
                onClick={() => changeLanguage(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
        <section>
          <div>
            <h2>나의 데모 데이터</h2>
            <p>위시리스트 {wishlist.length}개 · 테마와 메뉴 언어는 이 브라우저에 저장됩니다.</p>
          </div>
          <Link to="/wishlist" className="gs-text-link">
            찜 목록 보기
            <GSIcon name="arrow" size={18} />
          </Link>
        </section>
        <section>
          <div>
            <h2>구매 내역과 소비 분석</h2>
            <p>기존 지출 분석 대시보드와 구매 내역을 확인하세요.</p>
          </div>
          <Link to="/purchases" className="gs-text-link">
            구매 내역
            <GSIcon name="arrow" size={18} />
          </Link>
        </section>
      </div>
      <p className="gs-inline-note">
        GameSense Demo · 실제 게임 계정, 결제 또는 AI 서비스에 연결되어 있지 않습니다.
      </p>
    </>
  )
}
