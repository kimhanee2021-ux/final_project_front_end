export default function PageHeading({ title, description }) {
  return (
    <div className="flex items-start justify-between gap-[16px] mb-[30px] pt-[26px] max-[600px]:pt-[22px]">
      <div>
        <span className="text-gs-mint text-[9px] tracking-[2px] font-[650] max-[600px]:text-[8px]">YOUR WORLD OF GAMES</span>
        <h1 className="text-[32px] tracking-[-0.8px] my-[8px] max-[600px]:text-[27px]">{title}</h1>
        <p className="text-gs-muted text-[11px] mt-[4px]">{description}</p>
      </div>
    </div>
  )
}
