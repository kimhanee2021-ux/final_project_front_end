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
      <div className="min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] p-[10px_28px] max-w-[1050px] max-[600px]:p-[0_19px] [&>section]:flex [&>section]:items-center [&>section]:justify-between [&>section]:gap-[25px] [&>section]:p-[29px_0] [&>section+section]:border-t [&>section+section]:border-gs-border max-[1120px]:[&>section]:items-start max-[1120px]:[&>section]:flex-col max-[1120px]:[&>section]:gap-[16px] [&_h2]:text-[15px] [&_h2]:mb-[6px] [&_p]:text-gs-muted [&_p]:text-[11px]">
        {isAuthenticated && <AccountSettings />}
        <section>
          <div>
            <h2>화면 테마</h2>
            <p>편안한 밝기로 게임을 탐색하세요.</p>
          </div>
          <div className="flex flex-wrap gap-[7px]" role="group" aria-label="테마 설정">
            {[
              ['dark', 'moon', '다크'],
              ['light', 'sun', '라이트'],
              ['system', 'settings', '시스템'],
            ].map(([value, icon, label]) => (
              <button
                key={value}
                aria-pressed={theme === value}
                className={`flex items-center justify-center gap-[8px] bg-gs-raised p-[11px_17px] rounded-[9px] text-[12px] border border-gs-border whitespace-nowrap max-[600px]:p-[11px_13px] max-[600px]:text-[11px] ${theme === value ? 'text-gs-mint border-gs-mint bg-gs-active' : ''}`}
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
          <div className="flex flex-wrap gap-[7px]" role="group" aria-label="메뉴 언어 설정">
            {[
              ['en', 'English'],
              ['ko', '한국어'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`flex items-center justify-center gap-[8px] bg-gs-raised p-[11px_17px] rounded-[9px] text-[12px] border border-gs-border whitespace-nowrap max-[600px]:p-[11px_13px] max-[600px]:text-[11px] ${language === value ? 'text-gs-mint border-gs-mint bg-gs-active' : ''}`}
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
          <Link to="/wishlist" className="inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint">
            찜 목록 보기
            <GSIcon name="arrow" size={18} />
          </Link>
        </section>
        <section>
          <div>
            <h2>구매 내역과 소비 분석</h2>
            <p>기존 지출 분석 대시보드와 구매 내역을 확인하세요.</p>
          </div>
          <Link to="/purchases" className="inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint">
            구매 내역
            <GSIcon name="arrow" size={18} />
          </Link>
        </section>
      </div>
      <p className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]">
        GameSense Demo · 실제 게임 계정, 결제 또는 AI 서비스에 연결되어 있지 않습니다.
      </p>
    </>
  )
}
