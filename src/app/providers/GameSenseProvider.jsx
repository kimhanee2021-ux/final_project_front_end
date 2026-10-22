import { useState } from 'react'
import { GameSenseContext } from '@/shared/state'
import { useWishlist } from '@/features/wishlist'
import { usePlayerData } from '@/features/player'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authLink } from '@/features/auth'

export default function GameSenseProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const playerData = usePlayerData()
  // 위시리스트는 계정별로 저장한다(로그인 전에는 'guest' 하나를 쓰지만, 담기는 로그인 후에만 된다).
  const { wishlist, isWishlisted, toggle: toggleStoredWishlist } = useWishlist(user ? `user-${user.id}` : 'guest')
  const [query, setQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [toast, setToast] = useState(null)
  const notify = message => setToast({ message, id: Date.now() })
  const toggleWishlist = game => {
    if (!isAuthenticated) {
      setSelectedGame(null)
      navigate(authLink('login', location.pathname + location.search + location.hash), { state: { loginRequired: true } })
      return
    }
    const added = toggleStoredWishlist(game)
    playerData.recordActivity(
      'wishlist',
      added ? '위시리스트에 게임을 추가했어요.' : '위시리스트에서 게임을 정리했어요.',
      game.name
    )
    notify(
      `${game.shortName || game.name} · ${added ? '위시리스트에 담았어요' : '위시리스트에서 뺐어요'}`
    )
  }
  // 실제 로그인 상태면 화면에 보이는 닉네임은 서버 계정 정보를 따른다.
  const player = user
    ? { ...playerData.player, profile: { ...playerData.player.profile, name: user.nickname } }
    : playerData.player
  return (
    <GameSenseContext.Provider
      value={{
        ...playerData,
        player,
        wishlist,
        isWishlisted,
        toggleWishlist,
        query,
        setQuery,
        selectedGame,
        setSelectedGame,
        toast,
        setToast,
        notify,
      }}
    >
      {children}
    </GameSenseContext.Provider>
  )
}
