import { useState } from 'react'
import { FilterChips, Panel } from '@/shared/ui'
import { tagLabel } from '@/shared/utils/gameTags'
import { ALL_TAG, LIST_END, TAG_PICK_COUNT, TOP_COUNT } from '../model/recommendLayout'
import RecommendCard from './cards/RecommendCard'

// 추천 카드 격자 (3열, 좁으면 2열·1열)
const GRID3 = 'list-none m-0 p-0 grid grid-cols-3 gap-[28px_20px] max-[760px]:grid-cols-2 max-[420px]:grid-cols-1'

// 더 많은 추천: 제목 옆 태그로 고른다. #전체는 4~12위, 장르 태그는 그 장르 추천을 태그 안 1~12위로 다시 매긴다(TOP 3 게임도 포함).
export default function MoreRecommends({ cards, tags, loading }) {
  const [picked, setPicked] = useState(ALL_TAG)
  // 다시 받은 추천에 고른 태그가 없으면 #전체로 돌아간다
  const tag = tags.includes(picked) ? picked : ALL_TAG
  const list =
    tag === ALL_TAG
      ? cards.slice(TOP_COUNT, LIST_END)
      : cards.filter(card => card.game.genres.includes(tag)).slice(0, TAG_PICK_COUNT)
  const options = [ALL_TAG, ...tags].map(item => ({ key: item, label: item === ALL_TAG ? '#전체' : `#${tagLabel(item)}` }))
  return (
    <Panel className="!p-[24px] min-w-0">
      <div className="flex items-center justify-between gap-[12px] mb-[20px] max-[760px]:flex-col max-[760px]:items-start">
        <h2 className="shrink-0 text-[16px] font-[700]">
          {tag === ALL_TAG
            ? `더 많은 추천 · ${TOP_COUNT + 1}~${TOP_COUNT + list.length}위`
            : `#${tagLabel(tag)} 잘 맞는 게임 · 1~${list.length}위`}
        </h2>
        <FilterChips label="추천 태그" options={options} activeKey={tag} onSelect={setPicked} className="max-w-full" />
      </div>
      <ul className={`${GRID3} transition-opacity ${loading ? 'opacity-50' : ''}`}>
        {list.map((card, index) => (
          <li key={card.game.appId} className="min-w-0">
            <RecommendCard {...card} rank={tag === ALL_TAG ? card.game.rank : index + 1} />
          </li>
        ))}
      </ul>
      <p className="mt-[24px] text-[12px] text-faint leading-[1.7]">
        추천은 내가 플레이한 게임을 바탕으로 한 AI 예측이에요. 잘 맞는 정도는 이번 추천 목록 안의 순위로 나눴어요.
      </p>
    </Panel>
  )
}
