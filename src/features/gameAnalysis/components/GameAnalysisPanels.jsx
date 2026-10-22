import { useState } from 'react'
import { Panel } from '@/shared/ui'
import GenrePanel from './GenrePanel'
import ValueBandPanel from './ValueBandPanel'
import ActivityPanel from './ActivityPanel'
import { GameDetailDialog } from '@/features/spending'
import { genreCounts, genreOverview, recentActivities, valueBands } from '../model/gameAnalysisModel'
import { GAME_SECTIONS } from '../model/analysisSections'

// AI 분석 페이지의 게임별 데이터: 패널 하나에 정보 하나씩 나열하는 구성.
// genreView: 장르 패널의 기준(금액/보유·플레이). AI 분석에서 고른 주제에 맞춰 바깥에서 바꿀 수 있게 받는다.
export default function GameAnalysisPanels({ games, asOf, genreView, onGenreViewChange }) {
  const [selectedGame, setSelectedGame] = useState(null)
  const panels = {
    genre: (label, icon) => (
      <GenrePanel
        eyebrow={label}
        icon={icon}
        overview={genreOverview(games)}
        counts={genreCounts(games)}
        view={genreView}
        onViewChange={onGenreViewChange}
      />
    ),
    valueBand: (label, icon) => <ValueBandPanel eyebrow={label} icon={icon} bands={valueBands(games)} onSelect={setSelectedGame} />,
    activity: (label, icon) => <ActivityPanel eyebrow={label} icon={icon} activities={recentActivities(games, asOf)} />,
  }
  return (
    <>
      {GAME_SECTIONS.map(({ id, label, icon }) => (
        <Panel key={id} id={id}>
          {panels[id](label, icon)}
        </Panel>
      ))}
      <GameDetailDialog game={selectedGame} onClose={() => setSelectedGame(null)} />
    </>
  )
}
