import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import { useGameSense } from '../../../contexts/GameSenseContext'
import {
  gameStatuses,
  playStyles,
  preferenceTags,
  profileAvatars,
  profileCovers,
} from '../mocks/playerMock'
import ActivityTimeline from './ActivityTimeline'
import { useAuth } from '../../auth/context/AuthContext'
import { getErrorMessage } from '../../../utils/apiClient'

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
    <div className="flex justify-end gap-[10px] border-t border-gs-border pt-[20px] mt-[23px] [&>button]:min-h-[40px]">
      <button
        type="button"
        className="border border-gs-border rounded-[24px] bg-gs-raised py-[9px] px-[22px] text-[12px] hover:bg-gs-hover"
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

const fieldClass = 'w-full text-gs-text bg-gs-bg border border-gs-border rounded-[8px] py-[11px] px-[12px] font-[inherit] text-[12px] mt-[8px] min-w-0'
const labelClass = 'flex flex-col text-[12px] font-[550] mb-[19px]'

function ProfileForm({ onClose }) {
  const { player, updateProfile, notify } = useGameSense()
  const { isAuthenticated, user, updateAccount } = useAuth()
  const [draft, setDraft] = useState(player.profile)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }))
  const submit = async event => {
    event.preventDefault()
    if (!draft.name.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    // 실제 계정의 닉네임은 서버에 저장한다. 소개·지역은 아직 백엔드 필드가 없어 브라우저에만 저장.
    if (isAuthenticated && draft.name.trim() !== user.nickname) {
      setSaving(true)
      try {
        await updateAccount({ nickname: draft.name.trim() })
      } catch (requestError) {
        setError(getErrorMessage(requestError))
        return
      } finally {
        setSaving(false)
      }
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
    <form className="[&>label]:flex [&>label]:flex-col" onSubmit={submit}>
      <p className="text-[12px] text-gs-muted leading-[1.7] m-[0_0_23px]">게임을 즐기는 나를 소개해보세요.</p>
      <label className={labelClass}>
        닉네임
        <input
          className={fieldClass}
          autoComplete="nickname"
          value={draft.name}
          maxLength={24}
          required
          onChange={event => {
            update('name', event.target.value)
            setError('')
          }}
        />
        <small className="self-end block text-gs-muted text-[10px] font-normal mt-[6px] leading-[1.6]">최대 24자</small>
      </label>
      {error && (
        <p className="text-[11px] text-[#f19797] m-[-10px_0_17px]" role="alert">
          {error}
        </p>
      )}
      <label className={labelClass}>
        나의 소개
        <textarea
          className={`${fieldClass} resize-y min-h-[90px] max-h-[240px] leading-[1.8]`}
          value={draft.bio}
          rows={3}
          maxLength={180}
          onChange={event => update('bio', event.target.value)}
        />
        <small className="self-end block text-gs-muted text-[10px] font-normal mt-[6px] leading-[1.6]">{draft.bio.length} / 180자</small>
      </label>
      <label className={labelClass}>
        내가 있는 곳
        <input
          className={fieldClass}
          value={draft.location}
          maxLength={30}
          placeholder="게임이 있는 어디든"
          onChange={event => update('location', event.target.value)}
        />
      </label>
      <p className="flex items-start gap-[7px] text-gs-muted text-[10px] leading-[1.8] [&_svg]:mt-[1px] [&_svg]:shrink-0">
        <GSIcon name="shield" size={15} />
        {isAuthenticated ? '닉네임은 계정에, 소개와 지역은 이 브라우저에 저장됩니다.' : '변경 사항은 이 브라우저에만 저장됩니다.'}
      </p>
      <FormActions onClose={onClose} label={saving ? '저장 중...' : undefined} />
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
    <form className="[&>label]:flex [&>label]:flex-col" onSubmit={submit}>
      <p className="text-[12px] text-gs-muted leading-[1.7] m-[0_0_23px]">좋아하는 경험과 나에게 편안한 목표를 선택하세요.</p>
      <fieldset className="border-0 p-0 m-[0_0_22px] min-w-0">
        <legend className="flex items-baseline gap-[13px] text-[12px] mb-[10px]">
          내 취향 <small className="text-gs-muted text-[10px]">최대 5개 · {draft.tags.length}개 선택</small>
        </legend>
        <div className="flex gap-[8px] flex-wrap">
          {preferenceTags.map(tag => (
            <button
              key={tag}
              type="button"
              className={`inline-flex items-center gap-[6px] border border-gs-border rounded-[25px] py-[8px] px-[13px] text-[11px] disabled:opacity-40 ${draft.tags.includes(tag) ? 'bg-gs-active border-[#1dd4b866] text-gs-mint' : 'bg-gs-raised text-gs-muted'}`}
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
      <label className={labelClass}>
        주로 즐기는 방식
        <select className={fieldClass} value={draft.playStyle} onChange={event => update('playStyle', event.target.value)}>
          {playStyles.map(style => (
            <option key={style}>{style}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-[16px] max-[480px]:gap-[10px]">
        <label className={`${labelClass} min-w-0 max-[480px]:text-[10px]`}>
          월 플레이 목표 (시간)
          <input
            className={fieldClass}
            type="number"
            min={0}
            max={300}
            step={1}
            required
            value={draft.monthlyHours}
            onChange={event => update('monthlyHours', event.target.value)}
          />
        </label>
        <label className={`${labelClass} min-w-0 max-[480px]:text-[10px]`}>
          월 게임 예산 (원)
          <input
            className={fieldClass}
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
      <p className="flex items-start gap-[7px] text-gs-muted text-[10px] leading-[1.8]">
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
  const isAvatar = type === 'avatar'
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        updateProfile({ [type]: selected })
        notify(isAvatar ? '프로필 아바타를 변경했어요.' : '커버 이미지를 변경했어요.')
        onClose()
      }}
    >
      <p className="text-[12px] text-gs-muted leading-[1.7] m-[0_0_23px]">나를 닮은 분위기를 선택해보세요.</p>
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
              className={`block object-cover w-full h-[95px] max-[480px]:h-[70px] ${isAvatar ? 'aspect-square h-auto max-[480px]:h-auto rounded-full' : 'rounded-[6px]'}`}
              src={option.image}
              alt=""
            />
            <span className="flex items-center justify-center gap-[5px] text-[10px] py-[10px] pt-[10px] pb-[3px] max-[480px]:text-[8px] [&_svg]:text-gs-mint [&_svg]:shrink-0">
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
    <form className="[&>label]:flex [&>label]:flex-col" onSubmit={submit}>
      <div className="flex items-center gap-[15px] m-[22px_0] bg-gs-raised border border-gs-border rounded-[10px] overflow-hidden max-[480px]:gap-[11px]">
        <img className="w-[115px] h-[77px] object-cover max-[480px]:w-[88px] max-[480px]:h-[73px]" src={game.banner} alt="" />
        <div className="py-[10px] pr-[12px]">
          <strong className="block text-[14px] max-[480px]:text-[12px]">{game.name}</strong>
          <span className="block text-gs-muted text-[10px] mt-[5px]">누적 {game.hours}시간 · 예시 기록</span>
        </div>
      </div>
      <label className={labelClass}>
        플레이 상태
        <select
          className={fieldClass}
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
      <label className={labelClass}>
        <span className="flex justify-between">
          나의 진행률 <strong className="text-gs-mint">{progress}%</strong>
        </span>
        <input
          className="m-[15px_0_3px] accent-gs-mint w-full"
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
        <small className="self-end block text-gs-muted text-[10px] font-normal mt-[6px] leading-[1.6]">직접 기록하는 진행률입니다. 완료는 100%, 플레이 예정은 0%로 표시합니다.</small>
      </label>
      <label className={labelClass}>
        다음에 할 일 · 한 줄 메모
        <textarea
          className={`${fieldClass} resize-y min-h-[90px] max-h-[240px] leading-[1.8]`}
          rows={3}
          value={draft.note}
          maxLength={180}
          placeholder="다음에 이어서 하고 싶은 일이나 감상을 남겨보세요."
          onChange={event => setDraft(previous => ({ ...previous, note: event.target.value }))}
        />
        <small className="self-end block text-gs-muted text-[10px] font-normal mt-[6px] leading-[1.6]">{draft.note.length} / 180자</small>
      </label>
      <p className="flex items-start gap-[7px] text-gs-muted text-[10px] leading-[1.8]">
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
    <div>
      <div className="flex items-center justify-between gap-[10px] m-[19px_0]">
        <span className="text-[12px] text-gs-muted">최근 {player.activities.length}개 기록</span>
        <label>
          <span className="sr-only">게임 기록 유형</span>
          <select
            className={`${fieldClass} !mt-0`}
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
      <ActivityTimeline activities={activities} size="large" />
      <p className="flex items-start gap-[7px] text-gs-muted text-[10px] leading-[1.8] border-t border-gs-border pt-[17px] mt-[17px]">
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
      className={`mp-dialog w-[min(560px,calc(100%-28px))] max-h-[90dvh] m-auto p-0 border border-gs-border rounded-[16px] text-gs-text bg-gs-panel shadow-[var(--gs-shadow)] backdrop:bg-[#020912c2] backdrop:backdrop-blur-[6px] ${dialog?.type === 'history' ? '!w-[min(760px,calc(100%-28px))]' : ''}`}
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
            <span className="text-gs-mint text-[9px] tracking-[2px]">MAKE IT YOURS</span>
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
