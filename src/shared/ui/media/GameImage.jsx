import { useState } from 'react'
import GSIcon from '../icons/GSIcon'

// 게임 이미지. 주소가 없거나 불러오지 못하면(깨진 이미지) 게임 아이콘으로 바꿔 보여준다.
// 크기·모양은 className으로 그대로 받고, fallback을 주면 아이콘 대신 그 내용을 보여준다(예: 이니셜).
export default function GameImage({ src, className = '', alt = '', fallback, iconSize = 22, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null)
  if (src && failedSrc !== src) {
    return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} {...rest} />
  }
  if (fallback !== undefined) return fallback
  return (
    <span className={`${className} bg-surface-soft text-muted`} style={{ display: 'grid', placeItems: 'center' }} aria-hidden="true">
      <GSIcon name="gamepad" size={iconSize} />
    </span>
  )
}
