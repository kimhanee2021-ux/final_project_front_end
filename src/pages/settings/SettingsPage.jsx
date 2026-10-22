import { Link } from 'react-router-dom'
import { useGameSense, useTheme } from '@/shared/state'
import { GSIcon, SegmentedControl, PanelPage } from '@/shared/ui'
import { SettingSection } from '@/features/user'

const THEMES = [
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
  { key: 'system', label: '시스템' },
]

const linkClass = 'inline-flex items-center gap-[8px] text-[16px] font-[600] text-primary-text hover:underline'

// 설정: 항목 하나가 패널 하나.
export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { wishlist } = useGameSense()
  return (
    <PanelPage>
      <SettingSection id="theme" title="화면 테마" description="편안한 밝기로 게임을 탐색하세요.">
        <SegmentedControl label="테마 설정" options={THEMES} value={theme} onChange={setTheme} />
      </SettingSection>
      <SettingSection id="data" title="나의 데모 데이터" description={`위시리스트 ${wishlist.length}개 · 테마는 이 브라우저에 저장됩니다.`}>
        <Link to="/wishlist" className={linkClass}>
          찜 목록 보기
          <GSIcon name="arrow" size={18} />
        </Link>
      </SettingSection>
      <SettingSection id="purchases" title="구매 내역과 소비 분석" description="기존 지출 분석 대시보드와 구매 내역을 확인하세요.">
        <Link to="/purchases" className={linkClass}>
          구매 내역 보기
          <GSIcon name="arrow" size={18} />
        </Link>
        <p className="mt-[40px] text-faint text-[12px] leading-[1.8]">
          GameSense Demo · 실제 게임 계정, 결제 또는 AI 서비스에 연결되어 있지 않습니다.
        </p>
      </SettingSection>
    </PanelPage>
  )
}
