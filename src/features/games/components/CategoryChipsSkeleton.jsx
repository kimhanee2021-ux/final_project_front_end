// CategoryChips가 로딩될 때 보여주는 자리표시.
export default function CategoryChipsSkeleton() {
  return (
    <div className="flex gap-[8px] mb-[28px]">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-[36px] w-[84px] rounded-full bg-bg animate-pulse" />
      ))}
    </div>
  )
}
