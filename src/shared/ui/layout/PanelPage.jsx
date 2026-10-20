// 패널(Panel)들을 세로로 나열하는 페이지 틀. 패널 사이는 간격으로만 띄운다.
export default function PanelPage({ children }) {
  return <div className="gs-panel-page max-w-[1100px] mx-auto px-[24px] py-[24px] grid gap-[16px] max-[600px]:px-[16px]">{children}</div>
}
