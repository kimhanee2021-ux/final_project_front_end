import { GSIcon } from '@/shared/ui'

// 편집 창 아래 취소 · 저장 버튼
export default function FormActions({ onClose, label = '저장하기' }) {
  return (
    <div className="flex justify-end gap-[10px] border-t border-gs-border pt-[20px] mt-[23px] [&>button]:min-h-[40px]">
      <button
        type="button"
        className="border-0 rounded-full bg-gs-raised py-[9px] px-[22px] text-[14px] hover:bg-gs-hover"
        onClick={onClose}
      >
        취소
      </button>
      <button type="submit" className="gs-primary-button">
        <GSIcon name="check" size={17} />
        {label}
      </button>
    </div>
  )
}
