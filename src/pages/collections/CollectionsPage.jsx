import { Link } from 'react-router-dom'
import { discoverGames } from '../../features/games/mocks/discoverMock'
import GSIcon from '../../components/common/GSIcon'
import PageHeading from '../../components/common/PageHeading'

export default function CollectionsPage() {
  const collections = [
    { title: 'Epic Adventures', subtitle: '끝없이 펼쳐지는 세계', genre: 'RPG', game: 'elden' },
    {
      title: 'One More Round',
      subtitle: '한 판만 더, 멈출 수 없는 즐거움',
      genre: 'Action',
      game: 'hades',
    },
    {
      title: 'Slow & Cozy',
      subtitle: '나만의 속도로 쉬어가는 시간',
      genre: 'Simulation',
      game: 'dave',
    },
  ]
  return (
    <>
      <PageHeading title="Your Collections" description="그날의 기분에 맞는 게임을 발견해보세요." />
      <div className="grid grid-cols-3 gap-[20px] max-[1120px]:gap-[13px] max-[600px]:grid-cols-1">
        {collections.map(collection => (
          <Link
            className="group min-h-[340px] relative rounded-[14px] overflow-hidden border border-gs-border flex items-end text-white max-[600px]:min-h-[300px] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(0deg,#061015,#06101544_65%,#06101522)]"
            key={collection.genre}
            to={`/explore?genre=${collection.genre}`}
          >
            <img
              className="absolute w-full h-full object-cover inset-0 transition-transform duration-[400ms] group-hover:scale-[1.045]"
              src={discoverGames.find(game => game.id === collection.game).image}
              alt=""
            />
            <div className="relative z-[1] p-[27px] w-full max-[1120px]:p-[18px]">
              <span className="text-[#8cf4d4] text-[9px] tracking-[2px]">
                {discoverGames.filter(game => game.genres.includes(collection.genre)).length} GAMES
              </span>
              <h2 className="m-[8px_0] text-[26px] tracking-[-0.7px] max-[1120px]:text-[21px] max-[600px]:text-[27px]">{collection.title}</h2>
              <p className="text-[#c5d0d6] text-[12px] max-[1120px]:text-[10px]">{collection.subtitle}</p>
              <span className="shrink-0 grid place-items-center w-[29px] h-[29px] border border-gs-border rounded-full bg-gs-raised hover:bg-gs-hover hover:text-gs-mint absolute right-[20px] top-[27px] bg-[#2c404b99] max-[1120px]:top-[18px] max-[1120px]:right-[15px]">
                <GSIcon name="arrow" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="flex items-center gap-[12px] text-gs-muted text-[11px] p-[18px_0] leading-[1.8] [&>svg]:shrink-0 [&>svg]:text-[#aa87ef]">
        장르별로 구성한 데모 컬렉션입니다. 컬렉션을 선택하면 해당 장르의 게임을 볼 수 있습니다.
      </p>
    </>
  )
}
