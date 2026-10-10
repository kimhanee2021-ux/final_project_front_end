import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../components/discover/GSIcon'
import {
  diagnosticSteps,
  getPerformanceRating,
  hardware,
  performanceGames,
  performanceSummary,
  resolutions,
  systemMetrics,
  upgrades,
} from '../../mocks/performanceMock'
import '../../styles/performance.css'

function PanelHeading({ icon, title, subtitle, action, gold = false }) {
  return (
    <div className="pc-panel-heading">
      <GSIcon name={icon} className={gold ? 'pc-gold' : ''} size={23} />
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function ScoreGauge() {
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

function HardwareCard({ item }) {
  return (
    <article
      className={`pc-hardware-card pc-hardware-${item.id}`}
      aria-label={`${item.name} 예시 사양`}
    >
      <div className="pc-hardware-title">
        <span className={`pc-icon-tile ${item.id === 'cpu' ? 'pc-blue' : ''}`}>
          <GSIcon name={item.id} size={26} />
        </span>
        <div>
          <h3>{item.name}</h3>
          <p>{item.model}</p>
        </div>
      </div>
      <div className="pc-usage-label">
        <strong>
          {item.usage}
          <span>%</span>
        </strong>
        <span>사용률 · 예시</span>
      </div>
      <div
        className="pc-meter"
        role="meter"
        aria-label={`${item.name} 예시 사용률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={item.usage}
      >
        <span style={{ width: `${item.usage}%` }} />
      </div>
      <ul className="pc-hardware-facts">
        {item.facts.map(([icon, text]) => (
          <li key={text}>
            <GSIcon name={icon} size={16} className={icon === 'check' ? 'pc-mint' : ''} />
            {text}
          </li>
        ))}
      </ul>
    </article>
  )
}

function GamePerformance({ onDetails }) {
  const [showAll, setShowAll] = useState(false)
  const [resolution, setResolution] = useState('fhd')
  const games = showAll ? performanceGames : performanceGames.slice(0, 6)
  return (
    <section className="pc-panel pc-games">
      <PanelHeading
        icon="gamepad"
        title="게임별 예상 성능"
        subtitle="주요 게임에서의 예상 프레임을 확인해보세요."
        action={
          <button
            className="pc-text-button"
            onClick={() => setShowAll(value => !value)}
            aria-expanded={showAll}
          >
            {showAll ? '접기' : '전체 보기'}
            <GSIcon name="arrow" size={15} />
          </button>
        }
      />
      <div className="pc-game-options">
        <span>
          <i />
          높음 설정 · 더미 FPS
        </span>
        <label>
          평가 기준
          <select
            aria-label="게임 성능 평가 해상도"
            value={resolution}
            onChange={event => setResolution(event.target.value)}
          >
            {resolutions.map(item => (
              <option key={item.id} value={item.id}>
                {item.label} ({item.pixels})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="pc-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="게임별 해상도 성능 비교표"
      >
        <table className="pc-game-table">
          <caption className="sr-only">
            예시 PC의 게임별 예상 FPS. 모든 수치는 화면 시연용이며 실제 벤치마크가 아닙니다.
          </caption>
          <thead>
            <tr>
              <th scope="col">게임 제목</th>
              {resolutions.map(item => (
                <th
                  scope="col"
                  key={item.id}
                  className={resolution === item.id ? 'is-selected' : ''}
                >
                  {item.label}
                  <small>({item.pixels})</small>
                </th>
              ))}
              <th scope="col">평가</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => {
              const rating = getPerformanceRating(game.fps?.[resolution])
              return (
                <tr key={game.id}>
                  <th scope="row">
                    <button
                      className="pc-game-button"
                      onClick={() => onDetails({ type: 'game', item: game })}
                    >
                      <img src={game.image} alt="" loading="lazy" />
                      <span>{game.name}</span>
                    </button>
                  </th>
                  {resolutions.map(item => (
                    <td
                      key={item.id}
                      className={`pc-fps-${item.id} ${resolution === item.id ? 'is-selected' : ''}`}
                    >
                      {game.fps ? (
                        <>
                          <strong>{game.fps[item.id]}</strong>
                          <small> FPS</small>
                        </>
                      ) : (
                        <span className="pc-unavailable" aria-label="PC 평가 대상 아님">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                  <td>
                    <span className={`pc-rating pc-${rating.tone}`}>{rating.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="pc-table-note">
        <GSIcon name="info" size={13} />
        예시 수치 · 60 FPS 이상 원활 / 30–59 보통 · Switch 게임 제외
      </p>
    </section>
  )
}

function DetailsDialog({ details, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (details && !dialog.open) dialog.showModal()
    else if (!details && dialog.open) dialog.close()
  }, [details])
  const title =
    details?.type === 'game'
      ? details.item.name
      : details?.type === 'upgrade'
        ? details.item.title
        : '시스템 현황 자세히 보기'
  return (
    <dialog
      ref={ref}
      className="pc-dialog"
      aria-labelledby="pc-dialog-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {details && (
        <div className="pc-dialog-inner">
          <div className="pc-dialog-top">
            <span className="pc-demo-badge">DEMO DATA</span>
            <button
              autoFocus
              className="gs-icon-button"
              aria-label="성능 상세 닫기"
              onClick={onClose}
            >
              <GSIcon name="close" />
            </button>
          </div>
          <h2 id="pc-dialog-title">{title}</h2>
          {details.type === 'game' && (
            <>
              <p className="pc-dialog-lead">예시 PC · 그래픽 높음 설정</p>
              {details.item.fps ? (
                <div className="pc-dialog-fps">
                  {resolutions.map(item => (
                    <div key={item.id}>
                      <span>
                        {item.label} · {item.pixels}
                      </span>
                      <strong>
                        {details.item.fps[item.id]}
                        <small> FPS</small>
                      </strong>
                      <span>{getPerformanceRating(details.item.fps[item.id]).label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pc-dialog-callout">
                  Nintendo Switch 게임으로 PC 성능 평가 대상에서 제외됩니다.
                </p>
              )}
              <p>
                {details.item.note ||
                  '해상도를 낮추거나 그래픽 옵션을 조절하면 더 부드러운 플레이를 기대할 수 있습니다.'}
              </p>
              <p className="pc-dialog-disclaimer">
                모든 FPS는 인터페이스를 보여주기 위한 더미 데이터입니다. 실제 게임의 벤치마크나 측정
                결과가 아닙니다.
              </p>
            </>
          )}
          {details.type === 'upgrade' && (
            <>
              <span className="pc-dialog-feature-icon">
                <GSIcon name={details.item.id} size={35} />
              </span>
              <h3>{details.item.heading}</h3>
              <p>{details.item.body}</p>
              <ul className="pc-detail-tips">
                {details.item.tips.map(tip => (
                  <li key={tip}>
                    <GSIcon name="check" size={17} />
                    {tip}
                  </li>
                ))}
              </ul>
            </>
          )}
          {details.type === 'system' && (
            <>
              <p className="pc-dialog-lead">데모 PC의 하드웨어와 상태 예시입니다.</p>
              <dl className="pc-system-details">
                {hardware.map(item => (
                  <div key={item.id}>
                    <dt>
                      <GSIcon name={item.id} size={21} />
                      {item.detail}
                    </dt>
                    <dd>
                      <strong>{item.model}</strong>
                      <p>{item.recommendation}</p>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="pc-dialog-disclaimer">
                표시된 온도·사용률·드라이버 상태는 고정된 더미 데이터입니다. 기기 정보 수집이나 실제
                시스템 진단은 수행하지 않습니다.
              </p>
            </>
          )}
          <button className="gs-primary-button pc-dialog-confirm" onClick={onClose}>
            확인
            <GSIcon name="check" size={17} />
          </button>
        </div>
      )}
    </dialog>
  )
}

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
