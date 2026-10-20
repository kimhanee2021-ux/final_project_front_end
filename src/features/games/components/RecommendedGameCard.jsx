import GameCard from './GameCard'

// AI 추천 한 칸: 게임 카드 + 'AI가 왜 추천했는지' 적을 칸.
// 추천 이유는 아직 AI 연동이 없어서 비워 두고, 나중에 reason 값을 넘기면 그 자리에 표시된다.
export default function RecommendedGameCard({ game, reason }) {
  return (
    <div className="flex flex-col gap-[12px] min-w-0">
      <GameCard game={game} />
      <div className="flex-1 p-[16px] rounded-[16px] bg-bg min-h-[88px]">
        <p className="text-[12px] font-[650] text-primary-text">AI 추천 이유</p>
        <p className="mt-[6px] text-[13px] leading-[1.6] text-muted">{reason ?? <span className="text-faint">추천 이유가 여기에 표시됩니다.</span>}</p>
      </div>
    </div>
  )
}
