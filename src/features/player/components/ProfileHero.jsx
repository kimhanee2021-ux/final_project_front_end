import { GSIcon } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { profileAvatars, profileCovers } from '../mocks/playerMock'

// 값 하나를 라벨 아래에 보여주는 요약 항목
function Fact({ label, value }) {
  return (
    <div className="min-w-0">
      <small className="block text-[12px] text-faint">{label}</small>
      <strong className="block mt-[4px] text-[15px] font-[600]">{value}</strong>
    </div>
  )
}

// 마이페이지 맨 위 프로필: 커버 → 아바타·이름·소개 → 요약 세 가지. 수정 버튼은 오른쪽에 둘만 둔다.
export default function ProfileHero({ onEdit }) {
  const { player } = useGameSense()
  const { profile, preferences } = player
  const cover = profileCovers.find(item => item.id === profile.cover)
  const avatar = profileAvatars.find(item => item.id === profile.avatar)
  return (
    <section aria-labelledby="mp-profile-name">
      <div className="relative h-[180px] rounded-[20px] overflow-hidden bg-bg max-[600px]:h-[130px]">
        <img className="w-full h-full object-cover" src={cover.image} alt="" />
        <button
          className="absolute right-[14px] top-[14px] inline-flex items-center gap-[8px] h-[34px] px-[14px] rounded-full bg-surface/90 text-text text-[13px] shadow-[var(--shadow)]"
          onClick={() => onEdit('cover')}
        >
          <GSIcon name="image" size={16} />
          커버 변경
        </button>
      </div>
      <div className="flex items-end gap-[20px] px-[8px] -mt-[44px] max-[600px]:flex-wrap">
        <div className="relative shrink-0">
          <img
            className="w-[96px] h-[96px] rounded-full object-cover border-4 border-surface bg-bg"
            src={avatar.image}
            alt={`${profile.name}의 프로필`}
          />
          <button
            className="absolute right-0 bottom-0 grid place-items-center w-[32px] h-[32px] rounded-full bg-surface text-muted shadow-[var(--shadow)] hover:text-text"
            aria-label="프로필 아바타 변경"
            onClick={() => onEdit('avatar')}
          >
            <GSIcon name="camera" size={16} />
          </button>
        </div>
        <div className="flex-1 min-w-0 pb-[4px]">
          <h1 className="!m-0 text-[26px] font-[750] tracking-[-0.8px] leading-[1.3] [overflow-wrap:anywhere]" id="mp-profile-name">
            {profile.name}
            <span className="ml-[10px] text-[13px] font-[500] text-faint">Lv. 12 · 데모 프로필</span>
          </h1>
        </div>
        <div className="flex gap-[8px] pb-[4px] max-[600px]:w-full">
          <button className="gs-primary-button" onClick={() => onEdit('profile')}>
            <GSIcon name="edit" size={16} />
            프로필 수정
          </button>
        </div>
      </div>
      <p className="mt-[20px] px-[8px] max-w-[640px] text-[15px] leading-[1.8] text-muted whitespace-pre-line [overflow-wrap:anywhere]">
        {profile.bio || '나만의 게임 이야기를 소개해보세요.'}
      </p>
      <div className="flex flex-wrap items-center gap-[8px] mt-[16px] px-[8px]">
        {preferences.tags.map(tag => (
          <span key={tag} className="h-[30px] inline-flex items-center px-[14px] rounded-full bg-bg text-muted text-[13px]">{tag}</span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-[24px] mt-[32px] pt-[24px] px-[8px] border-t border-border max-[760px]:grid-cols-2">
        <Fact label="가입일" value="2024년 3월 15일 (예시)" />
        <Fact label="주로 즐기는 방식" value={preferences.playStyle} />
        <Fact label="월 플레이 목표" value={preferences.monthlyHours ? `${preferences.monthlyHours}시간` : '설정 안 함'} />
        <Fact label="월 게임 예산" value={preferences.budget ? `${preferences.budget.toLocaleString('ko-KR')}원` : '설정 안 함'} />
      </div>
    </section>
  )
}
