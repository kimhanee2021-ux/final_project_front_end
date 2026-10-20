import Panel from './Panel'
import PanelPage from './PanelPage'

// 패널로 나누지 않은 화면(목록·글·안내)을 패널 박스 하나에 담는다.
export default function PageBox({ children }) {
  return (
    <PanelPage>
      <Panel>{children}</Panel>
    </PanelPage>
  )
}
