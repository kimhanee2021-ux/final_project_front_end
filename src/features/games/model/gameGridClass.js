// 실제 카드 목록과 로딩 스켈레톤이 같은 격자를 쓰도록 한 곳에서 만든다.
// 카드 테두리 없이 여백으로 구분하므로 간격을 넉넉하게 둔다. 리스트 보기는 한 줄씩 구분선으로 나눈다.
export function gameGridClass(view) {
  if (view === 'list') return 'grid grid-cols-1'
  return 'grid gap-[36px_20px] grid-cols-4 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1'
}
