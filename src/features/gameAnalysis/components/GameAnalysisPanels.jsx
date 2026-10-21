import { useState } from 'react'
import { Panel } from '@/shared/ui'
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

// AI 분석 페이지의 게임별 데이터: 패널 하나에 정보 하나씩 나열하는 구성.
export default function GameAnalysisPanels({ games, asOf }) {
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
    <>
      {SECTIONS.map(({ id, label }) => (
        <Panel key={id} id={id}>
          {panels[id](label)}
        </Panel>
      ))}
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  )
}
