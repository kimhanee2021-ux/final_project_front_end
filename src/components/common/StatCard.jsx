import GSIcon from './GSIcon'

// 색상은 var() 토큰을 그대로 참조해서 다크모드가 자동으로 반영된다.
const tones = {
  purple: 'bg-primary-soft text-primary-text',
  peach: 'bg-peach-bg text-peach-text',
  mint: 'bg-mint-bg text-mint-text',
}

export default function StatCard({ label, value, icon, tone, note, tag }) {
  return (
    <section className="bg-surface border border-border rounded-[15px] py-[22px] px-[25px] shadow-[var(--shadow)] min-[1600px]:p-[27px] max-[1000px]:p-[18px] max-[760px]:p-[16px]">
      <div className="flex justify-between items-center">
        <span className={`h-[37px] w-[37px] rounded-[11px] grid place-items-center ${tones[tone] ?? ''}`}>
          <GSIcon name={icon} size={21} />
        </span>
        <span className="text-[9px] tracking-[1.3px] text-muted max-[1000px]:hidden">{tag}</span>
      </div>
      <p className="text-subtle mt-[18px] text-[12px] max-[760px]:text-[11px]">{label}</p>
      <strong className="block mt-[4px] mb-[13px] text-[clamp(25px,2.4vw,34px)] tracking-[-1px] tabular-nums leading-[1.25] max-[760px]:text-[24px]">{value}</strong>
      <p className="text-muted text-[10px] max-[1000px]:min-h-[30px] max-[760px]:text-[9px]">{note}</p>
    </section>
  )
}
