import { performanceSummary } from '../mocks/performanceMock'

export default function ScoreGauge() {
  return (
    <div
      className="pc-gauge"
      role="img"
      aria-label={`종합 성능 ${performanceSummary.score}점, ${performanceSummary.label}`}
    >
      <svg viewBox="0 0 200 180" aria-hidden="true">
        <defs>
          <linearGradient id="pc-score-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#00b7bf" />
            <stop offset=".6" stopColor="#00e2c3" />
            <stop offset="1" stopColor="#54f1ae" />
          </linearGradient>
        </defs>
        <path className="pc-gauge-track" d="M 39 150 A 78 78 0 1 1 161 150" pathLength="100" />
        <path
          className="pc-gauge-fill"
          d="M 39 150 A 78 78 0 1 1 161 150"
          pathLength="100"
          strokeDasharray={`${performanceSummary.score} 100`}
        />
      </svg>
      <div className="pc-gauge-value">
        <strong>{performanceSummary.score}</strong>
        <span>/ 100</span>
      </div>
      <b>{performanceSummary.label}</b>
    </div>
  )
}
