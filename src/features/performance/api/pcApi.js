import { api } from '../../ai-common/api'
export function extractPcPhoto(file,signal){const body=new FormData();body.append('image',file);return api('/ai/pc/extract',{method:'POST',body,signal})}
export function assessPc(specs,appId,signal,includeAi=true){return api('/ai/pc/assess',{method:'POST',body:{specs,appId,includeAi},signal})}
export function searchPcGames(keyword,signal){return api(`/ai/pc/games?keyword=${encodeURIComponent(keyword)}`,{signal})}
export function loadPcParts(signal){return api('/ai/pc/parts',{signal})}
