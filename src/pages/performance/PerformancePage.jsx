import { useEffect, useState } from 'react'
import GSIcon from '../../components/common/GSIcon'
import { diagnosticSteps, hardware, performanceSummary, systemMetrics, upgrades } from '../../features/performance/mocks/performanceMock'
import PanelHeading from '../../features/performance/components/PanelHeading'
import ScoreGauge from '../../features/performance/components/ScoreGauge'
import HardwareCard from '../../features/performance/components/HardwareCard'
import GamePerformance from '../../features/performance/components/GamePerformance'
import DetailsDialog from '../../features/performance/components/DetailsDialog'
import '../../styles/performance.css'

export default function PerformancePage() {
  const [details, setDetails] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [lastScan, setLastScan] = useState(null)
  useEffect(() => {
    if (!isScanning) return
    const timers = diagnosticSteps.map((_, index) =>
      window.setTimeout(() => setScanStep(index), index * 650)
    )
    const finish = window.setTimeout(() => {
      setIsScanning(false)
      setLastScan(new Date())
    }, diagnosticSteps.length * 650)
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(finish)
    }
  }, [isScanning])
  const diagnose = () => {
    if (!isScanning) {
      setScanStep(0)
      setIsScanning(true)
    }
  }
  const scanPercent = Math.round(((scanStep + 1) / diagnosticSteps.length) * 100)
  return (
    <div className="pc-page">
      <section className="pc-hero" aria-labelledby="pc-page-title">
        <div className="pc-hero-background" />
        <div className="pc-hero-copy">
          <p className="pc-eyebrow">CHECK&nbsp; ANALYZE&nbsp; OPTIMIZE&nbsp; PLAY BETTER</p>
          <h1 id="pc-page-title">
            내 PC 성능 체크<span>.</span>
          </h1>
          <p className="pc-hero-description">
            지금 바로 내 컴퓨터를 진단하고,
            <br />
            게임을 위한 준비 상태를 확인해보세요.
          </p>
          <div className="pc-hero-actions">
            <button
              className="gs-primary-button pc-diagnose-button"
              onClick={diagnose}
              disabled={isScanning}
            >
              <GSIcon
                name={isScanning ? 'refresh' : 'monitor'}
                size={18}
                className={isScanning ? 'pc-spinning' : ''}
              />
              {isScanning ? '진단 중...' : '지금 진단하기'}
              {!isScanning && <GSIcon name="arrow" size={18} />}
            </button>
            <span>
              <GSIcon name="shield" size={16} />
              기기 정보를 수집하지 않는 데모 진단
            </span>
          </div>
        </div>
        <div className="pc-hero-signature" aria-hidden="true">
          <span>YOUR PC. YOUR POSSIBILITIES.</span>
          <strong>
            Better hardware.
            <br />
            <em>Brighter victories.</em>
          </strong>
        </div>
        <span className="pc-hero-demo">
          DEMO PC <i /> 예시 사양
        </span>
      </section>

      <div className="pc-overview">
        <section className="pc-panel pc-summary" aria-busy={isScanning}>
          <PanelHeading
            icon="shield"
            title="종합 성능 점수"
            action={<span className="pc-demo-badge">DEMO</span>}
          />
          <div className="pc-summary-content">
            <ScoreGauge />
            <div className="pc-score-description">
              <h3>
                <span>대부분의 최신 게임을</span>
                <br />
                원활하게 실행할 수 있는 상태입니다.
              </h3>
              <ul>
                <li>
                  <GSIcon name="check" />
                  게임 플레이에 적합한 성능입니다.
                </li>
                <li>
                  <GSIcon name="check" />
                  일부 항목은 업그레이드를 고려해보세요.
                </li>
                <li>
                  <GSIcon name="check" />
                  나에게 맞는 설정으로 더 쾌적하게 즐기세요.
                </li>
              </ul>
              <button className="pc-recheck" onClick={diagnose} disabled={isScanning}>
                <GSIcon name="refresh" size={15} className={isScanning ? 'pc-spinning' : ''} />
                {isScanning ? '데모 진단 중' : '다시 진단하기'}
              </button>
            </div>
          </div>
        </section>
        <div className="pc-hardware-grid">
          {hardware.map(item => (
            <HardwareCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div
        className={`pc-scan-status ${isScanning ? 'is-scanning' : ''}`}
        role="status"
        aria-live="polite"
      >
        {isScanning ? (
          <>
            <GSIcon name="refresh" size={15} className="pc-spinning" />
            <span>데모 진단 · {diagnosticSteps[scanStep]}</span>
            <div
              className="pc-scan-progress"
              role="progressbar"
              aria-label="데모 진단 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={scanPercent}
            >
              <span style={{ width: `${scanPercent}%` }} />
            </div>
            <strong>{scanPercent}%</strong>
            <button onClick={() => setIsScanning(false)}>취소</button>
          </>
        ) : (
          <>
            <span className="pc-status-dot" />
            <span>
              {lastScan
                ? `데모 진단 완료 · ${lastScan.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                : '데모 PC · AMD Ryzen 5 5600X + RTX 3060'}
            </span>
            <span className="pc-scan-disclaimer">
              모든 점수·FPS·시스템 상태는 더미 데이터입니다.
            </span>
          </>
        )}
      </div>

      <div className="pc-dashboard-grid">
        <GamePerformance onDetails={setDetails} />
        <div className="pc-middle-column">
          <section className="pc-panel pc-scores">
            <PanelHeading
              icon="chart"
              title="성능 항목별 점수"
              subtitle="각 하드웨어의 성능 점수를 확인해보세요."
            />
            <div className="pc-score-bars">
              {hardware.map(item => (
                <div key={item.id}>
                  <span>{item.name}</span>
                  <div
                    className={`pc-meter pc-score-meter pc-${item.id === 'cpu' || item.id === 'gpu' ? 'mint' : item.color}`}
                    role="meter"
                    aria-label={`${item.name} 예시 성능 점수`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.score}
                  >
                    <span style={{ width: `${item.score}%` }} />
                  </div>
                  <strong>{item.score}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="pc-panel pc-system">
            <PanelHeading
              icon="activity"
              title="시스템 현황"
              subtitle="PC 상태를 한눈에 살펴보세요."
              action={
                <button className="pc-text-button" onClick={() => setDetails({ type: 'system' })}>
                  더 보기
                  <GSIcon name="arrow" size={14} />
                </button>
              }
            />
            <div className="pc-system-grid">
              {systemMetrics.map(item => (
                <div key={item.id} className={`pc-system-metric pc-${item.color}`}>
                  <GSIcon name={item.icon} size={26} />
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.state}</small>
                  </div>
                </div>
              ))}
            </div>
            <span className="pc-system-note">시스템 상태 예시 · 실제 측정값이 아닙니다</span>
          </section>
        </div>
        <div className="pc-right-column">
          <section className="pc-panel pc-upgrades">
            <PanelHeading
              icon="bulb"
              gold
              title="추천 업그레이드"
              subtitle="더 나은 게임 경험을 위한 맞춤 제안입니다."
            />
            <div className="pc-upgrade-list">
              {upgrades.map(item => (
                <button
                  key={item.id}
                  className="pc-upgrade-button"
                  onClick={() => setDetails({ type: 'upgrade', item })}
                >
                  <span className="pc-upgrade-icon">
                    <GSIcon name={item.id} size={29} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <GSIcon name="chevron" className="pc-right-chevron" size={17} />
                </button>
              ))}
            </div>
          </section>
          <section className="pc-panel pc-grade">
            <PanelHeading
              icon="crown"
              gold
              title="게이밍 등급"
              subtitle="종합적인 분석을 통한 게이밍 등급입니다."
            />
            <div className="pc-grade-content">
              <div className="pc-grade-hex">
                <span>{performanceSummary.grade}</span>
              </div>
              <div>
                <h3>{performanceSummary.title}</h3>
                <p>
                  대부분의 최신 게임을 원활하게
                  <br />
                  즐길 수 있는 우수한 성능입니다.
                </p>
                <span>예시 사양 기준</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      <DetailsDialog details={details} onClose={() => setDetails(null)} />
    </div>
  )
}
