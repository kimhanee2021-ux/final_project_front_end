import PcUpgradePanel from './PcUpgradePanel'
import { GSIcon } from '@/shared/ui'
import { showValue } from '../model/pcDiagnosis'
export default function PcHardware({specs,result,partOffers,partsLoading}){
 const items=[['CPU','프로세서','cpu','blue',['모델명','코어 · 스레드'],[specs?.cpuModel,specs?.cpuDetails]],['GPU','그래픽 카드','gpu','mint',['분석 기준 GPU','그래픽 메모리'],[specs?.gpuModel,specs?.gpuMemory]],['RAM','메모리','ram','purple',['총용량','속도'],[showValue(specs?.ramGB,' GB'),specs?.ramSpeed]],['SSD','저장공간','drive','gold',['총 저장공간','남은 공간'],[showValue(specs?.storageTotalGB,' GB'),showValue(specs?.storageFreeGB,' GB')]]]
 return <section className="pcd-spec-strip" aria-label="내 PC 하드웨어">{items.map(([label,name,icon,tone,fields,values])=><details key={label} className={`pcd-spec-item pcd-hardware-detail pcd-${tone}`}><summary aria-label={`${label} 사양 및 AI 개선 방향`}><div className="pcd-spec-heading"><span className="pcd-spec-icon"><GSIcon name={icon} size={24}/></span><div><h2>{label}</h2><span>{name}</span></div><span className="pcd-spec-pending">{specs?'사용자 확인':'수집 전'}</span></div><dl className="pcd-spec-facts">{fields.map((field,i)=><div key={field}><dt>{field}</dt><dd>{showValue(values[i])}</dd></div>)}</dl></summary><PcUpgradePanel result={result} category={label} specs={specs} partOffers={partOffers} partsLoading={partsLoading}/></details>)}</section>
}
