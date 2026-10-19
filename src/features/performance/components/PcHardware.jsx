import GSIcon from '../../../components/common/GSIcon'
import { showValue } from '../model/pcDiagnosis'
export default function PcHardware({specs}){
 const items=[['CPU','프로세서','cpu','blue',['모델명','코어 · 스레드'],[specs?.cpuModel,specs?.cpuDetails]],['GPU','그래픽 카드','gpu','mint',['모델명','그래픽 메모리'],[specs?.gpuModel,specs?.gpuMemory]],['RAM','메모리','ram','purple',['총용량','속도'],[showValue(specs?.ramGB,' GB'),specs?.ramSpeed]],['SSD','저장공간','drive','gold',['총 저장공간','남은 공간'],[showValue(specs?.storageTotalGB,' GB'),showValue(specs?.storageFreeGB,' GB')]]]
 return <section className="pc-spec-strip" aria-label="내 PC 하드웨어">{items.map(([label,name,icon,tone,fields,values])=><article key={label} className={`pc-spec-item pc-${tone}`}><div className="pc-spec-heading"><span className="pc-spec-icon"><GSIcon name={icon} size={24}/></span><div><h2>{label}</h2><span>{name}</span></div><span className="pc-spec-pending">{specs?'사용자 확인':'수집 전'}</span></div><dl className="pc-spec-facts">{fields.map((field,i)=><div key={field}><dt>{field}</dt><dd>{showValue(values[i])}</dd></div>)}</dl></article>)}</section>
}
