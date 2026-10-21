import { GSIcon } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import { useSpendingStatus } from '@/features/spending'

// 사이드바 아래쪽 "지금 연결된 스팀 계정" 카드. 로그인 전/데모 세션에서는 그리지 않는다.
// 스팀 계정 이름과 마지막 동기화 시각은 백엔드(/api/me)가 아직 내려주지 않아 연동 상태만 보여준다.
export default function SidebarSteamCard() {
  const { startSteamLink } = useAuth()
  const { status } = useSpendingStatus()
  if (status === 'guest') return null

  const linked = status !== 'notLinked'
  return (
    <div className="mt-[18px] rounded-[14px] border border-border bg-surface-soft p-[14px]">
      <div className="flex items-center gap-[10px]">
        <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-primary-soft text-primary-text shrink-0">
          <GSIcon name="steam" size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-muted">{linked ? '지금 연결된 스팀 계정' : '스팀 계정'}</p>
          <p className="flex items-center gap-[6px] text-[12px] font-[650] mt-[2px]">
            <span className={`w-[7px] h-[7px] rounded-full ${linked ? 'bg-mint-text' : 'bg-peach-text'}`} />
            {linked ? '연동 완료' : '연동되지 않음'}
          </p>
        </div>
      </div>
      {!linked && (
        <button
          type="button"
          className="mt-[12px] w-full min-h-[34px] rounded-[10px] bg-primary text-[12px] font-[650] text-gs-on-accent hover:bg-primary-strong"
          onClick={startSteamLink}
        >
          Steam 계정 연동하기
        </button>
      )}
    </div>
  )
}
