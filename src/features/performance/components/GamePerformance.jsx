import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import EvaluationNotice from './EvaluationNotice'
import { resolutionTarget } from '../model/pcGrade'

const RESOLUTIONS = [
  { id: 'FHD', label: 'FHD', pixels: '1080p' },
  { id: 'QHD', label: 'QHD', pixels: '1440p' },
  { id: '4K', label: '4K', pixels: '2160p' },
]

// 게임별 예상 성능표: 내 보유게임 또는 검색한 게임을 AI가 해상도별 등급으로 분석한 결과를 보여준다.
// 해상도를 고르면 해당 열만 강조하고, 게임 이름을 누르면 자세한 분석을 연다.
export default function GamePerformance({ evaluation, onDetails }) {
  const { status, diagnosis, gameList } = evaluation
  const [resolution, setResolution] = useState('FHD')
  if (status !== 'ready') return <EvaluationNotice status={status} />
  const { games, listing, showSearch, loading, error, candidates, query, setQuery, expanded } = gameList
  const busy = diagnosis.busy !== null
  const scope = showSearch ? 'search' : 'owned'

  const emptyCell = game => {
    if (diagnosis.gameErrors?.[game.appId]) return '분석 실패'
    return busy ? 'AI 분석 중…' : '분석 전'
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px] text-[13px] text-muted">
        <label className="flex items-center gap-[10px]">
          평가 기준
          <select
            className="h-[34px] px-[14px] rounded-full bg-bg border-0 text-text text-[13px]"
            aria-label="게임 성능 평가 해상도"
            value={resolution}
            onChange={event => setResolution(event.target.value)}
          >
            {RESOLUTIONS.map(item => (
              <option key={item.id} value={item.id}>
                {item.label} ({item.pixels})
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-[8px]">
          <button type="button" className="gs-secondary-button" aria-pressed={!showSearch} disabled={loading} onClick={gameList.showOwned}>
            <GSIcon name="library" size={15} />
            {loading && !showSearch ? '불러오는 중…' : '내 보유게임 가져오기'}
          </button>
          <button type="button" className="gs-secondary-button" aria-pressed={showSearch} onClick={gameList.openSearch}>
            <GSIcon name="search" size={15} />
            다른 게임 검색하기
          </button>
        </div>
      </div>

      {showSearch && (
        <form className="flex items-center gap-[8px] mb-[16px]" onSubmit={gameList.search}>
          <input
            className="flex-1 min-w-0 h-[44px] px-[16px] rounded-[14px] border-0 bg-bg text-text text-[14px]"
            aria-label="분석할 게임 이름"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="분석할 게임 이름을 입력해 주세요"
            maxLength={100}
          />
          <button type="submit" className="gs-primary-button" disabled={loading}>
            {loading ? '검색·분석 중…' : '검색'}
          </button>
        </form>
      )}
      {showSearch && candidates.length > 0 && (
        <div className="mb-[16px] p-[16px] rounded-[16px] bg-bg">
          <p className="mb-[10px] text-[13px] text-muted">정확히 일치하는 게임이 없어 후보를 찾았어요. 분석할 게임 하나를 선택해 주세요.</p>
          <div className="flex flex-wrap gap-[8px]">
            {candidates.map(game => (
              <button key={game.appId} type="button" className="gs-secondary-button !bg-surface" disabled={loading} onClick={() => gameList.selectSearchGame(game)}>
                {game.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {!showSearch && listing.total > 0 && (
        <div className="flex items-center justify-between gap-[12px] mb-[12px] text-[13px] text-muted">
          <span>
            {listing.hasPlaytime ? '플레이시간 상위 순' : '플레이시간 기록 없음 · 이름순'} · {listing.total}개
          </span>
          {listing.total > 5 && (
            <button type="button" className="inline-flex items-center gap-[6px] bg-transparent text-muted hover:text-text" aria-expanded={expanded} onClick={gameList.toggleExpanded}>
              {expanded ? '접기' : '전체 보기'}
              <GSIcon name="arrow" size={15} />
            </button>
          )}
        </div>
      )}

      <div className="pc-table-scroll" tabIndex={0} role="region" aria-label="게임별 해상도 성능 비교표">
        <table className="pc-game-table">
          <caption className="sr-only">내 PC 사양 기준 게임별 AI 예상 성능 등급. 실측 FPS가 아니라 AI 추정이에요.</caption>
          <thead>
            <tr>
              <th scope="col">게임 제목</th>
              {RESOLUTIONS.map(item => (
                <th scope="col" key={item.id} className={resolution === item.id ? 'is-selected' : ''}>
                  {item.label}
                  <small>({item.pixels})</small>
                </th>
              ))}
              <th scope="col">AI 분석</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => {
              const result = diagnosis.results[game.appId]
              const failed = diagnosis.gameErrors?.[game.appId]
              return (
                <tr key={game.appId}>
                  <th scope="row">
                    <button className="pc-game-button" onClick={() => onDetails({ type: 'game', game, result })}>
                      {game.iconUrl ? <img src={game.iconUrl} alt="" loading="lazy" /> : <GSIcon name="gamepad" size={20} />}
                      <span>
                        {game.name}
                        {game.playtimeForever > 0 && <small className="block text-faint">누적 {(game.playtimeForever / 60).toFixed(1)}시간</small>}
                      </span>
                    </button>
                  </th>
                  {RESOLUTIONS.map(item => {
                    const target = result ? resolutionTarget(result, item.id) : null
                    return (
                      <td key={item.id} className={resolution === item.id ? 'is-selected' : ''}>
                        {target ? (
                          <>
                            <strong>{target.grade ?? '—'}</strong>
                            <small> {target.grade ? target.label : '추정 어려움'}</small>
                          </>
                        ) : (
                          <span className="pc-unavailable">{emptyCell(game)}</span>
                        )}
                      </td>
                    )
                  })}
                  <td>
                    {failed ? (
                      <button type="button" className="pc-rating" disabled={busy} onClick={() => diagnosis.diagnose(game, scope, true)}>
                        다시 시도
                      </button>
                    ) : (
                      <span className="pc-rating">{result?.explanationStatus === 'READY' ? '완료' : busy ? '분석 중' : '대기'}</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {games.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <p className="py-[28px] text-center text-[14px] text-muted">보유 게임을 가져오거나, 궁금한 게임을 검색해서 분석해 보세요.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {busy && (
        <p className="mt-[12px] text-[12px] text-muted" role="status">
          공식 사양 확인 및 AI 분석 중 · {diagnosis.elapsed ?? 0}초 경과 · 완료된 결과는 유지돼요.{' '}
          <button type="button" className="bg-transparent text-primary-text underline" onClick={diagnosis.cancel}>진단 취소</button>
        </p>
      )}
      {!showSearch && expanded && listing.pages > 1 && (
        <div className="flex items-center justify-center gap-[12px] mt-[16px] text-[13px] text-muted">
          <button type="button" className="gs-secondary-button" disabled={listing.page === 0} onClick={() => gameList.setPage(current => current - 1)}>이전</button>
          <span>{listing.page + 1} / {listing.pages}</span>
          <button type="button" className="gs-secondary-button" disabled={listing.page + 1 === listing.pages} onClick={() => gameList.setPage(current => current + 1)}>다음</button>
        </div>
      )}
      {error && <p role="alert" className="mt-[12px] text-[13px] text-[#e5484d]">{error}</p>}
      <p className="mt-[16px] text-[12px] text-faint">AI 추정 등급 · A 144 FPS↑ / B 60↑ / C 30↑ / D 20↑ / E 20 미만 · 실측이나 프레임 유지 보장이 아니에요</p>
    </section>
  )
}
