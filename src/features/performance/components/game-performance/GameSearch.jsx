// 다른 게임 검색: 이름 입력 + 정확히 맞는 게임이 없을 때의 후보 고르기
export default function GameSearch({ gameList }) {
  const { loading, candidates, query, setQuery } = gameList
  return (
    <>
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
      {candidates.length > 0 && (
        <div className="mb-[16px] p-[16px] rounded-[16px] bg-bg">
          <p className="mb-[10px] text-[13px] text-muted">
            정확히 일치하는 게임이 없어 후보를 찾았어요. 분석할 게임 하나를 선택해 주세요.
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {candidates.map(game => (
              <button
                key={game.appId}
                type="button"
                className="gs-secondary-button !bg-surface"
                disabled={loading}
                onClick={() => gameList.selectSearchGame(game)}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
