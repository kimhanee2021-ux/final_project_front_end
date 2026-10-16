import { useState } from 'react'
import { LANGUAGE_LABEL } from '../reviewModel'

const FOLD_LENGTH = 200

// 리뷰 한 건. 내용은 텍스트로만 출력한다 (HTML 삽입 금지).
export default function ReviewItem({ review }) {
  const [open, setOpen] = useState(false)
  const isLong = review.content.length > FOLD_LENGTH

  return (
    <article className="py-[14px] border-t border-gs-border first:border-t-0">
      <div className="flex flex-wrap items-center gap-[8px] text-[12.5px]">
        <span className={review.recommended ? 'font-[700] text-gs-mint' : 'font-[700] text-[#f87171]'}>
          {review.recommended ? '👍 추천' : '👎 비추천'}
        </span>
        <span className="text-gs-muted">플레이 {review.playtimeHours}시간</span>
        <span className="text-gs-muted">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
        <span className="px-[6px] rounded-[5px] bg-gs-raised text-gs-muted text-[11px]">
          {LANGUAGE_LABEL[review.language] ?? review.language}
        </span>
      </div>

      <p className={`my-[8px] whitespace-pre-wrap leading-[1.6] break-words ${isLong && !open ? 'line-clamp-4' : ''}`}>
        {review.content}
      </p>
      {isLong && (
        <button type="button" onClick={() => setOpen(v => !v)} className="text-[12.5px] text-gs-mint cursor-pointer">
          {open ? '접기' : '펼치기'}
        </button>
      )}

      <div className="mt-[6px] text-[12.5px] text-gs-muted">
        {review.helpfulCount}명이 도움이 됐다고 평가했어요
      </div>
    </article>
  )
}
