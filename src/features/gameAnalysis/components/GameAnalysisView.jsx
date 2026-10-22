import { useState } from 'react'
import { PageHeading, PanelPage, Panel } from '@/shared/ui'
import GenrePanel from './GenrePanel'
import GenreCountPanel from './GenreCountPanel'
import ValueBandPanel from './ValueBandPanel'
import ValueRankPanel from './ValueRankPanel'
import ActivityPanel from './ActivityPanel'
import GameListPanel from './GameListPanel'
import { GameDetailDialog } from '@/features/spending'
import { bestValueList, genreCounts, genreOverview, playtimeList, recentActivities, valueBands } from '../model/gameAnalysisModel'

const SECTIONS = [
  { id: 'genre', label: '장르별 보유 게임 가격' },
  { id: 'genreCount', label: '보유 게임 장르 분석' },
  { id: 'valueBand', label: '게임 가성비' },
  { id: 'activity', label: '최근 활동' },
  { id: 'value', label: '가성비 랭킹' },
  { id: 'list', label: '플레이 시간 & 가성비 목록' },
]

// "나의 분석 > 게임별 분석": 패널 하나에 정보 하나씩 나열하는 구성.
export default function GameAnalysisView({ games, asOf }) {
  const [selectedGame, setSelectedGame] = useState(null)
  const panels = {
    genre: label => <GenrePanel eyebrow={label} overview={genreOverview(games)} />,
    genreCount: label => <GenreCountPanel eyebrow={label} counts={genreCounts(games)} />,
    valueBand: label => <ValueBandPanel eyebrow={label} bands={valueBands(games)} onSelect={setSelectedGame} />,
    activity: label => <ActivityPanel eyebrow={label} activities={recentActivities(games, asOf)} />,
    value: label => <ValueRankPanel eyebrow={label} ranking={bestValueList(games)} />,
    list: label => <GameListPanel eyebrow={label} rows={playtimeList(games)} onSelect={setSelectedGame} />,
  }
  return (
    <PanelPage>
      {SECTIONS.map(({ id, label }, index) => (
        <Panel key={id} id={id}>
          {index === 0 && <PageHeading title="게임별 분석" description="패널마다 하나씩, 내 게임을 살펴보세요." />}
          {panels[id](label)}
        </Panel>
      ))}
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </PanelPage>
  )
}
