import { TEXT_BUTTON } from '@/shared/ui'

// 스팀 연동 전: 다른 화면의 연동 안내(EmptyState)와 같은 문구와 버튼을 쓴다.
export default function SteamLock({ onLinkSteam }) {
  return (
    <div>
      <strong className="block text-[18px]">스팀 계정을 연동해 주세요</strong>
      <p className="mt-[8px] text-[14px] text-muted leading-[1.6]">보유 게임과 플레이 시간을 불러오면 AI가 내 게임 소비를 분석해서 알려 드려요.</p>
      <button type="button" className={TEXT_BUTTON + ' mt-[8px]'} onClick={onLinkSteam}>Steam 계정 연동하기</button>
    </div>
  )
}
