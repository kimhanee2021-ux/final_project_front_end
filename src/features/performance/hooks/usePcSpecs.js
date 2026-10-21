import { useContext } from 'react'
import { PcSpecContext } from '../context/PcSpecContext'

// Provider 밖에서 쓰면 Error를 던진다.
export function usePcSpecs() {
  const context = useContext(PcSpecContext)
  if (!context) throw new Error('usePcSpecs는 PcSpecProvider 안에서만 사용할 수 있습니다.')
  return context
}
