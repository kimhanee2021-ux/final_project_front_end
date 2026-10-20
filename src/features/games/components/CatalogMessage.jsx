import { GSIcon } from '@/shared/ui'

// 오류·빈 결과처럼 목록 대신 보여주는 안내. 제목 하나와 설명 한 줄, 버튼 하나만 둔다.
// 버튼이 이동 링크처럼 특별하면 action 대신 children으로 직접 넣는다.
export default function CatalogMessage({ icon, title, description, action, children, role }) {
  return (
    <div className="flex flex-col items-center gap-[10px] px-[20px] py-[72px] text-center" role={role}>
      <GSIcon name={icon} size={32} className="text-faint" />
      <h3 className="text-[18px] font-[700] mt-[8px]">{title}</h3>
      {description && <p className="text-muted text-[14px]">{description}</p>}
      {action && (
        <button className="gs-primary-button mt-[16px]" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {children}
    </div>
  )
}
