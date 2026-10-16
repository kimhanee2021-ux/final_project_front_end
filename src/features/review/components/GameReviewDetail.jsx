import { useCallback, useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { fetchReviews, fetchReviewSummary } from '../api'
import ReviewItem from './ReviewItem'

const PAGE_SIZE = 10
const SORT_OPTIONS = [
  ['RECENT', '최신순 (작성일 기준)'],
  ['HELPFUL', '도움됨순'],
]
const TYPE_OPTIONS = [
  ['ALL', '추천·비추천 전체'],
  ['POSITIVE', '추천만'],
  ['NEGATIVE', '비추천만'],
]
// 기본값은 한국어. 한국어 리뷰가 없으면 '모든 언어'로 바꾸라는 안내를 띄운다.
const LANGUAGE_OPTIONS = [
  ['korean', '내 언어: 한국어'],
  ['english', 'English'],
  ['all', '모든 언어'],
]

// 게임 한 개의 리뷰 상세 화면: 평점 요약 + 필터 + 리뷰 목록(더 보기)
export default function GameReviewDetail({ game, onBack }) {
  const [summary, setSummary] = useState(null)
  const [sort, setSort] = useState('RECENT')
  const [type, setType] = useState('ALL')
  const [language, setLanguage] = useState('korean')
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState('*')
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  useEffect(() => {
    let alive = true
    fetchReviewSummary(game.appId)
      .then(data => {
        if (alive) setSummary(data)
      })
      .catch(() => {
        if (alive) setSummary(null)
      })
    return () => {
      alive = false
    }
  }, [game.appId])

  const load = useCallback(
    async (nextCursor, reset) => {
      const id = ++requestId.current
      setLoading(true)
      setError(null)
      try {
        const data = await fetchReviews(game.appId, {
          sort,
          type,
          language,
          cursor: nextCursor,
          size: PAGE_SIZE,
        })
        // 필터를 바꿔서 이전 요청이 늦게 도착하면 결과를 버린다
        if (id !== requestId.current) return
        setItems(prev => (reset ? data.items : [...prev, ...data.items]))
        setCursor(data.nextCursor ?? '*')
        setHasMore(Boolean(data.hasMore))
      } catch {
        if (id === requestId.current) setError('리뷰를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [game.appId, sort, type, language],
  )

  // 게임이나 필터가 바뀌면 처음부터 다시 불러온다
  useEffect(() => {
    setItems([])
    setHasMore(false)
    load('*', true)
  }, [load])

  const ratio = summary ? Math.round(summary.positiveRatio * 100) : 0
  const recentRatio =
    summary?.recentPositiveRatio == null ? null : Math.round(summary.recentPositiveRatio * 100)

  return (
    <section>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-[6px] mb-[12px] text-gs-muted text-[13px] cursor-pointer"
      >
        <GSIcon name="arrowLeft" size={16} />
        게임 목록으로
      </button>

      <h2 className="text-[22px] font-[650] mb-[12px]">{game.name}</h2>

      <div className="p-[16px] mb-[14px] border border-gs-border rounded-[12px] bg-gs-panel">
        {summary ? (
          <>
            <div className="text-[22px] font-[700]">
              {summary.label} <span className="text-gs-muted text-[14px] font-[400]">{ratio}% 긍정</span>
            </div>
            <div className="text-gs-muted text-[12.5px]">
              전체 리뷰 {summary.totalReviews.toLocaleString('ko-KR')}개
            </div>
            <div
              className="flex h-[10px] rounded-[5px] overflow-hidden bg-gs-raised my-[10px]"
              role="img"
              aria-label={`긍정 ${ratio}퍼센트`}
            >
              <div className="bg-gs-mint" style={{ width: `${ratio}%` }} />
              <div className="bg-[#f87171]" style={{ width: `${100 - ratio}%` }} />
            </div>
            <div className="flex justify-between text-gs-muted text-[12.5px]">
              <span>추천 {summary.totalPositive.toLocaleString('ko-KR')}</span>
              <span>비추천 {summary.totalNegative.toLocaleString('ko-KR')}</span>
            </div>
            {recentRatio !== null && (
              <div className="mt-[8px] text-gs-muted text-[12.5px]">
                최근 30일 {recentRatio}% 긍정 ({(summary.recentPositive + summary.recentNegative).toLocaleString('ko-KR')}개)
              </div>
            )}
          </>
        ) : (
          <p className="text-gs-muted text-[13px]">평점 정보를 불러오지 못했어요.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-[8px] mb-[12px]">
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="정렬" className="px-[12px] h-[36px] border border-gs-border rounded-[10px] bg-gs-panel text-[12px]">
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} aria-label="추천 여부" className="px-[12px] h-[36px] border border-gs-border rounded-[10px] bg-gs-panel text-[12px]">
          {TYPE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="언어" className="px-[12px] h-[36px] border border-gs-border rounded-[10px] bg-gs-panel text-[12px]">
          {LANGUAGE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && <p className="p-[24px_0] text-center text-gs-muted text-[13px]">{error}</p>}
      {loading && items.length === 0 && !error && (
        <p className="p-[24px_0] text-center text-gs-muted text-[13px]">불러오는 중…</p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="p-[24px_0] text-center text-gs-muted text-[13px]">
          {language === 'all' ? '조건에 맞는 리뷰가 아직 없어요.' : '이 언어로 쓴 리뷰가 아직 없어요. 필터에서 모든 언어를 선택해 보세요.'}
        </p>
      )}

      {items.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}

      {hasMore && (
        <button
          type="button"
          disabled={loading}
          onClick={() => load(cursor, false)}
          className="w-full mt-[8px] p-[10px] border border-dashed border-gs-border rounded-[10px] text-gs-muted cursor-pointer disabled:opacity-60"
        >
          {loading ? '불러오는 중…' : '리뷰 더 보기'}
        </button>
      )}
    </section>
  )
}
