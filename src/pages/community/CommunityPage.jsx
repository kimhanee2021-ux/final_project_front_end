import { Link } from 'react-router-dom'
import { PageHeading, PanelPage } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { CommunityBriefing } from '@/features/community-briefing'

export default function CommunityPage() {
  const { isAuthenticated } = useAuth()
  return <PanelPage><section className="min-w-0" aria-labelledby="gs-briefing-title">
    <PageHeading id="gs-briefing-title" title="AI 게임 브리핑" description="게임별 공지와 업데이트를 분석해 필요한 정보를 찾아드려요." />
    <CommunityBriefing enabled={isAuthenticated} />
    {!isAuthenticated && <div><p>로그인하면 게임별 AI 브리핑을 볼 수 있어요.</p>
      <Link className="gs-primary-button mt-[16px]" to="/login?next=%2Fcommunity">로그인하기</Link>
    </div>}
  </section></PanelPage>
}
