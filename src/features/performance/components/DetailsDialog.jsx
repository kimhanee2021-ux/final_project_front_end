import { useEffect, useRef } from 'react'
import { GSIcon } from '@/shared/ui'
import PcGameAnalysisDetails from './PcGameAnalysisDetails'
import PcUpgradePanel from './PcUpgradePanel'

// 게임 또는 부품 하나의 AI 분석 상세. details가 있으면 열리고 null이면 닫힌다.
// 게임: { type: 'game', game, result }, 부품: { type: 'upgrade', item(부품 판정) }
export default function DetailsDialog({ details, evaluation, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (details && !dialog.open) dialog.showModal()
    else if (!details && dialog.open) dialog.close()
  }, [details])

  const title = details?.type === 'game' ? details.game.name : `${details?.item.label} 개선 방향`
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
            <span className="pc-demo-badge">AI 분석</span>
            <button autoFocus className="gs-icon-button" aria-label="상세 닫기" onClick={onClose}>
              <GSIcon name="close" />
            </button>
          </div>
          <h2 id="pc-dialog-title">{title}</h2>
          {details.type === 'game' &&
            (details.result ? (
              <>
                <PcGameAnalysisDetails result={details.result} />
              </>
            ) : (
              <p className="pc-dialog-callout">
                아직 분석하지 않은 게임이에요. 분석이 끝나면 해상도별 등급과 설명을 볼 수 있어요.
              </p>
            ))}
          {details.type === 'upgrade' && (
            <PcUpgradePanel
              result={evaluation.overview}
              category={details.item.category}
              specs={evaluation.specs}
              partOffers={evaluation.diagnosis.partOffers}
              partsLoading={evaluation.diagnosis.partsLoading}
            />
          )}
          <button className="gs-primary-button pc-dialog-confirm" onClick={onClose}>
            확인
          </button>
        </div>
      )}
    </dialog>
  )
}
