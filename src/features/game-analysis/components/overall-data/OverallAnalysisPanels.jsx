import { useState } from 'react'
import { Panel } from '@/shared/ui'
import { GameDetailDialog, PurchasedGamesTable } from '@/features/spending'
import { scrollToPanel } from '@/shared/utils/smoothScroll'
import { overallStats } from '../../model/gameAnalysisModel'
import { GAMES_SECTION, OVERALL_SECTIONS } from '../../model/analysisSections'
import TotalSpentPanel from './TotalSpentPanel'
import HourlyValuePanel from './HourlyValuePanel'
import PlaytimePanel from './PlaytimePanel'
import AveragePricePanel from './AveragePricePanel'
import UnplayedPanel from './UnplayedPanel'

// 섹션 id → 그 지표를 그리는 패널. 지표를 늘릴 때는 analysisSections에 섹션을, 여기에 패널을 하나씩 더한다.
const PANELS = {
  total: TotalSpentPanel,
  hourly: HourlyValuePanel,
  playtime: PlaytimePanel,
  average: AveragePricePanel,
  unplayed: UnplayedPanel,
}

// AI 분석 페이지의 종합 데이터: 지표 하나가 패널 하나를 차지하고, 맨 아래에 보유 게임 표가 이어진다.
// hasHistory가 false(구매 내역을 아직 안 가져옴)이면 게임 목록의 구매 금액·시간당 비용 칸을 "확인 필요"로 보여준다.
// 데모처럼 값이 없으면(undefined) 평소대로 보여준다.
export default function OverallAnalysisPanels({ games, hasHistory }) {
  const stats = overallStats(games)
  const [filter, setFilter] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)
  // 미플레이 패널의 "모두 보기": 표를 미플레이 필터로 바꾸고 표로 이동한다
  const showUnplayed = event => {
    setFilter('unplayed')
    scrollToPanel(event, GAMES_SECTION.id)
  }
  return (
    <>
      {OVERALL_SECTIONS.map(({ id, label, icon }) => {
        const MetricPanel = PANELS[id]
        return (
          <Panel key={id} id={id}>
            <MetricPanel eyebrow={label} icon={icon} stats={stats} onShowUnplayed={showUnplayed} />
          </Panel>
        )
      })}
      <Panel id={GAMES_SECTION.id}>
        <PurchasedGamesTable
          games={games}
          filter={filter}
          setFilter={setFilter}
          onSelect={setSelectedGame}
          needsHistory={hasHistory === false}
          scrollable
          icon={GAMES_SECTION.icon}
        />
        <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
      </Panel>
    </>
  )
}
