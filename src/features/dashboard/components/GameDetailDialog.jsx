import { useEffect, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import GameIdentity from '../../../components/game/GameIdentity'
import { money, number, dateLabel } from '../../../utils/formatters'
import { netAmount } from '../spendingMetrics'
export default function GameDetailDialog({ game, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (game && !dialog.open) dialog.showModal()
    if (!game && dialog.open) dialog.close()
  }, [game])
  return (
    <dialog
      aria-label={game ? game.name + ' 구매 상세' : '구매 상세'}
      ref={ref}
      className="detail-dialog"
      onCancel={onClose}
      onClose={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {game && (
        <div className="dialog-content">
          <button
            className="icon-button dialog-close"
            aria-label="상세 정보 닫기"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
          <span className="eyebrow">PURCHASE DETAILS</span>
          <GameIdentity game={game} />
          <p>{game.edition}</p>
          <dl>
            <div>
              <dt>실제 구매 금액</dt>
              <dd>{money(netAmount(game))}</dd>
            </div>
            <div>
              <dt>구매일</dt>
              <dd>{dateLabel(game.purchasedAt)}</dd>
            </div>
            <div>
              <dt>누적 플레이 시간</dt>
              <dd>{game.hours == null ? '미확인' : number(game.hours) + '시간'}</dd>
            </div>
            <div>
              <dt>플레이 1시간당 비용</dt>
              <dd>
                {game.amount == null
                  ? '금액 미확인'
                  : game.hours > 0
                    ? money(netAmount(game) / game.hours)
                    : '계산 전'}
              </dd>
            </div>
          </dl>
          <div className="detail-note">
            {game.hours === 0
              ? '아직 시작하지 않은 게임이에요. 다음 플레이 목록에 담아보는 건 어떨까요?'
              : '플레이 시간은 구매를 이해하는 하나의 지표예요. 짧은 플레이도 충분히 만족스러운 경험일 수 있어요.'}
          </div>
          <small>데모 기록 · 실제 구매 내역이 아닙니다.</small>
        </div>
      )}
    </dialog>
  )
}
