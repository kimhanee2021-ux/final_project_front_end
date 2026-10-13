import { useEffect, useRef } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import GameIdentity from './GameIdentity'
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
      className="p-0 border border-border rounded-[18px] w-[440px] max-w-[calc(100vw-32px)] bg-surface text-text shadow-[0_24px_80px_#0004] backdrop:bg-[#11102199] backdrop:backdrop-blur-[4px]"
      onCancel={onClose}
      onClose={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {game && (
        <div className="relative p-[30px] [&>p]:mt-[18px] [&>p]:text-muted [&>p]:text-[12px] [&_dl]:my-[24px] [&_dl>div]:flex [&_dl>div]:justify-between [&_dl>div]:py-[12px] [&_dl>div]:border-b [&_dl>div]:border-border [&_dl>div]:text-[12px] [&_dt]:text-muted [&_dd]:m-0 [&_dd]:font-semibold [&>small]:block [&>small]:text-muted [&>small]:text-[10px] [&>small]:mt-[18px]">
          <button
            className="w-[34px] h-[34px] bg-transparent grid place-items-center rounded-[8px] hover:bg-surface-hover absolute top-[15px] right-[15px]"
            aria-label="상세 정보 닫기"
            onClick={onClose}
          >
            <GSIcon name="close" size={20} />
          </button>

          <span className="text-[9px] font-bold tracking-[1.9px] text-primary-text">PURCHASE DETAILS</span>
          <div className="mt-[26px]">
            <GameIdentity game={game} size="large" />
          </div>
          {game.edition && <p>{game.edition}</p>}
          <dl>
            <div>
              <dt>{game.amountSource === 'ESTIMATED' ? '추정 금액 (현재 한국 정가)' : '실제 구매 금액'}</dt>
              <dd>{money(netAmount(game))}</dd>
            </div>
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
          <div className="bg-primary-soft text-primary-text rounded-[9px] p-[15px] text-[12px] leading-[1.8]">
            {game.hours === 0
              ? '아직 시작하지 않은 게임이에요. 다음 플레이 목록에 담아보는 건 어떨까요?'
              : '플레이 시간은 구매를 이해하는 하나의 지표예요. 짧은 플레이도 충분히 만족스러운 경험일 수 있어요.'}
          </div>
          <small>
            {game.platform === 'Steam' && game.amountSource
              ? '스팀 보유 게임 · 금액은 현재 한국 정가 기준 추정치예요.'
              : '데모 기록 · 실제 구매 내역이 아닙니다.'}
          </small>
        </div>
      )}
    </dialog>
  )
}
