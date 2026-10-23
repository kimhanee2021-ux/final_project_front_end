import { useState } from 'react'
import EvaluationNotice from '../EvaluationNotice'
import { RESOLUTIONS } from '../../model/pcResolutions'
import ResolutionPicker from './ResolutionPicker'
import GameSourceButtons from './GameSourceButtons'
import GameSearch from './GameSearch'
import ListingSummary from './ListingSummary'
import GradeTable from './GradeTable'
import ListPager from './ListPager'

// 게임별 예상 성능표: 내 보유게임 또는 검색한 게임을 AI가 해상도별 등급으로 분석한 결과를 보여준다.
// 평가 기준(해상도)을 고르면 그 해상도의 등급만 보여주고, 게임 이름을 누르면 자세한 분석을 연다.
export default function GamePerformance({ evaluation, onDetails }) {
  const { status, diagnosis, gameList } = evaluation
  const [resolution, setResolution] = useState('FHD')
  if (status !== 'ready') return <EvaluationNotice status={status} />
  const { games, listing, showSearch, error, expanded } = gameList
  const busy = diagnosis.busy !== null
  const scope = showSearch ? 'search' : 'owned'
  const selected = RESOLUTIONS.find(item => item.id === resolution) ?? null

  return (
    <section>
      <ResolutionPicker resolution={resolution} onChange={setResolution} />
      <GameSourceButtons gameList={gameList} />
      {showSearch && <GameSearch gameList={gameList} />}
      <ListingSummary gameList={gameList} />
      <GradeTable games={games} selected={selected} diagnosis={diagnosis} busy={busy} scope={scope} showSearch={showSearch} onDetails={onDetails} />

      {busy && (
        <p className="mt-[12px] text-[12px] text-muted" role="status">
          공식 사양 확인 및 AI 분석 중 · {diagnosis.elapsed ?? 0}초 경과 · 완료된 결과는 유지돼요.{' '}
          <button type="button" className="bg-transparent text-primary-text underline" onClick={diagnosis.cancel}>
            진단 취소
          </button>
        </p>
      )}
      {!showSearch && expanded && listing.pages > 1 && (
        <ListPager listing={listing} onPrev={() => gameList.setPage(current => current - 1)} onNext={() => gameList.setPage(current => current + 1)} />
      )}
      {error && (
        <p role="alert" className="mt-[12px] text-[13px] text-[#e5484d]">
          {error}
        </p>
      )}
    </section>
  )
}
