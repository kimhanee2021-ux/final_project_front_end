import { RadarChart, CountUp } from '@/shared/ui'
import { performanceSummary } from '../mocks/performanceMock'

// 종합 점수: 왼쪽에 큰 점수와 등급, 오른쪽에 부품별 점수 레이더 하나. 점수는 예시 값이다.
export default function ScorePanel({ hardware }) {
  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-[48px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[32px]">
      <div>
        <p aria-label={`종합 성능 ${performanceSummary.score}점`}>
          <strong className="text-[72px] font-[750] tracking-[-3px] leading-none tabular-nums"><CountUp value={performanceSummary.score} /></strong>
          <span className="ml-[8px] text-[20px] text-faint">/ 100</span>
        </p>
        <strong className="block mt-[20px] text-[20px] font-[700]">
          등급 {performanceSummary.grade} · {performanceSummary.title}
        </strong>
        <p className="mt-[6px] text-[14px] text-muted">대부분의 최신 게임을 원활하게 즐길 수 있는 우수한 성능입니다. (예시 사양 기준)</p>
      </div>
      <RadarChart items={hardware.map(item => ({ label: item.name, value: item.score }))} />
    </div>
  )
}
