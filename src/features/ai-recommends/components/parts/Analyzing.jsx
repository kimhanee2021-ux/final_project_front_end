import { useEffect, useState } from 'react'
import { STEPS } from '../../model/recommendLayout'
import Steps from './Steps'

// 추천을 불러오는 동안: 단계가 차례로 넘어가고 마지막 단계에서 응답을 기다린다.
export default function Analyzing() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setActive(step => Math.min(step + 1, STEPS.length - 1)), 1600)
    return () => clearInterval(timer)
  }, [])
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-[16px]">
      <Steps active={active} />
      <p className="text-[13px] text-muted">AI가 내 플레이 기록으로 취향을 분석하고 있어요...</p>
    </div>
  )
}
