import Heading from './section/Heading'
import SteamLock from './section/SteamLock'
import Analysis from './section/Analysis'

// 분석 화면 맨 위의 AI 분석 영역: 제목 → 소비 유형 → 분석 태그 → 시각 데이터 → 고른 태그의 AI 결과 카드. 그 아래에 데이터 패널이 이어진다.
// renderVisual(topic)은 태그에 맞는 시각 데이터 카드를 그려 주는 함수다 (어떤 데이터를 보여줄지는 호출하는 쪽이 정한다).
// ask는 결과 카드 아래에 이어 붙일 직접 질문 영역이다 (무엇을 보여줄지는 호출하는 쪽이 정한다).
// onLinkSteam을 주면 스팀 연동 전 안내를 보여주고 AI는 부르지 않는다.
export default function AiAnalysisSection({ title, description, renderVisual, ask, onLinkSteam }) {
  return (
    <section
      id="ai-insight"
      className="scroll-mt-[92px] rounded-[24px] border border-insight-border bg-insight-bg shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px]"
    >
      {onLinkSteam ? (
        <>
          <Heading title={title} description={description} />
          <SteamLock onLinkSteam={onLinkSteam} />
        </>
      ) : (
        <Analysis title={title} description={description} renderVisual={renderVisual} ask={ask} />
      )}
    </section>
  )
}
