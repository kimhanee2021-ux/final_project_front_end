import { GSIcon } from '@/shared/ui'
import { confirmedSpecs } from '../../../model/pcPhoto'

const fields = [
  ['cpuModel', 'CPU 모델명'],
  ['cpuDetails', 'CPU 코어 · 스레드'],
  ['gpuModel', 'GPU 모델명'],
  ['gpuMemory', '그래픽 메모리 표시값'],
  ['ramGB', 'RAM 용량 (GB)'],
  ['ramSpeed', 'RAM 속도'],
  ['storageTotalGB', '총 저장공간 (GB)'],
  ['storageFreeGB', '남은 공간 (GB)'],
  ['os', '운영체제'],
]

// 사진에서 읽은 사양 확인·수정 폼. GPU 후보가 여럿이면 하나를 고르게 한다.
export default function SpecReviewForm({ values, setValues, warnings, gpus, signedIn, provider, consent, onApply, onError }) {
  return (
    <form
      className="pcd-spec-review"
      onSubmit={event => {
        event.preventDefault()
        try {
          onApply(confirmedSpecs(values, gpus))
        } catch (e) {
          onError(e.message)
        }
      }}
    >
      <h3>읽은 사양을 확인해 주세요</h3>
      <p>사진에 없거나 불명확한 값은 비워뒀어요. 직접 수정할 수 있어요.</p>
      {warnings.length > 0 && (
        <ul>
          {warnings.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      )}
      <label>
        기기 종류
        <select
          value={values.deviceType ?? 'UNKNOWN'}
          onChange={e => setValues(old => ({ ...old, deviceType: e.target.value }))}
        >
          <option value="UNKNOWN">확인하지 못함</option>
          <option value="DESKTOP">데스크톱</option>
          <option value="LAPTOP">노트북</option>
        </select>
      </label>
      {gpus.length > 1 && (
        <fieldset className="pcd-gpu-choice">
          <legend>게임 분석에 사용할 GPU를 하나 선택해 주세요</legend>
          {gpus.map(gpu => (
            <label key={gpu}>
              <input
                type="radio"
                name="pcd-analysis-gpu"
                checked={values.gpuModel === gpu}
                onChange={() => setValues(old => ({ ...old, gpuModel: gpu, gpuMemory: '' }))}
              />
              {gpu}
            </label>
          ))}
          <p>여러 GPU의 메모리를 합산하지 않아요. 선택한 GPU의 전용 메모리를 확인해 입력해 주세요.</p>
        </fieldset>
      )}
      {fields.map(([key, label]) => (
        <label key={key}>
          {label}
          <input
            value={values[key] ?? ''}
            type={key.endsWith('GB') ? 'number' : 'text'}
            step="any"
            min="0"
            maxLength={key === 'ramSpeed' ? 80 : 160}
            onChange={e => setValues(old => ({ ...old, [key]: e.target.value }))}
            placeholder="정보 없음"
          />
        </label>
      ))}
      <button className="gs-primary-button" type="submit" disabled={signedIn && (!provider || !consent)}>
        확인한 사양 적용하기
        <GSIcon name="check" size={17} />
      </button>
    </form>
  )
}
