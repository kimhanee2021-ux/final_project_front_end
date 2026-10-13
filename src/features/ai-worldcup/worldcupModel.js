export function makeChoice(pair, verdict, reasons, note) {
  if (!['left', 'right', 'both', 'neither', 'unknown'].includes(verdict) || pair?.length !== 2) throw new Error('선택을 확인해주세요.');
  return {
    leftId: pair[0].appId,
    rightId: pair[1].appId,
    verdict,
    reasons: [...new Set(reasons)].slice(0, 6),
    note: note.trim().slice(0, 200),
    selectedIds: verdict === 'left' ? [pair[0].appId] : verdict === 'right' ? [pair[1].appId] : verdict === 'both' ? pair.map(g => g.appId) : []
  };
}
export function validateRound(data, history) {
  const seen = new Set(history.flatMap(c => [c.leftId, c.rightId]));
  if (data?.pair?.length !== 2 || data.pair[0].appId === data.pair[1].appId || data.pair.some(g => seen.has(g.appId))) throw new Error('대결 정보를 확인하지 못했습니다. 다시 시도해주세요.');
  return data;
}
