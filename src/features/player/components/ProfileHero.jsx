import GSIcon from '../../../components/common/GSIcon'
import { useGameSense } from '../../../contexts/GameSenseContext'
import { profileAvatars, profileCovers } from '../mocks/playerMock'

export default function ProfileHero({ onEdit }) {
  const { player } = useGameSense()
  const { profile, preferences } = player
  const cover = profileCovers.find(item => item.id === profile.cover)
  const avatar = profileAvatars.find(item => item.id === profile.avatar)
  return (
    <section
      className="min-h-[305px] relative isolate border border-[#324651] rounded-xl overflow-hidden bg-[var(--mp-cover)] [background-position:center_48%] [background-size:cover] text-[#f1f6fc] p-[36px_32px_22px] min-[1750px]:min-h-[320px] min-[1750px]:p-[36px_36px_23px] max-[1200px]:p-[30px_24px_22px] max-[900px]:min-h-[324px] max-[700px]:p-[52px_22px_22px] max-[480px]:p-[53px_18px_18px]"
      aria-labelledby="mp-profile-name"
      style={{ '--mp-cover': `url('${cover.image}')` }}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#071218d9,#07121ace_36%,#07121a24_85%),linear-gradient(0deg,#071219f7_0%,#07121980_33%,#07121912_100%)]" />
      <button
        className="absolute right-[16px] top-[15px] flex items-center gap-[8px] bg-[#08131dba] text-[#e4edf4] border border-[#7893a144] rounded-[22px] py-[8px] px-[13px] text-[10px] hover:bg-[#1b3540] hover:border-[#36e9c98c] max-[480px]:text-[9px] max-[480px]:py-[7px] max-[480px]:px-[11px]"
        onClick={() => onEdit('cover')}
      >
        <GSIcon name="image" size={16} />
        커버 이미지 변경
      </button>
      <div className="flex items-start gap-[26px] w-[calc(100%-220px)] min-h-[181px] min-[1750px]:gap-[28px] max-[1200px]:gap-[22px] max-[1200px]:w-[calc(100%-180px)] max-[700px]:w-full max-[700px]:min-h-0 max-[700px]:gap-[18px] max-[480px]:block">
        <div className="relative shrink-0 basis-[150px] pt-[11px] min-[1750px]:basis-[163px] max-[1200px]:basis-[118px] max-[700px]:basis-[106px] max-[480px]:float-left max-[480px]:pt-0 max-[480px]:w-[82px] max-[480px]:m-[4px_15px_14px_0]">
          <img
            className="w-[150px] h-[150px] object-cover object-[48%_32%] rounded-full border-2 border-[#30e7c4] shadow-[0_0_0_5px_#03192133,0_4px_24px_#0004] min-[1750px]:w-[163px] min-[1750px]:h-[163px] max-[1200px]:w-[118px] max-[1200px]:h-[118px] max-[700px]:w-[106px] max-[700px]:h-[106px] max-[480px]:w-[82px] max-[480px]:h-[82px]"
            src={avatar.image}
            alt={`${profile.name}의 프로필`}
          />
          <button
            className="absolute right-0 bottom-[10px] grid place-items-center w-[36px] h-[36px] text-[#e2ebf2] rounded-full border border-[#7497ab70] bg-[#11232fe6] hover:text-[#3af3ce] hover:border-[#3af3ce] max-[480px]:w-[28px] max-[480px]:h-[28px] max-[480px]:bottom-[7px] max-[480px]:right-[-2px] [&_svg]:max-[480px]:w-[16px] [&_svg]:max-[480px]:h-[16px]"
            aria-label="프로필 아바타 변경"
            onClick={() => onEdit('avatar')}
          >
            <GSIcon name="camera" size={20} />
          </button>
        </div>
        <div className="min-w-0 pt-[6px] max-[480px]:block">
          <div className="flex items-center gap-[15px] max-[1200px]:flex-wrap max-[1200px]:gap-[7px] max-[480px]:gap-[7px] max-[480px]:pt-[5px]">
            <h1
              className="text-[29px] font-[740] leading-[1.25] tracking-[-0.8px] [overflow-wrap:anywhere] max-[700px]:text-[26px] max-[480px]:text-[25px]"
              id="mp-profile-name"
            >
              {profile.name}
            </h1>
            <span className="text-[#9ec0cd] border border-[#688d9b5e] bg-[#0d202559] rounded-[5px] py-[3px] px-[6px] text-[7px] tracking-[1.2px] whitespace-nowrap max-[480px]:text-[6px] max-[480px]:py-[2px] max-[480px]:px-[5px]">
              DEMO PROFILE
            </span>
          </div>
          <div className="flex items-center gap-[12px] mt-[10px] max-[1200px]:gap-[9px] max-[480px]:mt-[9px] max-[480px]:flex-wrap max-[480px]:gap-[6px_9px]">
            <strong className="text-[#35f3d1] text-[16px] font-[680] whitespace-nowrap max-[480px]:text-[13px]">Lv. 12</strong>
            <div
              className="w-[150px] h-[7px] border border-[#61738144] rounded-[20px] overflow-hidden bg-[#283b4b88] max-[1200px]:w-[110px] max-[480px]:w-[87px]"
              role="meter"
              aria-label="데모 경험치"
              aria-valuemin={0}
              aria-valuemax={1000}
              aria-valuenow={320}
            >
              <span className="block w-[32%] h-full bg-[linear-gradient(90deg,#08bdb6,#3eeac5)] rounded-[inherit]" />
            </div>
            <span className="text-[10px] text-[#b5cbd9] whitespace-nowrap max-[480px]:text-[8px]">320 / 1,000 XP</span>
          </div>
          <p className="text-[#d5e3ea] text-[12px] leading-[1.85] whitespace-pre-line mt-[18px] max-w-[600px] [overflow-wrap:anywhere] min-[1750px]:text-[13px] max-[700px]:text-[11px] max-[700px]:mt-[15px] max-[480px]:clear-both max-[480px]:pt-[2px]">
            {profile.bio || '나만의 게임 이야기를 소개해보세요.'}
          </p>
          <div className="flex items-center flex-wrap gap-[7px] mt-[14px] max-[480px]:mt-[13px] max-[480px]:gap-[5px]">
            {preferences.tags.map(tag => (
              <span key={tag} className="text-[#73dcea] border border-[#4893b66e] rounded-[20px] bg-[#0d293a9c] py-[5px] px-[12px] text-[10px] max-[480px]:text-[9px] max-[480px]:py-[5px] max-[480px]:px-[10px]">
                {tag}
              </span>
            ))}
            <button
              className="w-[28px] h-[28px] grid place-items-center text-[#bdd1dc] rounded-full border border-[#52708488] bg-[#152632b8] hover:text-[#37f3ca] hover:border-[#37f3ca]"
              aria-label="취향 태그 수정"
              onClick={() => onEdit('preferences')}
            >
              <GSIcon name="plus" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[23px] pr-[193px] mt-[22px] max-[1200px]:pr-[170px] max-[1200px]:flex-wrap max-[1200px]:gap-[16px] max-[700px]:pr-0 max-[700px]:mt-[23px] max-[480px]:mt-[18px] max-[480px]:gap-[14px]">
        <div className="flex gap-[21px] items-center flex-1 min-w-0 min-[1750px]:pl-[190px] max-[1500px]:flex-col max-[1500px]:items-start max-[1500px]:gap-[7px] max-[1200px]:flex-row max-[1200px]:basis-full max-[1200px]:gap-[18px] max-[700px]:flex-wrap max-[700px]:gap-[10px_18px] max-[480px]:gap-[7px_15px]">
          <span className="flex items-center gap-[9px] text-[9px] text-[#adc2cf] max-[480px]:text-[8px] max-[480px]:gap-[6px] [&_svg]:shrink-0 [&_svg]:text-[#dfecf2] [&_svg]:max-[480px]:w-[14px]">
            <GSIcon name="calendar" size={16} />
            2024년 3월 15일 가입 · 예시
          </span>
          <span className="flex items-center gap-[9px] text-[9px] text-[#adc2cf] max-[480px]:text-[8px] max-[480px]:gap-[6px] [&_svg]:shrink-0 [&_svg]:text-[#dfecf2] [&_svg]:max-[480px]:w-[14px]">
            <GSIcon name="pin" size={16} />
            {profile.location || '나만의 게임 세계'}
          </span>
        </div>
        <div className="flex items-center gap-[19px] border-l border-[#7897a543] pl-[22px] min-[1750px]:gap-[26px] max-[1500px]:gap-[15px] max-[1500px]:pl-[16px] max-[1200px]:border-0 max-[1200px]:pl-0 max-[1200px]:w-full max-[1200px]:justify-between max-[700px]:border-l-0 max-[700px]:border-t max-[700px]:border-[#7294a135] max-[700px]:pt-[17px] max-[700px]:gap-[14px] max-[480px]:grid max-[480px]:grid-cols-[1.3fr_1fr_1fr] max-[480px]:gap-[11px]">
          <div className="flex items-center gap-[10px] max-[1500px]:gap-[7px] max-[700px]:items-start max-[480px]:flex-col max-[480px]:gap-[7px]">
            <span className="grid place-items-center w-[37px] h-[37px] shrink-0 border border-[#6e8f9f5c] bg-[#13242d61] rounded-full max-[1500px]:w-[32px] max-[1500px]:h-[32px] max-[700px]:w-[29px] max-[700px]:h-[29px] [&_svg]:max-[700px]:w-[18px]">
              <GSIcon name="gamepad" />
            </span>
            <span>
              <small className="block text-[8px] text-[#a6bdcc] mb-[2px]">주로 즐기는 방식</small>
              <strong className="block text-[10px] font-semibold whitespace-nowrap max-[1500px]:text-[9px] max-[700px]:whitespace-normal max-[480px]:text-[9px] max-[480px]:leading-[1.6]">{preferences.playStyle}</strong>
            </span>
          </div>
          <div className="flex items-center gap-[10px] max-[1500px]:gap-[7px] max-[700px]:items-start max-[480px]:flex-col max-[480px]:gap-[7px]">
            <span className="grid place-items-center w-[37px] h-[37px] shrink-0 border border-[#6e8f9f5c] bg-[#13242d61] rounded-full max-[1500px]:w-[32px] max-[1500px]:h-[32px] max-[700px]:w-[29px] max-[700px]:h-[29px] [&_svg]:max-[700px]:w-[18px]">
              <GSIcon name="chart" />
            </span>
            <span>
              <small className="block text-[8px] text-[#a6bdcc] mb-[2px]">월 플레이 목표</small>
              <strong className="block text-[10px] font-semibold whitespace-nowrap max-[1500px]:text-[9px] max-[700px]:whitespace-normal max-[480px]:text-[9px] max-[480px]:leading-[1.6]">
                {preferences.monthlyHours ? `${preferences.monthlyHours}시간` : '설정 안 함'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-[10px] max-[1500px]:gap-[7px] max-[700px]:items-start max-[480px]:flex-col max-[480px]:gap-[7px]">
            <span className="grid place-items-center w-[37px] h-[37px] shrink-0 border border-[#6e8f9f5c] bg-[#13242d61] rounded-full max-[1500px]:w-[32px] max-[1500px]:h-[32px] max-[700px]:w-[29px] max-[700px]:h-[29px] [&_svg]:max-[700px]:w-[18px]">
              <GSIcon name="wallet" />
            </span>
            <span>
              <small className="block text-[8px] text-[#a6bdcc] mb-[2px]">월 게임 예산</small>
              <strong className="block text-[10px] font-semibold whitespace-nowrap max-[1500px]:text-[9px] max-[700px]:whitespace-normal max-[480px]:text-[9px] max-[480px]:leading-[1.6]">
                {preferences.budget
                  ? `${preferences.budget.toLocaleString('ko-KR')}원`
                  : '설정 안 함'}
              </strong>
            </span>
          </div>
        </div>
      </div>
      <div className="absolute right-[24px] bottom-[20px] w-[180px] grid gap-[8px] max-[1200px]:w-[152px] max-[1200px]:right-[21px] max-[700px]:static max-[700px]:w-full max-[700px]:grid-cols-2 max-[700px]:mt-[24px] max-[480px]:mt-[20px]">
        <p className="mb-[25px] text-center text-[16px] leading-[1.5] text-[#c6d4dd] italic rotate-[-7deg] [text-shadow:0_2px_9px_#000] max-[1200px]:text-[14px] max-[700px]:hidden">
          좋은 게임이
          <br />더 좋은 일상을 만든다.
          <em className="block mt-[3px] text-[11px]">
            with <b className="text-[#37ead2] text-[16px]">GameSense</b>
          </em>
        </p>
        <button
          className="gs-primary-button min-h-[35px] px-[15px] py-[8px] text-[11px] bg-[#22ecc5]!"
          onClick={() => onEdit('profile')}
        >
          <GSIcon name="edit" size={17} />
          프로필 수정
        </button>
        <button
          className="inline-flex items-center justify-center gap-[10px] border border-[#59dbcd] bg-[#06141bab] rounded-[25px] px-[15px] py-[7px] min-h-[35px] text-[11px] text-[#e0edf4] hover:bg-[#175a514f]"
          onClick={() => onEdit('preferences')}
        >
          <GSIcon name="settings" size={17} />
          취향 수정
        </button>
      </div>
    </section>
  )
}
