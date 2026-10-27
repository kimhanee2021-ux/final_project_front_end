import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { useAuth } from '@/features/auth'
import { getErrorMessage } from '@/shared/lib/apiClient'
import { parseBudgetInput, useBudget } from '@/features/ai-coach'
import FormActions from './FormActions'
import { fieldClass, labelClass } from './formClasses'

// 프로필 수정: 닉네임과 (로그인했다면) 이번 달 게임 예산을 바꾼다. 소비 유형 · 주 플레이 장르는 AI 화면의 값을 그대로 보여준다.
export default function ProfileForm({ onClose, onBudgetSaved }) {
  const { player, updateProfile, notify } = useGameSense()
  const { isAuthenticated, user, updateAccount } = useAuth()
  const budget = useBudget({ enabled: isAuthenticated })
  const [name, setName] = useState(player.profile.name)
  // null이면 아직 건드리지 않은 것: 서버의 현재 예산을 그대로 보여준다.
  const [budgetInput, setBudgetInput] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async event => {
    event.preventDefault()
    if (!name.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    const budgetText = budgetInput ?? ''
    const amount = parseBudgetInput(budgetText)
    const budgetChanged = isAuthenticated && budgetInput !== null && budgetText.trim() !== String(budget.budget?.limitAmount ?? '')
    if (budgetChanged && amount == null) {
      setError('예산은 0원부터 1,000만 원까지 숫자로 입력해주세요.')
      return
    }
    // 실제 계정의 닉네임은 서버에 저장한다.
    if (isAuthenticated && name.trim() !== user.nickname) {
      setSaving(true)
      try {
        await updateAccount({ nickname: name.trim() })
      } catch (requestError) {
        setError(getErrorMessage(requestError))
        return
      } finally {
        setSaving(false)
      }
    }
    if (budgetChanged) {
      setSaving(true)
      const saved = await budget.save(amount)
      setSaving(false)
      if (!saved) {
        setError('예산을 저장하지 못했어요. 잠시 후 다시 시도해주세요.')
        return
      }
      onBudgetSaved?.()
    }
    updateProfile({ name: name.trim() })
    notify('프로필을 저장했어요.')
    onClose()
  }
  return (
    <form className="[&>label]:flex [&>label]:flex-col" onSubmit={submit}>
      <label className={labelClass}>
        닉네임
        <input
          className={fieldClass}
          autoComplete="nickname"
          value={name}
          maxLength={24}
          required
          onChange={event => {
            setName(event.target.value)
            setError('')
          }}
        />
        <small className="self-end block text-gs-muted text-[12px] font-normal mt-[6px] leading-[1.6]">최대 24자</small>
      </label>
      {isAuthenticated && (
        <label className={labelClass}>
          월 게임 예산(원)
          <input
            className={fieldClass}
            inputMode="numeric"
            placeholder={budget.loading ? '불러오는 중...' : '예) 30000 또는 3만'}
            value={budgetInput ?? (budget.budget?.limitAmount != null ? String(budget.budget.limitAmount) : '')}
            disabled={budget.loading}
            onChange={event => {
              setBudgetInput(event.target.value)
              setError('')
            }}
          />
          <small className="self-end block text-gs-muted text-[12px] font-normal mt-[6px] leading-[1.6]">0원 ~ 1,000만 원 · AI 코치가 이번 달 지출과 비교해요</small>
        </label>
      )}
      {error && (
        <p className="text-[13px] text-[#e5484d] m-[-10px_0_17px]" role="alert">
          {error}
        </p>
      )}
      <p className="flex items-start gap-[7px] text-gs-muted text-[12px] leading-[1.8] [&_svg]:mt-[1px] [&_svg]:shrink-0">
        <GSIcon name="shield" size={15} />
        {isAuthenticated ? '닉네임은 계정에 저장됩니다.' : '변경 사항은 이 브라우저에만 저장됩니다.'}
      </p>
      <FormActions onClose={onClose} label={saving ? '저장 중...' : undefined} />
    </form>
  )
}
