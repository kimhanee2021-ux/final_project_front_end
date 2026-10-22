import { GSIcon } from '@/shared/ui'
import { useModalDialog } from '@/shared/hooks'
import ProfileForm from './dialog/ProfileForm'
import ImagePicker from './dialog/ImagePicker'
import { titles } from './dialog/dialogTitles'

// 마이페이지 편집 창: dialog.type에 따라 프로필 수정 또는 아바타 고르기를 연다.
export default function PlayerDialog({ dialog, onClose }) {
  const ref = useModalDialog(dialog)
  return (
    <dialog
      ref={ref}
      className={`mp-dialog w-[min(560px,calc(100%-28px))] max-h-[90dvh] m-auto p-0 border-0 rounded-[24px] text-gs-text bg-gs-panel shadow-[var(--gs-shadow)] backdrop:bg-[#020912c2] backdrop:backdrop-blur-[6px]`}
      aria-labelledby="mp-dialog-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {dialog && (
        <div className="p-[22px_28px_26px] max-[480px]:p-[17px_19px_22px]">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-gs-mint text-[12px] tracking-[2px]">MAKE IT YOURS</span>
            <button
              autoFocus
              className="gs-icon-button"
              aria-label="마이페이지 편집 창 닫기"
              onClick={onClose}
            >
              <GSIcon name="close" />
            </button>
          </div>
          <h2 className="m-[0_0_9px] text-[25px] leading-[1.4] tracking-[-0.7px] max-[480px]:text-[22px]" id="mp-dialog-title">{titles[dialog.type]}</h2>
          {dialog.type === 'profile' && <ProfileForm onClose={onClose} />}
          {dialog.type === 'avatar' && (
            <ImagePicker key={dialog.type} type={dialog.type} onClose={onClose} />
          )}
        </div>
      )}
    </dialog>
  )
}
