export function gpuCandidates(value) {
  const text = String(value ?? '').trim()
  return [
    ...new Set(
      text
        .split(/[,;\n]+|(?=\b(?:NVIDIA|AMD|Intel)\s)/i)
        .map(s => s.trim())
        .filter(Boolean)
    ),
  ]
}
export function imageDimensions(width, height, maxSide = 2048) {
  if (!width || !height || width * height > 24000000) throw new Error('2400만 화소 이하 사진을 선택해 주세요.')
  const ratio = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) }
}
export async function preparePcPhoto(file) {
  const bitmap = await createImageBitmap(file)
  try {
    const size = imageDimensions(bitmap.width, bitmap.height)
    if (size.width === bitmap.width && size.height === bitmap.height && file.size <= 1500000) return file
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.fillStyle = '#fff'
    context.fillRect(0, 0, size.width, size.height)
    context.drawImage(bitmap, 0, 0, size.width, size.height)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    return blob && blob.size < file.size ? new File([blob], 'pc-specs.jpg', { type: 'image/jpeg' }) : file
  } finally {
    bitmap.close()
  }
}
export function pendingGames(games, results) {
  return games.filter(game => {
    const result = results[game.appId]
    return (
      result?.explanationStatus !== 'READY' ||
      ['FHD', 'QHD', '4K'].some(name => {
        const matches = result.resolutions?.filter(item => item.name === name) ?? []
        return matches.length !== 1 || matches[0].target?.method !== 'AI_TARGET_BAND_V1'
      })
    )
  })
}
