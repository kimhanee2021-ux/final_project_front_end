import { useAuth } from '@/features/auth'
import { MyPurchases, DemoPurchases } from '@/features/spending'

// 구매 내역(/purchases): 로그인 사용자는 스팀 데이터를, 데모 체험 사용자는 데모 데이터를 본다.
export default function PurchasesPage() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <MyPurchases /> : <DemoPurchases />
}
