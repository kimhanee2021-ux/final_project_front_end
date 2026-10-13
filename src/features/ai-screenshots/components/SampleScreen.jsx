import { useState } from 'react';
export default function SampleScreen({
  sample
}) {
  const [failed, setFailed] = useState(false);
  if (!sample.image) return <div className="shot-text-example"><strong>오류 문구 예시</strong><p>{sample.game} · {sample.title}</p><small>실제 오류 스크린샷은 아직 수집되지 않았습니다. 이 예시는 문구와 해석만 확인합니다.</small></div>;
  return <figure className="shot-real-image">
    {failed ? <p role="alert">이미지를 불러오지 못했습니다. 출처에서 원본을 확인해주세요.</p> : <img src={sample.image} alt={`${sample.game} 실제 ${sample.type === 'error' ? '오류 화면' : '게임 스크린샷'} · ${sample.title}`} onError={() => setFailed(true)} />}
    <figcaption>실제 {sample.type === 'error' ? '오류 화면' : '게임 스크린샷'} · <a href={sample.sourceUrl} target="_blank" rel="noreferrer">{sample.platform || 'Steam'} 원본 출처 ↗</a></figcaption>
  </figure>;
}
