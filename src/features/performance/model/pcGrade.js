export const gradeBands=[{grade:'A',min:120,label:'120 FPS 이상'},{grade:'B',min:60,label:'60~119 FPS'},{grade:'C',min:30,label:'30~59 FPS'},{grade:'D',min:20,label:'20~29 FPS'},{grade:'E',min:0,label:'20 FPS 미만'}]
export function gradeForFps(fps){return typeof fps==='number'&&Number.isFinite(fps)&&fps>=0?gradeBands.find(b=>fps>=b.min).grade:null}
export function gamePerformanceGrade(result){
 if(result?.explanationStatus!=='READY')return null
 const fps=result.resolutions?.find(r=>r.name==='FHD')?.fps
 const p=fps?.projection
 if(fps?.status!=='REFERENCE_PROJECTION'||p?.method!=='SAME_CPU_GPU_REFERENCE_V1'||!/(?:^|\s)high(?:\s|$)/i.test(p.preset??'')||!Number.isFinite(p.averageFps)||p.averageFps<=0)return null
 return {grade:gradeForFps(p.averageFps),fps:p.averageFps}
}
export function overallPerformanceGrade(results){
 const all=Object.values(results??{}),values=all.map(gamePerformanceGrade).filter(Boolean).map(r=>r.fps).sort((a,b)=>a-b)
 if(!values.length)return {grade:null,count:0,total:all.length}
 const i=Math.floor(values.length/2),median=values.length%2?values[i]:(values[i-1]+values[i])/2
 return {grade:gradeForFps(median),fps:median,count:values.length,total:all.length}
}
