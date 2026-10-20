import { Link } from 'react-router-dom'
import { discoverGames } from '@/features/games'
import { GSIcon, PanelPage } from '@/shared/ui'

const collections = [
  { id: 'epic', title: 'Epic Adventures', subtitle: '끝없이 펼쳐지는 세계', genre: 'RPG', game: 'elden' },
  { id: 'round', title: 'One More Round', subtitle: '한 판만 더, 멈출 수 없는 즐거움', genre: 'Action', game: 'hades' },
  { id: 'cozy', title: 'Slow & Cozy', subtitle: '나만의 속도로 쉬어가는 시간', genre: 'Simulation', game: 'dave' },
]

// 컬렉션: 컬렉션 하나가 패널 하나. 커버 이미지를 가득 채우고 제목과 한 줄 설명만 얹는다.
export default function CollectionsPage() {
  return (
    <PanelPage>
      {collections.map(collection => {
        const count = discoverGames.filter(game => game.genres.includes(collection.genre)).length
        return (
          <section
            key={collection.id}
            id={collection.id}
            className="scroll-mt-[92px] relative min-h-[360px] flex items-end text-white overflow-hidden rounded-[24px] shadow-[var(--shadow)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(0deg,#061015ee,#06101555_55%,transparent)]"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={discoverGames.find(game => game.id === collection.game).image}
              alt=""
            />
            <div className="relative z-[1] w-full p-[32px] max-[600px]:p-[20px]">
              <p className="text-[14px] text-white/70">컬렉션 · 게임 {count}개</p>
              <h2 className="mt-[8px] mb-[8px] text-[clamp(34px,6vw,64px)] font-[750] tracking-[-2px] leading-[1.15]">{collection.title}</h2>
              <p className="text-white/80 text-[18px]">{collection.subtitle}</p>
              <Link
                to={`/explore?genre=${collection.genre}`}
                className="mt-[28px] inline-flex items-center gap-[10px] h-[46px] px-[24px] rounded-full bg-white text-[#17181F] text-[15px] font-[700] hover:opacity-90"
              >
                {collection.genre} 게임 보기
                <GSIcon name="arrow" size={17} />
              </Link>
            </div>
          </section>
        )
      })}
    </PanelPage>
  )
}
