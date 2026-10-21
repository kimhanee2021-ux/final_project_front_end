import { createContext, useContext } from 'react'

export const MySpendingContext = createContext(null)

// MySpendingProvider 안에서만 쓸 수 있다. 값은 useMySpending()이 돌려주는 객체
// ({ data, loading, syncing, error, notLinked, reload, sync }) 그대로다.
export function useMySpendingContext() {
  const context = useContext(MySpendingContext)
  if (!context) throw new Error('useMySpendingContext must be used within MySpendingProvider')
  return context
}
