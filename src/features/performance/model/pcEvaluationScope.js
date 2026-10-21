export function evaluationForView(mode, owned, search) {
  return mode === 'search' ? (search ?? owned) : owned
}
