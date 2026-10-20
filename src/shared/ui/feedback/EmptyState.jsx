import GSIcon from '../icons/GSIcon'
export default function EmptyState({
  title = '아직 기록이 없어요',
  description = '다른 조회 기간을 선택해 보세요.',
  action,
}) {
  return (
    <div className="flex items-center justify-center flex-col gap-[12px] px-[20px] py-[42px] text-muted text-center">
      <GSIcon name="library" size={28} className="text-faint" />
      <strong className="text-text text-[18px]">{title}</strong>
      <p className="text-[14px]">{description}</p>
      {action}
    </div>
  )
}
