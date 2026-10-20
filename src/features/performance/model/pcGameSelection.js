export function gameDetailKey(scope,appId){return `${scope}:${appId}`}
export function gameViewGames(ownedListing,searched,searchMode){return searchMode?searched:ownedListing.games}
