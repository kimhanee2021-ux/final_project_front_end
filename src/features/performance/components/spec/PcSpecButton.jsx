import { GSIcon } from '@/shared/ui'
import { usePcSpecs } from '../../hooks/usePcSpecs'

// 어느 화면에서든 같은 사양 입력 창을 여는 버튼. 사양을 이미 입력했다면 "사양 입력 완료!"로 바뀌고, 눌러서 고칠 수 있다.
export default function PcSpecButton({ className = '' }) {
  const { hasSavedSpecs, openSpecDialog } = usePcSpecs()
  return (
    <button
      type="button"
      className={`${hasSavedSpecs ? 'gs-secondary-button' : 'gs-primary-button'} ${className}`}
      onClick={openSpecDialog}
    >
      <GSIcon name={hasSavedSpecs ? 'check' : 'monitor'} size={17} />
      {hasSavedSpecs ? '사양 입력 완료!' : '내 사양 입력'}
    </button>
  )
}
