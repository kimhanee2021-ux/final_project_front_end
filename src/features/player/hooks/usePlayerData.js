import { useEffect, useState } from 'react'
import { discoverGames } from '@/features/games'
import {
  defaultPlayer,
  gameStatuses,
  playStyles,
  preferenceTags,
  profileAvatars,
  profileCovers,
} from '../mocks/playerMock'

const storageKey = 'gamesense-player-v1'
const validText = (value, max) => typeof value === 'string' && value.length <= max

function readPlayer() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey))
    const p = value?.profile
    const prefs = value?.preferences
    if (!p || !prefs || !value.games || !Array.isArray(value.activities)) return defaultPlayer
    if (
      !validText(p.name, 24) ||
      !p.name.trim() ||
      !validText(p.bio, 180) ||
      !validText(p.location, 30)
    )
      return defaultPlayer
    if (
      !profileCovers.some(item => item.id === p.cover) ||
      !profileAvatars.some(item => item.id === p.avatar)
    )
      return defaultPlayer
    if (
      !Array.isArray(prefs.tags) ||
      prefs.tags.length > 5 ||
      !prefs.tags.every(tag => preferenceTags.includes(tag))
    )
      return defaultPlayer
    if (
      !playStyles.includes(prefs.playStyle) ||
      !Number.isInteger(prefs.monthlyHours) ||
      prefs.monthlyHours < 0 ||
      prefs.monthlyHours > 300 ||
      !Number.isInteger(prefs.budget) ||
      prefs.budget < 0 ||
      prefs.budget > 1000000
    )
      return defaultPlayer
    if (
      !discoverGames
        .filter(game => game.owned)
        .every(game => {
          const state = value.games[game.id]
          return (
            state &&
            gameStatuses.some(item => item.id === state.status) &&
            Number.isInteger(state.progress) &&
            state.progress >= 0 &&
            state.progress <= 100 &&
            validText(state.note, 180)
          )
        })
    )
      return defaultPlayer
    if (
      !value.activities.every(
        item =>
          item &&
          validText(item.id, 100) &&
          validText(item.title, 200) &&
          validText(item.description, 400) &&
          typeof item.type === 'string' &&
          typeof item.date === 'string' &&
          Number.isFinite(Date.parse(item.date))
      )
    )
      return defaultPlayer
    return {
      profile: p,
      preferences: prefs,
      games: value.games,
      activities: value.activities.slice(0, 50),
    }
  } catch {
    return defaultPlayer
  }
}

function newActivity(type, title, description) {
  return { id: crypto.randomUUID(), type, title, description, date: new Date().toISOString() }
}

export default function usePlayerData() {
  const [player, setPlayer] = useState(readPlayer)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(player))
    } catch {
      /* Keep editing available in memory if browser storage is blocked. */
    }
  }, [player])
  const apply = (change, activity) =>
    setPlayer(previous => ({
      ...previous,
      ...change(previous),
      activities: [activity, ...previous.activities].slice(0, 50),
    }))
  const recordActivity = (type, title, description) =>
    apply(() => ({}), newActivity(type, title, description))
  const updateProfile = patch =>
    apply(
      previous => ({ profile: { ...previous.profile, ...patch } }),
      newActivity(
        'profile',
        '나의 프로필을 수정했어요.',
        '이름, 소개 또는 프로필 이미지를 새롭게 꾸몄어요.'
      )
    )
  const updatePreferences = preferences =>
    apply(
      () => ({ preferences }),
      newActivity(
        'preferences',
        '나의 취향과 목표를 수정했어요.',
        `월 게임 예산 ${preferences.budget.toLocaleString('ko-KR')}원 · 월 플레이 목표 ${preferences.monthlyHours}시간`
      )
    )
  const updateGameRecord = (game, record) => {
    const previous = player.games[game.id]
    const statusChanged = previous.status !== record.status
    const label = gameStatuses.find(status => status.id === record.status).label
    const activity = statusChanged
      ? newActivity(
          record.status === 'completed' ? 'completed' : 'playing',
          `${game.name} · ${label}`,
          `플레이 상태를 ${label}(으)로 변경했어요.`
        )
      : newActivity(
          'note',
          '게임 기록을 수정했어요.',
          `${game.name} · ${record.note || `진행률 ${record.progress}%`}`
        )
    apply(state => ({ games: { ...state.games, [game.id]: record } }), activity)
  }
  return { player, updateProfile, updatePreferences, updateGameRecord, recordActivity }
}
