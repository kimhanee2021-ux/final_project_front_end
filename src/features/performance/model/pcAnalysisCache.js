export function analysisRequestKey(specs,games,scope){return JSON.stringify([scope,specs,[...new Set(games.map(game=>Number(game.appId)))].sort((a,b)=>a-b)])}
export function searchOverviewFrom(result){return {...result,overallGrade:result.resolutions?.find(item=>item.name==='FHD')?.target?.grade??'UNKNOWN',scopeType:'search',scopeGameCount:1}}
