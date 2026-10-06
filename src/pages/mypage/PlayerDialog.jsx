import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../components/discover/GSIcon'
import { useGameSense } from '../../contexts/GameSenseContext'
import {
  gameStatuses,
  playStyles,
  preferenceTags,
  profileAvatars,
  profileCovers,
} from '../../mocks/playerMock'
import ActivityTimeline from './ActivityTimeline'

const titles = {
  profile: '프로필 수정',
  preferences: '취향과 목표 수정',
  avatar: '프로필 아바타 변경',
  cover: '커버 이미지 변경',
  game: '나의 게임 기록',
  history: '전체 게임 기록',
}

function FormActions({ onClose, label = '저장하기' }) {
  return (
    <div className="mp-form-actions">
      <button type="button" className="mp-cancel-button" onClick={onClose}>
        취소
      </button>
      <button type="submit" className="gs-primary-button">
        <GSIcon name="check" size={17} />
        {label}
      </button>
    </div>
  )
}

function ProfileForm({ onClose }) {
  const { player, updateProfile, notify } = useGameSense()
  const [draft, setDraft] = useState(player.profile)
  const [error, setError] = useState('')
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }))
  const submit = event => {
    event.preventDefault()
    if (!draft.name.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    updateProfile({
      name: draft.name.trim(),
      bio: draft.bio.trim(),
      location: draft.location.trim(),
    })
    notify('프로필을 저장했어요. 나만의 이야기를 이어가세요.')
    onClose()
  }
  return (
    <form className="mp-edit-form" onSubmit={submit}>
      <p className="mp-form-description">게임을 즐기는 나를 소개해보세요.</p>
      <label>
        닉네임
        <input
          autoComplete="nickname"
          value={draft.name}
          maxLength={24}
          required
          onChange={event => {
            update('name', event.target.value)
            setError('')
          }}
        />
        <small>최대 24자</small>
      </label>
      {error && (
        <p className="mp-form-error" role="alert">
          {error}
        </p>
      )}
      <label>
        나의 소개
        <textarea
          value={draft.bio}
          rows={3}
          maxLength={180}
          onChange={event => update('bio', event.target.value)}
        />
        <small>{draft.bio.length} / 180자</small>
      </label>
      <label>
        내가 있는 곳
        <input
          value={draft.location}
          maxLength={30}
          placeholder="게임이 있는 어디든"
          onChange={event => update('location', event.target.value)}
        />
      </label>
      <p className="mp-local-note">
        <GSIcon name="shield" size={15} />
        변경 사항은 이 브라우저에만 저장됩니다.
      </p>
      <FormActions onClose={onClose} />
    </form>
  )
}

function PreferencesForm({ onClose }) {
  const { player, updatePreferences, notify } = useGameSense()
  const [draft, setDraft] = useState(player.preferences)
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }))
  const toggleTag = tag =>
    update(
      'tags',
      draft.tags.includes(tag)
        ? draft.tags.filter(item => item !== tag)
        : [...draft.tags, tag].slice(0, 5)
    )
  const submit = event => {
    event.preventDefault()
    updatePreferences({
      ...draft,
      monthlyHours: Number(draft.monthlyHours),
      budget: Number(draft.budget),
    })
    notify('취향과 목표를 저장했어요.')
    onClose()
  }
  return (
    <form className="mp-edit-form" onSubmit={submit}>
      <p className="mp-form-description">좋아하는 경험과 나에게 편안한 목표를 선택하세요.</p>
      <fieldset className="mp-preference-field">
        <legend>
          내 취향 <small>최대 5개 · {draft.tags.length}개 선택</small>
        </legend>
        <div className="mp-tag-choices">
          {preferenceTags.map(tag => (
            <button
              key={tag}
              type="button"
              aria-pressed={draft.tags.includes(tag)}
              disabled={!draft.tags.includes(tag) && draft.tags.length >= 5}
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {draft.tags.includes(tag) && <GSIcon name="check" size={13} />}
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        주로 즐기는 방식
        <select value={draft.playStyle} onChange={event => update('playStyle', event.target.value)}>
          {playStyles.map(style => (
            <option key={style}>{style}</option>
          ))}
        </select>
      </label>
      <div className="mp-form-two-col">
        <label>
          월 플레이 목표 (시간)
          <input
            type="number"
            min={0}
            max={300}
            step={1}
            required
            value={draft.monthlyHours}
            onChange={event => update('monthlyHours', event.target.value)}
          />
        </label>
        <label>
          월 게임 예산 (원)
          <input
            type="number"
            min={0}
            max={1000000}
            step={1000}
            required
            value={draft.budget}
            onChange={event => update('budget', event.target.value)}
          />
        </label>
      </div>
      <p className="mp-local-note">
        목표는 선택 사항입니다. 0을 입력하면 ‘설정 안 함’으로 표시합니다.
        <br />이 정보는 데모 프로필에 저장되며 실제 AI 추천·소비 분석에는 적용되지 않습니다.
      </p>
      <FormActions onClose={onClose} />
    </form>
  )
}

function ImagePicker({ type, onClose }) {
  const { player, updateProfile, notify } = useGameSense()
  const [selected, setSelected] = useState(player.profile[type])
  const options = type === 'avatar' ? profileAvatars : profileCovers
  return (
    <form
      className="mp-edit-form"
      onSubmit={event => {
        event.preventDefault()
        updateProfile({ [type]: selected })
        notify(type === 'avatar' ? '프로필 아바타를 변경했어요.' : '커버 이미지를 변경했어요.')
        onClose()
      }}
    >
      <p className="mp-form-description">나를 닮은 분위기를 선택해보세요.</p>
      <div className={`mp-image-choices mp-choose-${type}`} role="group" aria-label={titles[type]}>
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            aria-label={option.name}
            aria-pressed={selected === option.id}
            onClick={() => setSelected(option.id)}
          >
            <img src={option.image} alt="" />
            <span>
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

function GameRecordForm({ game, onClose }) {
  const { player, updateGameRecord, notify } = useGameSense()
  const [draft, setDraft] = useState(player.games[game.id])
  const progress =
    draft.status === 'completed' ? 100 : draft.status === 'planned' ? 0 : draft.progress
  const submit = event => {
    event.preventDefault()
    updateGameRecord(game, { ...draft, progress, note: draft.note.trim() })
    notify(`${game.shortName || game.name} · 게임 기록을 저장했어요.`)
    onClose()
  }
  return (
    <form className="mp-edit-form" onSubmit={submit}>
      <div className="mp-record-game">
        <img src={game.banner} alt="" />
        <div>
          <strong>{game.name}</strong>
          <span>누적 {game.hours}시간 · 예시 기록</span>
        </div>
      </div>
      <label>
        플레이 상태
        <select
          value={draft.status}
          onChange={event => setDraft(previous => ({ ...previous, status: event.target.value }))}
        >
          {gameStatuses.map(status => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="mp-progress-input">
        <span>
          나의 진행률 <strong>{progress}%</strong>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={progress}
          disabled={['completed', 'planned'].includes(draft.status)}
          onChange={event =>
            setDraft(previous => ({ ...previous, progress: Number(event.target.value) }))
          }
        />
        <small>직접 기록하는 진행률입니다. 완료는 100%, 플레이 예정은 0%로 표시합니다.</small>
      </label>
      <label>
        다음에 할 일 · 한 줄 메모
        <textarea
          rows={3}
          value={draft.note}
          maxLength={180}
          placeholder="다음에 이어서 하고 싶은 일이나 감상을 남겨보세요."
          onChange={event => setDraft(previous => ({ ...previous, note: event.target.value }))}
        />
        <small>{draft.note.length} / 180자</small>
      </label>
      <p className="mp-local-note">
        게임 실행이나 실제 플레이 시간 측정은 지원하지 않는 데모입니다.
      </p>
      <FormActions onClose={onClose} />
    </form>
  )
}

function HistoryView() {
  const { player } = useGameSense()
  const [filter, setFilter] = useState('all')
  const activities = player.activities.filter(
    item =>
      filter === 'all' ||
      (filter === 'game'
        ? ['playing', 'completed', 'note'].includes(item.type)
        : item.type === filter)
  )
  return (
    <div className="mp-history-view">
      <div className="mp-history-toolbar">
        <span>최근 {player.activities.length}개 기록</span>
        <label>
          <span className="sr-only">게임 기록 유형</span>
          <select
            aria-label="게임 기록 유형"
            value={filter}
            onChange={event => setFilter(event.target.value)}
          >
            <option value="all">모든 기록</option>
            <option value="game">게임과 메모</option>
            <option value="wishlist">위시리스트</option>
            <option value="profile">프로필</option>
            <option value="preferences">취향과 목표</option>
          </select>
        </label>
      </div>
      <ActivityTimeline activities={activities} />
      <p className="mp-local-note">
        샘플 기록과 직접 남긴 최근 50개 기록을 이 브라우저에 저장합니다.
      </p>
    </div>
  )
}

export default function PlayerDialog({ dialog, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    if (dialog && !element.open) element.showModal()
    else if (!dialog && element.open) element.close()
  }, [dialog])
  return (
    <dialog
      ref={ref}
      className={`mp-dialog ${dialog?.type === 'history' ? 'mp-history-dialog' : ''}`}
      aria-labelledby="mp-dialog-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {dialog && (
        <div className="mp-dialog-inner">
          <div className="mp-dialog-top">
            <span>MAKE IT YOURS</span>
            <button
              autoFocus
              className="gs-icon-button"
              aria-label="마이페이지 편집 창 닫기"
              onClick={onClose}
            >
              <GSIcon name="close" />
            </button>
          </div>
          <h2 id="mp-dialog-title">{titles[dialog.type]}</h2>
          {dialog.type === 'profile' && <ProfileForm onClose={onClose} />}
          {dialog.type === 'preferences' && <PreferencesForm onClose={onClose} />}
          {['avatar', 'cover'].includes(dialog.type) && (
            <ImagePicker key={dialog.type} type={dialog.type} onClose={onClose} />
          )}
          {dialog.type === 'game' && (
            <GameRecordForm key={dialog.game.id} game={dialog.game} onClose={onClose} />
          )}
          {dialog.type === 'history' && <HistoryView />}
        </div>
      )}
    </dialog>
  )
}
