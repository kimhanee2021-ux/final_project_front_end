import { GameImage } from '@/shared/ui'
import { resolutionTarget } from '../../model/pcGrade'

// 등급 한 칸: 등급 글자와 설명. 추정이 어려우면 이유를 알 수 있게 짧게 적는다.
function GradeCell({ target }) {
  if (target.grade) {
    return (
      <>
        <strong>{target.grade}</strong>
        <small> {target.label}</small>
      </>
    )
  }
  // 등급을 못 정했으면 이유를 함께 보여준다(길면 두 줄까지, 전체는 마우스를 올리면 보인다).
  return (
    <span title={target.reason}>
      <strong>—</strong>
      <small> {target.label ?? '추정 어려움'}</small>
      {target.reason && (
        <small className="block mt-[2px] max-w-[220px] mx-auto text-[11px] text-faint leading-[1.4] line-clamp-2 whitespace-normal">
          {target.reason}
        </small>
      )}
    </span>
  )
}

// 게임별 등급 표: 게임 이름(누르면 자세한 분석) + 고른 해상도의 등급. 분석 실패한 게임은 다시 시도할 수 있다.
export default function GradeTable({ games, selected, diagnosis, busy, scope, showSearch, onDetails }) {
  return (
    <div className="pc-table-scroll" tabIndex={0} role="region" aria-label="게임별 해상도 성능 비교표">
      <table className="pc-game-table">
        <caption className="sr-only">
          내 PC 사양 기준 게임별 AI 예상 성능 등급. 실측 FPS가 아니라 AI 추정이에요.
        </caption>
        <thead>
          <tr>
            <th scope="col">게임 제목</th>
            {selected && (
              <th scope="col" className="is-selected">
                {selected.label}
                <small>({selected.pixels})</small>
              </th>
            )}
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
                    <GameImage
                      className="w-[36px] h-[46px] rounded-[8px] object-cover shrink-0"
                      src={game.iconUrl ?? game.headerImage}
                      iconSize={20}
                    />
                    <span>
                      {game.name}
                      {game.playtimeForever > 0 && (
                        <small className="block text-faint">누적 {(game.playtimeForever / 60).toFixed(1)}시간</small>
                      )}
                    </span>
                  </button>
                </th>
                {selected && (
                  <td className="is-selected">
                    {result ? (
                      <GradeCell target={resolutionTarget(result, selected.id)} />
                    ) : failed ? (
                      <button
                        type="button"
                        className="pc-rating"
                        disabled={busy}
                        onClick={() => diagnosis.diagnose(game, scope, true)}
                      >
                        분석 실패 · 다시 시도
                      </button>
                    ) : (
                      <span className="pc-rating">{busy ? '분석 중…' : '대기'}</span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
          {games.length === 0 && (
            <tr>
              <td colSpan={selected ? 2 : 1}>
                <p className="py-[28px] text-center text-[14px] text-muted">
                  {showSearch
                    ? '위에서 분석할 게임 이름을 검색해 보세요.'
                    : '보유 게임을 가져오거나, 궁금한 게임을 검색해서 분석해 보세요.'}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
