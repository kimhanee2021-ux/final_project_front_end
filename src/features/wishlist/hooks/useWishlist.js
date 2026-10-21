import { useState } from 'react'
import { readWishlistItems, toWishlistItem } from '../model/wishlistItem'

const STORAGE_PREFIX = 'gamesense-wishlist-v2:'

function readStored(key) {
  try {
    return readWishlistItems(JSON.parse(localStorage.getItem(key)))
  } catch {
    return []
  }
}

// 위시리스트를 계정(owner)별로 브라우저에 저장하고 읽는다. 아직 백엔드 위시리스트 API가 없어서 이 브라우저에만 저장된다.
// owner가 바뀌면(로그인·로그아웃) 그 계정의 목록을 다시 읽는다. 저장소를 못 쓰는 환경에서도 이번 화면에서는 동작한다.
export function useWishlist(owner) {
  const key = STORAGE_PREFIX + owner
  const [store, setStore] = useState(() => ({ key, items: readStored(key) }))
  const wishlist = store.key === key ? store.items : readStored(key)

  const isWishlisted = game => wishlist.some(item => item.id === game.id)

  const write = items => {
    setStore({ key, items })
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch {
      /* 저장소를 못 써도 이번 화면에서는 목록을 계속 쓴다. */
    }
  }

  // 담겨 있으면 빼고, 없으면 담는다. 담았으면 true, 뺐으면 false를 돌려준다.
  const toggle = game => {
    const exists = isWishlisted(game)
    write(exists ? wishlist.filter(item => item.id !== game.id) : [...wishlist, toWishlistItem(game)])
    return !exists
  }

  return { wishlist, isWishlisted, toggle }
}
