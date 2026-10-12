// size="large"는 GameDetailDialog에서 쓴다. 이전엔 ".dialog-content .game-art" 같은
// CSS 컨텍스트 선택자로 크기를 바꿨는데, prop으로 직접 받는 쪽이 더 명확하다.
export default function GameIdentity({ game, size = 'default' }) {
  const large = size === 'large'
  return (
    <div className="flex items-center gap-[11px]">
      <div className={`game-art art-${game.art} ${large ? 'w-[55px]! h-[65px]! text-[18px]!' : 'max-[580px]:w-[40px]! max-[580px]:h-[47px]!'}`} aria-hidden="true">
        <span>{game.initials}</span>
      </div>
      <div>
        <strong className={`font-[650] block ${large ? 'text-[19px]' : 'text-[12px] max-[580px]:text-[13px]'}`}>{game.name}</strong>
        <small className="text-[9px] text-muted block mt-[3px]">
          {game.genre} <span className="px-[4px]">·</span> {game.platform}
        </small>
      </div>
    </div>
  )
}
