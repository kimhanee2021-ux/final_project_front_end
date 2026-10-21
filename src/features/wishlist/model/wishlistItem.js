// 위시리스트에 담는 게임 한 건(스냅샷)을 만든다. 담을 때의 게임 정보를 그대로 저장해서,
// 나중에 원래 목록에 없어도(예: 스팀 추천이 바뀌어도) 위시리스트 화면에서 그대로 보여줄 수 있다.
//
// - 스팀 게임(storeUrl이 있음): 화면에 필요한 값만 저장한다.
// - 데모 게임(discoverMock): 상세 창이 필요로 하는 값이 많아 게임 객체 전체를 저장한다.
export function toWishlistItem(game) {
  if (game.storeUrl) {
    return {
      id: game.id,
      name: game.name,
      image: game.image,
      price: game.price ?? '',
      discountPercent: game.discountPercent ?? 0,
      tags: game.tags ?? [],
      storeUrl: game.storeUrl,
    }
  }
  return { ...game }
}

// 저장소에서 읽은 값이 올바른 목록인지 확인하고, 깨진 항목은 버린다.
export function readWishlistItems(value) {
  return Array.isArray(value) ? value.filter(item => item && item.id != null && item.name) : []
}
