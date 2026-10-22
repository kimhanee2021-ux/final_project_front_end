// [추가] 카드 썸네일 왼쪽 위의 판단 배지.
// 스팀 게임(숫자 id)만 보여 주고, AI 분석을 한 번이라도 돌린 뒤에만 나타난다.
// 글자/배경색은 라이트·다크 테마와 상관없이 고정해서 어디서나 같은 대비로 보이게 한다.
import { useEffect, useState } from 'react'
import { fetchBuyAdvice } from './api'
import { useWishlistSummary } from './WishlistSummaryContext'

// 판단 값 → 배지 글자와 고정 색 (배경은 진하게, 글자는 흰색)
// 세 가지 색을 서로 뚜렷이 다르게 정함: 기다려요(주황), 지금 사요(파랑), 정보 부족(회색)
const BADGE = {
  WAIT: { label: '기다려요', bg: '#b45309' },
  BUY: { label: '지금 사요', bg: '#1d4ed8' },
  UNKNOWN: { label: '정보 부족', bg: '#6b7280' },
  // [추가] 출시 1년 미만인 신작: 보라색 '신작' 스티커 (정보 부족과 구분)
  NEW: { label: '신작', bg: '#7c3aed' },
}

export default function WishlistVerdictBadge({ item }) {
  const [advice, setAdvice] = useState(null)
  const { items } = useWishlistSummary() // AI 분석 결과 (한 번이라도 돌렸으면 값이 있음)
  const steam = typeof item.id === 'number'

  // 훅은 항상 최상단에서 호출해야 한다 (조건문/early return보다 앞에 둬야 훅 개수가 렌더마다 달라지지 않음)
  // 아직 AI 분석을 한 번도 안 돌렸거나 스팀 게임이 아니면 요청하지 않는다
  useEffect(() => {
    if (!items || !steam) return

    let alive = true
    fetchBuyAdvice(item.id)
      .then(d => { if (alive) setAdvice(d) })
      .catch(() => { if (alive) setAdvice({ verdict: 'UNKNOWN', status: 'ERROR' }) })
    return () => { alive = false } // 언마운트되면 상태 업데이트를 막는다
  }, [item.id, steam, items])

  // 아직 AI 분석을 한 번도 안 돌렸으면 배지를 그리지 않는다
  // (버튼을 누르기 전에는 화면을 깔끔하게 유지)
  if (!items) return null

  // 데모 게임이거나 아직 응답이 안 왔으면 배지를 그리지 않는다
  if (!steam || !advice) return null

  // [추가] 판단 불가 중 reasonCode가 NEW면 신작 스티커를 붙인다
  const kind = advice.verdict === 'UNKNOWN' && advice.reasonCode === 'NEW' ? 'NEW' : advice.verdict
  const b = BADGE[kind] ?? BADGE.UNKNOWN

  return (
    // 썸네일 왼쪽 위에 붙는다. 하트 버튼은 오른쪽 위에 그대로 있다
    <span
      className="absolute left-[8px] top-[8px] rounded-full px-[9px] py-[3px] text-[11px] font-medium text-white"
      style={{ background: b.bg }}
    >
      {b.label}
    </span>
  )
}