import GSIcon from '../../../components/common/GSIcon'
import EmptyState from '../../../components/common/EmptyState'
export default function SpendingInsights({ insights, onExplore }) {
  return (
    <section className="p-[24px] rounded-[15px] border border-insight-border bg-insight-bg max-[1000px]:p-[20px]">
      <div className="flex items-center gap-[11px]">
        <span className="bg-primary text-surface grid place-items-center w-[37px] h-[37px] rounded-[12px] shrink-0">
          <GSIcon name="spark" size={20} />
        </span>
        <div>
          <span className="text-[8px] font-bold tracking-[1.9px] text-primary-text">SPENDING INSIGHT</span>
          <h2 className="text-[15px] tracking-[-0.4px] mt-[3px]">숫자 속에 숨은 나의 플레이</h2>
        </div>
        <span className="ml-auto border border-insight-border text-primary-text px-[7px] py-[4px] rounded-[5px] text-[9px] whitespace-nowrap max-[1200px]:hidden max-[580px]:inline">기록 기반 분석</span>
      </div>
      <div className="grid grid-cols-2 gap-[22px] mt-[23px] max-[1200px]:gap-[15px] max-[1000px]:grid-cols-1 max-[1000px]:gap-[12px]">
        {insights.length ? (
          insights.map((item, index) => (
            <div
              className={index > 0 ? 'border-l border-insight-border pl-[22px] max-[1200px]:pl-[15px] max-[1000px]:border-l-0 max-[1000px]:pl-0 max-[1000px]:border-t max-[1000px]:pt-[12px]' : ''}
              key={item.id}
            >
              <h3 className="text-[12px]">{item.title}</h3>
              <p className="text-[11px] text-subtle leading-[1.9] mt-[8px] mb-[13px] max-[1000px]:mt-[4px] max-[1000px]:mb-[5px]">{item.description}</p>
              <button className="inline-flex items-center gap-[8px] py-[4px] bg-transparent text-[10px] font-[650] text-primary-text hover:underline" onClick={() => onExplore(item)}>
                {item.action}
                <GSIcon name="arrow" size={16} />
              </button>
            </div>
          ))
        ) : (
          <EmptyState title="분석할 구매 기록이 없어요" />
        )}
      </div>
    </section>
  )
}
