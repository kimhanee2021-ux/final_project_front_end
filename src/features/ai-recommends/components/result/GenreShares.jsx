import { GSIcon } from '@/shared/ui'
import { tagLabel } from '@/shared/utils/gameTags'
import { genreShares } from '../../model/recommendation'

// 취향 장르 비중: 추천 게임 중 그 장르가 차지하는 비율을 가로 막대로 보여준다.
// 오른쪽 "AI가 참고한 게임"과 같은 카드 모양으로 따로 묶는다.
export default function GenreShares({ games, genres }) {
  return (
    <section className="max-w-[560px] rounded-[20px] bg-surface p-[24px]" aria-label="내 취향 장르 비중">
      <p className="flex items-center gap-[8px] text-[15px] font-[700]">
        <GSIcon name="chart" size={17} className="text-primary-text" />
        취향 장르 비중
      </p>
      <p className="mt-[4px] mb-[18px] text-[13px] text-muted">AI가 추천한 게임 {games.length}개 중 이 장르가 들어 있는 비율이에요</p>
      <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
        {genreShares(games, genres).map(({ genre, share }) => (
          <li key={genre} className="grid grid-cols-[88px_minmax(0,1fr)_44px] items-center gap-[12px]">
            <span className="text-[14px] font-[700] text-primary-text truncate">#{tagLabel(genre)}</span>
            <span className="h-[8px] rounded-full bg-bg overflow-hidden" aria-hidden="true">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
            </span>
            <span className="text-[14px] font-[700] text-right tabular-nums">{share}%</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
