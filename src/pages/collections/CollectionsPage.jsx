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
      <div className="gs-collections-grid">
        {collections.map(collection => (
          <Link
            className="gs-collection"
            key={collection.genre}
            to={`/explore?genre=${collection.genre}`}
          >
            <img src={discoverGames.find(game => game.id === collection.game).image} alt="" />
            <div>
              <span className="gs-collection-count">
                {discoverGames.filter(game => game.genres.includes(collection.genre)).length} GAMES
              </span>
              <h2>{collection.title}</h2>
              <p>{collection.subtitle}</p>
              <span className="gs-round-button">
                <GSIcon name="arrow" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="gs-inline-note">
        장르별로 구성한 데모 컬렉션입니다. 컬렉션을 선택하면 해당 장르의 게임을 볼 수 있습니다.
      </p>
    </>
  )
}
