import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { Panel } from '@/shared/ui'
import { PurchaseImportDialog } from '@/features/purchase-import'
import { useMySpendingContext } from '@/features/spending'
import { useAccountActions } from '../hooks/useAccountActions'
import NicknameSetting from './account/NicknameSetting'
import PasswordSetting from './account/PasswordSetting'
import SteamSetting from './account/SteamSetting'
import PurchaseHistorySetting from './account/PurchaseHistorySetting'
import PcSpecSetting from './account/PcSpecSetting'
import WithdrawSetting from './account/WithdrawSetting'

// 설정 화면(.gs-settings-panel) 안에 들어가는 계정 섹션들. 실제 로그인한 경우에만 렌더링한다.
// 섹션 하나 = 설정 하나 (이름·설명 왼쪽, 입력·버튼 오른쪽).
export default function AccountSettings() {
  const { user } = useAuth()
  const { data, loading, notLinked, reload } = useMySpendingContext()
  const [importOpen, setImportOpen] = useState(false)
  const actions = useAccountActions()
  // 스팀 연동 상태는 소비 분석 데이터에서 읽는다 (데이터가 있으면 연동됨, 연동 안 됨 오류면 미연동).
  const steamLinked = Boolean(data) && !notLinked
  const hasHistory = Boolean(data?.hasPurchaseHistory)

  return (
    <Panel id="account">
      <h2 className="text-[clamp(24px,2.8vw,32px)] font-[750] tracking-[-1px] leading-[1.3]">내 계정</h2>
      <p className="mt-[8px] text-[14px] text-muted">
        아이디(이메일) <strong className="ml-[6px] text-text font-[600]">{user.email}</strong>
      </p>
      <div className="mt-[28px] [&>section]:grid [&>section]:grid-cols-[200px_1fr] [&>section]:gap-[16px] [&>section]:items-center [&>section]:py-[22px] [&>section]:border-t [&>section]:border-border max-[700px]:[&>section]:grid-cols-1 [&_h3]:text-[16px] [&_h3]:font-[650] [&_small]:block [&_small]:mt-[4px] [&_small]:text-[13px] [&_small]:text-muted [&_small]:font-normal">
        <NicknameSetting actions={actions} />
        <PasswordSetting actions={actions} />
        <SteamSetting actions={actions} steamLinked={steamLinked} loading={loading} reload={reload} />
        <PurchaseHistorySetting steamLinked={steamLinked} hasHistory={hasHistory} onOpenImport={() => setImportOpen(true)} />
        <PcSpecSetting />
        <WithdrawSetting actions={actions} />
      </div>
      <PurchaseImportDialog open={importOpen} hasHistory={hasHistory} onClose={() => setImportOpen(false)} onImported={reload} />
    </Panel>
  )
}
