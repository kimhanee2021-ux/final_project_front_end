import { useState } from 'react'
import { GameSenseContext } from './GameSenseContext'
import { discoverGames } from '../mocks/discoverMock'

function readStored(key, fallback, validate) {
  try { const value = JSON.parse(localStorage.getItem(key)); return validate(value) ? value : fallback }
  catch { return fallback }
}
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* In-memory interaction is available without storage. */ } }

export default function GameSenseProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readStored('gamesense-wishlist', [], value => Array.isArray(value) && value.every(id => discoverGames.some(game => game.id === id))))
  const [language, setLanguage] = useState(() => readStored('gamesense-language', 'en', value => ['en', 'ko'].includes(value)))
  const [query, setQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [toast, setToast] = useState(null)
  const notify = (message) => setToast({ message, id: Date.now() })
  const toggleWishlist = (game) => {
    const exists = wishlist.includes(game.id)
    const next = exists ? wishlist.filter(id => id !== game.id) : [...wishlist, game.id]
    setWishlist(next)
    save('gamesense-wishlist', next)
    notify(`${game.shortName || game.name} · ${exists ? '찜 목록에서 삭제했어요' : '찜 목록에 저장했어요'}`)
  }
  const changeLanguage = (value) => { setLanguage(value); save('gamesense-language', value) }
  const t = (english, korean) => language === 'ko' ? korean : english
  return <GameSenseContext.Provider value={{ wishlist, toggleWishlist, query, setQuery, selectedGame, setSelectedGame, toast, setToast, notify, language, changeLanguage, t }}>{children}</GameSenseContext.Provider>
}
