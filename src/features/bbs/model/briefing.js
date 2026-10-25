export function briefingPath(appId, article) {
  if (!/^[1-9]\d{0,9}$/.test(String(appId)) || !/^\d{1,64}$/.test(article?.id ?? '')
      || !/^[a-f0-9]{64}$/.test(article?.sourceHash ?? '')) return null
  return `/api/games/bbs/${appId}/news/${article.id}/briefing`
}

export function validateBriefing(data, sourceHash) {
  if (!['READY', 'EMPTY', 'STALE', 'PROCESSING', 'UNAVAILABLE'].includes(data?.status)) throw new Error('Invalid briefing status')
  if (data.status !== 'READY') return { status: data.status, briefing: null }
  const b = data.briefing
  if (!b || b.sourceHash !== sourceHash || typeof b.titleKo !== 'string' || !b.titleKo.trim()
      || !Array.isArray(b.points) || b.points.length !== 3 || b.points.some(p => typeof p !== 'string' || !p.trim())
      || typeof b.narrationScript !== 'string' || !b.narrationScript.trim()
      || !Number.isFinite(b.estimatedSeconds) || b.estimatedSeconds < 30 || b.estimatedSeconds > 60) throw new Error('Invalid briefing content')
  return data
}
