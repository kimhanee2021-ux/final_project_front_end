import GSIcon from '../../components/discover/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import { profileAvatars, profileCovers } from '../../mocks/playerMock'

export default function ProfileHero({ onEdit }) {
  const { player } = useGameSense()
  const { profile, preferences } = player
  const cover = profileCovers.find(item => item.id === profile.cover)
  const avatar = profileAvatars.find(item => item.id === profile.avatar)
  return (
    <section
      className="mp-profile"
      aria-labelledby="mp-profile-name"
      style={{ '--mp-cover': `url('${cover.image}')` }}
    >
      <div className="mp-profile-shade" />
      <button className="mp-cover-button" onClick={() => onEdit('cover')}>
        <GSIcon name="image" size={16} />
        커버 이미지 변경
      </button>
      <div className="mp-profile-main">
        <div className="mp-avatar-wrap">
          <img className="mp-avatar" src={avatar.image} alt={`${profile.name}의 프로필`} />
          <button aria-label="프로필 아바타 변경" onClick={() => onEdit('avatar')}>
            <GSIcon name="camera" size={20} />
          </button>
        </div>
        <div className="mp-identity">
          <div className="mp-name-line">
            <h1 id="mp-profile-name">{profile.name}</h1>
            <span className="mp-demo-label">DEMO PROFILE</span>
          </div>
          <div className="mp-level">
            <strong>Lv. 12</strong>
            <div
              className="mp-xp-track"
              role="meter"
              aria-label="데모 경험치"
              aria-valuemin={0}
              aria-valuemax={1000}
              aria-valuenow={320}
            >
              <span />
            </div>
            <span>320 / 1,000 XP</span>
          </div>
          <p className="mp-bio">{profile.bio || '나만의 게임 이야기를 소개해보세요.'}</p>
          <div className="mp-profile-tags">
            {preferences.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
            <button aria-label="취향 태그 수정" onClick={() => onEdit('preferences')}>
              <GSIcon name="plus" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="mp-profile-bottom">
        <div className="mp-profile-meta">
          <span>
            <GSIcon name="calendar" size={16} />
            2024년 3월 15일 가입 · 예시
          </span>
          <span>
            <GSIcon name="pin" size={16} />
            {profile.location || '나만의 게임 세계'}
          </span>
        </div>
        <div className="mp-profile-facts">
          <div>
            <span className="mp-fact-icon">
              <GSIcon name="gamepad" />
            </span>
            <span>
              <small>주로 즐기는 방식</small>
              <strong>{preferences.playStyle}</strong>
            </span>
          </div>
          <div>
            <span className="mp-fact-icon">
              <GSIcon name="chart" />
            </span>
            <span>
              <small>월 플레이 목표</small>
              <strong>
                {preferences.monthlyHours ? `${preferences.monthlyHours}시간` : '설정 안 함'}
              </strong>
            </span>
          </div>
          <div>
            <span className="mp-fact-icon">
              <GSIcon name="wallet" />
            </span>
            <span>
              <small>월 게임 예산</small>
              <strong>
                {preferences.budget
                  ? `${preferences.budget.toLocaleString('ko-KR')}원`
                  : '설정 안 함'}
              </strong>
            </span>
          </div>
        </div>
      </div>
      <div className="mp-profile-actions">
        <p>
          좋은 게임이
          <br />더 좋은 일상을 만든다.
          <em>
            with <b>GameSense</b>
          </em>
        </p>
        <button className="gs-primary-button" onClick={() => onEdit('profile')}>
          <GSIcon name="edit" size={17} />
          프로필 수정
        </button>
        <button className="mp-outline-button" onClick={() => onEdit('preferences')}>
          <GSIcon name="settings" size={17} />
          취향 수정
        </button>
      </div>
    </section>
  )
}
