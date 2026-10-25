import { PageHeading, Panel, PanelPage } from '@/shared/ui'
import { NaturalSearchPanel } from '@/features/natural-search'

// 자연어 검색: 문장으로 설명한 게임을 AI가 찾아준다. 로그인은 라우터의 RequireAuth가 확인한다.
export default function NaturalSearchPage() {
  return (
    <PanelPage>
      <Panel id="natural-search">
        <PageHeading title="자연어 검색" description="원하는 게임을 말하듯이 적으면 AI가 알맞은 게임을 찾아줘요." />
        <NaturalSearchPanel />
      </Panel>
    </PanelPage>
  )
}
