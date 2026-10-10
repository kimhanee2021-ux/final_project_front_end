export default function PageHeading({ title, description }) {
  return (
    <div className="gs-section-heading gs-subpage-heading">
      <div>
        <span className="gs-eyebrow">YOUR WORLD OF GAMES</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}
