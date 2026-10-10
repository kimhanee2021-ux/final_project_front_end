import { useEffect, useRef } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { getPerformanceRating, hardware, resolutions } from '../mocks/performanceMock'

export default function DetailsDialog({ details, onClose }) {
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
