import { dashboardMock } from '../../mocks/dashboardMock'
export async function getDashboardData() {
  // Replace this adapter with the real endpoint when account integration is ready.
  return structuredClone(dashboardMock)
}
