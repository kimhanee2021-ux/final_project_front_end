import { useState } from 'react'
import GameRatingList from './GameRatingList'
import GameReviewDetail from './GameReviewDetail'

// 리뷰·평점 본문. 커뮤니티의 '리뷰·평점' 칩에서만 사용한다. (/reviews 페이지는 제거됨)
// 게임 목록 → 게임 선택 → 상세 리뷰 순서로 화면이 바뀐다.
export default function ReviewBoard() {
  const [selected, setSelected] = useState(null)

  return selected ? (
    <GameReviewDetail game={selected} onBack={() => setSelected(null)} />
  ) : (
    <GameRatingList onSelect={setSelected} />
  )
}
