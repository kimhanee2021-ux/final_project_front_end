import { Link } from 'react-router-dom'
import { useGameSense } from '../../contexts/GameSenseContext'
import { useTheme } from '../../hooks/useTheme'
import GSIcon from '../../components/common/GSIcon'
import { useAuth } from '../../features/auth/context/AuthContext'
import AccountSettings from '../../features/user/components/AccountSettings'
import PageHeading from '../../components/common/PageHeading'

export default function SettingsPage() {
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
