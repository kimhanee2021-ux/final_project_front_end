import { useEffect, useState } from 'react'
import { defaultPlayer, profileAvatars, profileCovers } from '../mocks/playerMock'

const storageKey = 'gamesense-player-v2'

function readPlayer() {
  try {
    const p = JSON.parse(localStorage.getItem(storageKey))?.profile
    if (!p) return defaultPlayer
    if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 24) return defaultPlayer
    if (
      !profileCovers.some(item => item.id === p.cover) ||
      !profileAvatars.some(item => item.id === p.avatar)
    )
      return defaultPlayer
    return { profile: p }
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
  return { player, updateProfile }
}
