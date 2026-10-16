// [재작성 안내] 이 파일은 내가 만든 파일이다. 목업 상수 대신 사이트의 실제 게임 목록(/api/games)을 쓰도록 바꿨다.
import { useMemo, useState, useEffect } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { fetchGames, searchGames } from '../../games/api'

// 평점 순 정렬은 리뷰 수가 적은 게임의 비율이 튀는 것을 막기 위해 이 개수 이상만 보여준다.
const MIN_RATING_SORT_REVIEWS = 100
// 검색어 입력 후 이 시간(ms)이 지나야 서버에 요청한다. 타자 칠 때마다 요청하지 않으려고.
const SEARCH_DEBOUNCE_MS = 300

// 게임 목록 화면.
// - 게임 목록: 사이트 DB 기준 (/api/games, /api/games/search)
// - 긍정 비율·리뷰 수: 목록 응답 값을 그대로 쓴다 (스팀 호출 없음)
// - 게임을 누르면 상세 화면에서 스팀 리뷰를 백엔드 경유로 가져온다.
export default function GameRatingList({ onSelect }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('reviews')
  const [games, setGames] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 검색어가 바뀌면(디바운스 후) 첫 페이지부터 다시 불러온다.
  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    const timer = setTimeout(() => {
      const keyword = query.trim()
      setLoading(true)
      setError(null)
      const request = keyword
        ? searchGames({ page: 0, name: keyword, signal: controller.signal })
        : fetchGames({ page: 0, signal: controller.signal })
      request
        .then(data => {
          if (!alive) return
          setGames(data.content)
          setPage(data.page)
          setLast(data.last)
        })
        .catch(() => {
          if (alive) setError('게임 목록을 불러오지 못했어요. 백엔드가 켜져 있는지 확인해 주세요.')
        })
        .finally(() => {
          if (alive) setLoading(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      alive = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // 다음 페이지를 이어 붙인다.
  const loadMore = async () => {
    const keyword = query.trim()
    setLoading(true)
    setError(null)
    try {
      const next = page + 1
      const data = keyword
        ? await searchGames({ page: next, name: keyword })
        : await fetchGames({ page: next })
      setGames(prev => [...prev, ...data.content])
      setPage(data.page)
      setLast(data.last)
    } catch {
      setError('게임을 더 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  // 정렬은 지금 불러온 게임 안에서만 한다. (서버 정렬 API가 없어서)
  const rows = useMemo(() => {
    const list = [...games]
    if (sort === 'rating') {
      return list
        .filter(g => (g.reviewCount ?? 0) >= MIN_RATING_SORT_REVIEWS)
        .sort((a, b) => Number(b.positiveRate ?? 0) - Number(a.positiveRate ?? 0))
    }
    return list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
  }, [games, sort])

  return (
    <>
      <div className="flex flex-wrap gap-[8px] mb-[16px]">
        <label className="flex items-center gap-[9px] flex-1 min-w-[200px] px-[14px] h-[38px] border border-gs-border rounded-[25px] bg-gs-search text-gs-muted">
          <GSIcon name="search" size={16} className="shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="게임 이름으로 검색"
            aria-label="게임 검색"
            className="w-full bg-transparent border-0 outline-none text-gs-text text-[12px]"
          />
        </label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          aria-label="정렬"
          className="px-[12px] h-[38px] border border-gs-border rounded-[10px] bg-gs-panel text-[12px]"
        >
          <option value="reviews">리뷰 많은 순</option>
          <option value="rating">평점 높은 순 (리뷰 100개 이상)</option>
        </select>
      </div>

      {error && <p className="p-[24px_0] text-center text-gs-muted text-[13px]">{error}</p>}

      {!error && !loading && rows.length === 0 && (
        <p className="p-[40px_0] text-center text-gs-muted text-[13px]">조건에 맞는 게임이 없어요.</p>
      )}

      <ul className="flex flex-col gap-[8px]">
        {rows.map(game => {
          const genres = game.genre ? game.genre.split(',').slice(0, 3) : []
          return (
            <li key={game.appId}>
              <button
                type="button"
                onClick={() => onSelect({ appId: game.appId, name: game.name })}
                className="flex items-center gap-[14px] w-full min-w-0 text-left p-[10px] border border-gs-border rounded-[10px] bg-gs-panel hover:border-gs-mint"
              >
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="w-[132px] aspect-[460/215] rounded-[7px] object-cover shrink-0"
                  />
                ) : (
                  <div className="w-[132px] aspect-[460/215] rounded-[7px] shrink-0 bg-gs-raised" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-[620] text-[14px] truncate">{game.name}</div>
                  <div className="flex flex-wrap gap-[5px] mt-[5px]">
                    {genres.map(genre => (
                      <span key={genre} className="bg-gs-raised text-gs-muted text-[11px] px-[7px] py-[1px] rounded-[5px]">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-auto text-right whitespace-nowrap text-[13px]">
                  {game.positiveRate != null ? (
                    <>
                      <strong>{Math.round(Number(game.positiveRate))}%</strong>{' '}
                      <span className="text-gs-muted">({(game.reviewCount ?? 0).toLocaleString('ko-KR')})</span>
                    </>
                  ) : (
                    <span className="text-gs-muted text-[12.5px]">평점 없음</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {loading && <p className="p-[24px_0] text-center text-gs-muted text-[13px]">불러오는 중…</p>}

      {!loading && !last && (
        <button
          type="button"
          onClick={loadMore}
          className="w-full mt-[12px] p-[10px] border border-dashed border-gs-border rounded-[10px] text-gs-muted cursor-pointer"
        >
          게임 더 보기
        </button>
      )}
    </>
  )
}
