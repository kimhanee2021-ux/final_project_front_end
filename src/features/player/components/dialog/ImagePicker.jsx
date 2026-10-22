import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { profileAvatars } from '../../mocks/playerMock'
import FormActions from './FormActions'
import { titles } from './dialogTitles'

// 프로필 이미지(아바타) 고르기
export default function ImagePicker({ type, onClose }) {
  const { player, updateProfile, notify } = useGameSense()
  const [selected, setSelected] = useState(player.profile[type])
  const options = profileAvatars
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        updateProfile({ [type]: selected })
        notify('프로필 아바타를 변경했어요.')
        onClose()
      }}
    >
      <p className="text-[14px] text-gs-muted leading-[1.7] m-[0_0_23px]">나를 닮은 분위기를 선택해보세요.</p>
      <div className="grid grid-cols-3 gap-[12px] max-[480px]:gap-[6px]" role="group" aria-label={titles[type]}>
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            className={`min-w-0 p-[7px] border rounded-[10px] bg-gs-bg max-[480px]:p-[5px] ${selected === option.id ? 'border-gs-mint shadow-[0_0_0_2px_#16d1aa18]' : 'border-gs-border'}`}
            aria-label={option.name}
            aria-pressed={selected === option.id}
            onClick={() => setSelected(option.id)}
          >
            <img
              className="block object-cover w-full aspect-square h-auto rounded-full"
              src={option.image}
              alt=""
            />
            <span className="flex items-center justify-center gap-[5px] text-[12px] py-[10px] pt-[10px] pb-[3px] max-[480px]:text-[12px] [&_svg]:text-gs-mint [&_svg]:shrink-0">
              {option.name}
              {selected === option.id && <GSIcon name="check" size={16} />}
            </span>
          </button>
        ))}
      </div>
      <FormActions onClose={onClose} label="선택한 이미지 적용" />
    </form>
  )
}
