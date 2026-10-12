import { useEffect, useRef } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import GameIdentity from './GameIdentity'
import { money, dateLabel } from '../../../utils/formatters'
import { netAmount, hourlyText, hoursText } from '../spendingMetrics'
import { METHOD_LABELS, noRecordLabel } from '../../purchaseImport/labels'
const AMOUNT_LABELS = {
  CONFIRMED: '실제 구매 금액 (구매일 환율 원화 환산)',
  ESTIMATED: '추정 금액 (현재 한국 정가)',
  NO_RECORD: '구매 금액',
  UNKNOWN: '구매 금액',
}
const NO_AMOUNT_LABELS = { NO_RECORD: '구매 기록 없음', UNKNOWN: '가격 정보 없음' }
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
            <GSIcon name="close" size={20} />
          </button>
          <span className="eyebrow">PURCHASE DETAILS</span>
          <GameIdentity game={game} />
          {game.edition && <p>{game.edition}</p>}
          <dl>
            <div>
              <dt>{AMOUNT_LABELS[game.amountSource] ?? '실제 구매 금액'}</dt>
              <dd>
                {game.amountSource === 'FREE'
                  ? '무료'
                  : game.amount == null
                    ? game.amountSource === 'NO_RECORD'
                      ? noRecordLabel(game.acquisitionMethod)
                      : NO_AMOUNT_LABELS[game.amountSource] ?? '금액 미확인'
                    : money(netAmount(game))}
              </dd>
            </div>
            {game.amountSource === 'NO_RECORD' && game.listPrice != null && (
              <div>
                <dt>참고: 현재 한국 정가</dt>
                <dd>{money(game.listPrice)}</dd>
              </div>
            )}
            {(game.bundleAllocated || game.dlcCount > 0 || game.refund > 0 || game.savedKrw > 0) && (
              <div>
                <dt>구매 상세</dt>
                <dd>
                  {[
                    game.bundleAllocated && '여러 게임 번들로 구매 (결제액을 정가 비율로 나눈 금액)',
                    game.dlcCount > 0 && 'DLC ' + game.dlcCount + '개 포함',
                    game.refund > 0 && '환불 ' + money(game.refund) + ' 차감',
                    game.savedKrw > 0 && '할인으로 ' + money(game.savedKrw) + ' 절약',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </dd>
              </div>
            )}
            {game.acquiredAt && (
              <div>
                <dt>계정에 추가한 날</dt>
                <dd>
                  {dateLabel(game.acquiredAt)} · {METHOD_LABELS[game.acquisitionMethod] ?? '기타'}
                </dd>
              </div>
            )}
            {game.purchasedAt ? (
              <div>
                <dt>구매일</dt>
                <dd>{dateLabel(game.purchasedAt)}</dd>
              </div>
            ) : (
              <div>
                <dt>최근 플레이</dt>
                <dd>{game.lastPlayedAt ? dateLabel(game.lastPlayedAt) : '기록 없음'}</dd>
              </div>
            )}
            <div>
              <dt>누적 플레이 시간</dt>
              <dd>{hoursText(game.hours)}</dd>
            </div>
            <div>
              <dt>플레이 1시간당 비용</dt>
              <dd>
                {hourlyText(game)}
              </dd>
            </div>
          </dl>
          <div className="detail-note">
            {game.hours === 0
              ? '아직 시작하지 않은 게임이에요. 다음 플레이 목록에 담아보는 건 어떨까요?'
              : '플레이 시간은 구매를 이해하는 하나의 지표예요. 짧은 플레이도 충분히 만족스러운 경험일 수 있어요.'}
          </div>
          <small>
            {game.amountSource === 'CONFIRMED'
              ? '스팀 구매내역 기준 · 원화가 아닌 결제는 구매일 환율로 환산했어요.'
              : game.amountSource === 'NO_RECORD'
                ? game.acquisitionMethod
                  ? '구매내역에 결제 기록이 없는 게임이에요 (라이선스 기준: ' + (METHOD_LABELS[game.acquisitionMethod] ?? '기타') + ').'
                  : '구매내역에 결제 기록이 없는 게임이에요 (선물·키 등록·무료 배포 등).'
                : game.platform === 'Steam' && game.amountSource
                  ? '스팀 보유 게임 · 금액은 현재 한국 정가 기준 추정치예요.'
                  : '데모 기록 · 실제 구매 내역이 아닙니다.'}
          </small>
        </div>
      )}
    </dialog>
  )
}
