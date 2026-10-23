import { useEffect, useState } from 'react'
import {
  defaultPlayer,
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
    if (!p || !prefs) return defaultPlayer
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
    return {
      profile: p,
      preferences: prefs,
    }
  } catch {
    return defaultPlayer
  }
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
  const updateProfile = patch => setPlayer(previous => ({ ...previous, profile: { ...previous.profile, ...patch } }))
  const updatePreferences = preferences => setPlayer(previous => ({ ...previous, preferences }))
  return { player, updateProfile, updatePreferences }
}
