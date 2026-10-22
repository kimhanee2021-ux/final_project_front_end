import { useState } from 'react'
import { Card } from '@/shared/ui'
import { money } from '@/shared/utils/formatters'
import { PRIMARY_BUTTON, TEXT_BUTTON } from '@/features/spending'
import { parseBudgetInput } from '../coachModel'
import { useBudget } from '../hooks/useBudget'

// 이번 달 게임 지출 예산. 정해 두면 코치가 이번 달 지출과 비교해 남은 금액을 알려 준다.
export default function BudgetCard() {
  const { budget, loading, saving, error, save } = useBudget()
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [invalid, setInvalid] = useState(false)
  const month = budget?.month ? Number(budget.month.slice(5)) + '월' : '이번 달'

  const submit = async event => {
    event.preventDefault()
    const amount = parseBudgetInput(input)
    if (amount == null) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    if (await save(amount)) setEditing(false)
  }

  return (
    <Card title={month + ' 게임 예산'} subtitle="코치가 이번 달 지출과 비교해 알려 줘요">
      {loading ? (
        <p className="mt-[16px] text-[12px] text-muted">불러오는 중...</p>
      ) : editing ? (
        <form onSubmit={submit} className="mt-[16px] grid gap-[10px]">
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            inputMode="numeric"
            placeholder="예) 30000 또는 3만"
            aria-label="이번 달 게임 예산(원)"
            aria-invalid={invalid}
            className="px-[12px] py-[9px] rounded-[8px] border border-border bg-surface-soft text-text text-[12px] placeholder:text-muted"
          />
          {invalid && <p className="text-[11px] text-muted" role="alert">0원부터 1,000만 원까지 숫자로 입력해 주세요.</p>}
          <div className="flex gap-[10px] items-center">
            <button type="submit" className={PRIMARY_BUTTON} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
            <button type="button" className={TEXT_BUTTON} onClick={() => { setEditing(false); setInvalid(false) }}>취소</button>
          </div>
        </form>
      ) : (
        <div className="mt-[16px]">
          <strong className="block text-[22px] tracking-[-0.6px]">
            {budget?.limitAmount != null ? money(budget.limitAmount) : '아직 없어요'}
          </strong>
          <button
            type="button"
            className={TEXT_BUTTON + ' mt-[8px]'}
            onClick={() => {
              setInput(budget?.limitAmount != null ? String(budget.limitAmount) : '')
              setEditing(true)
            }}
          >
            {budget?.limitAmount != null ? '예산 바꾸기' : '예산 정하기'}
          </button>
        </div>
      )}
      {error && <p className="mt-[10px] text-[11px] text-muted" role="alert">{error}</p>}
    </Card>
  )
}
