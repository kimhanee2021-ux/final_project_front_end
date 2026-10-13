import GSIcon from '../../../components/common/GSIcon'
export default function DashboardIntro({ view, asOf, badgeLabel = '데모 데이터' }) {
  return (
    <div className="dashboard-intro">
      <div>
        <div className="eyebrow">YOUR PLAY, YOUR VALUE</div>
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
        <p>
          {view === 'library'
            ? '구매한 게임과 함께한 시간을 한눈에 살펴보세요.'
            : '게임에 쓴 돈과 시간을 돌아보고, 나만의 가치를 발견하세요.'}
        </p>
      </div>
      <div className="demo-pill">
        <span className="status-dot" />
        {badgeLabel}
        <GSIcon name="info" size={14} />
        <span className="demo-date">{asOf.replaceAll('-', '.')} 기준</span>
      </div>
    </div>
  )
}
