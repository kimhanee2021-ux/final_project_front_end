import GSIcon from '../../../components/common/GSIcon'
export default function DashboardIntro({ view, asOf, badgeLabel = '데모 데이터' }) {
  return (
    <div className="flex justify-between items-center mb-[29px] gap-[20px] max-[760px]:flex-col max-[760px]:gap-[13px] max-[760px]:mb-[23px]">
      <div>
        <div className="text-[9px] font-bold tracking-[1.9px] text-primary-text">YOUR PLAY, YOUR VALUE</div>
        <h1>
          {view === 'analysis' ? (
            '내 소비를 더 깊이 이해하기'
          ) : view === 'library' ? (
            '나의 게임, 나의 이야기'
          ) : (
            <>
              좋아하는 게임, <span>현명한 소비.</span>
            </>
          )}
        </h1>
        <p className="text-[12px] text-muted">
          {view === 'library'
            ? '구매한 게임과 함께한 시간을 한눈에 살펴보세요.'
            : '게임에 쓴 돈과 시간을 돌아보고, 나만의 가치를 발견하세요.'}
        </p>
      </div>

      <div className="flex items-center gap-[7px] text-[10px] text-muted whitespace-nowrap max-[1200px]:flex-wrap max-[1200px]:max-w-[145px] max-[760px]:max-w-none">
        <span className="w-[6px] h-[6px] rounded-full bg-[#8c72e9] shrink-0" />
        {badgeLabel}
        <GSIcon name="info" size={14} />
        <span className="border-l border-border ml-[3px] pl-[10px] max-[1200px]:ml-0 max-[1200px]:pl-0 max-[1200px]:border-0 max-[760px]:inline max-[760px]:border-l max-[760px]:border-border max-[760px]:pl-[8px]">{asOf.replaceAll('-', '.')} 기준</span>
      </div>
    </div>
  )
}
