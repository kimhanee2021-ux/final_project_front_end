import { gpuCandidates, preparePcPhoto } from '../model/pcHardware'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { extractPcPhoto, loadPcProvider } from '../api'
import { normalizeSpecs } from '../model/pcDiagnosis'

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
export default function SystemPhotoInput({ onApply, signedIn, allowManual = true }) {
  const [photo, setPhoto] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [values, setValues] = useState(null),
    [warnings, setWarnings] = useState([]),
    [consent, setConsent] = useState(false),
    [manual, setManual] = useState(false)
  const inputRef = useRef(null),
    controller = useRef(null),
    sequence = useRef(0)
  const [provider, setProvider] = useState(null),
    [gpus, setGpus] = useState([]),
    [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!busy) return
    const started = Date.now()
    const clock = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(clock)
  }, [busy])
  useEffect(() => {
    if (!signedIn) return
    const request = new AbortController()
    loadPcProvider(request.signal)
      .then(data => {
        if (!request.signal.aborted && ['Groq', 'Gemini', 'Gemini → Groq', 'Groq ↔ Gemini'].includes(data.provider))
          setProvider(data.provider)
      })
      .catch(() => {
        if (!request.signal.aborted)
          setError('AI 연결 정보를 확인하지 못했어요. 창을 다시 열거나 사양을 직접 입력해 주세요.')
      })
    return () => request.abort()
  }, [signedIn])
  useEffect(
    () => () => {
      sequence.current++
      controller.current?.abort()
    },
    []
  )
  useEffect(
    () => () => {
      if (photo?.url) URL.revokeObjectURL(photo.url)
    },
    [photo]
  )
  function cancel() {
    sequence.current++
    controller.current?.abort()
    setBusy(false)
  }
  function selectPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''
    cancel()
    setValues(null)
    setGpus([])
    setManual(false)
    setError('')
    setConsent(false)
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10485760) {
      setPhoto(null)
      setError('JPG·PNG·WEBP 사진을 10MB 이하로 선택해 주세요.')
      return
    }
    setPhoto({ file, name: file.name, url: URL.createObjectURL(file) })
  }
  async function readPhoto() {
    if (!photo || !consent || !signedIn || !provider) return
    cancel()
    const id = ++sequence.current
    const request = new AbortController()
    controller.current = request
    setBusy(true)
    setElapsed(0)
    setError('')
    const timer = setTimeout(() => request.abort(), 105000)
    try {
      const prepared = await preparePcPhoto(photo.file)
      if (id !== sequence.current) return
      const result = await extractPcPhoto(prepared, request.signal, provider)
      if (id === sequence.current) {
        const choices = gpuCandidates(result.specs.gpuModel)
        setGpus(choices)
        setValues({
          ...result.specs,
          deviceType: /laptop|mobile|max-q/i.test(result.specs.gpuModel) ? 'LAPTOP' : 'UNKNOWN',
          ...(choices.length > 1 ? { gpuModel: '', gpuMemory: '' } : {}),
        })
        setWarnings(result.warnings || [])
      }
    } catch (e) {
      if (id === sequence.current)
        setError(e.name === 'AbortError' ? '사진 읽기를 취소했거나 시간이 초과됐어요. 다시 시도해 주세요.' : e.message)
    } finally {
      clearTimeout(timer)
      if (id === sequence.current) setBusy(false)
    }
  }
  return (
    <div className="pcd-photo-input">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectPhoto} hidden />
      {photo ? (
        <>
          <img
            src={photo.url}
            alt="선택한 시스템 정보 사진"
            onError={() => {
              cancel()
              setError('사진을 열 수 없어요.')
              setPhoto(null)
            }}
          />
          <span className="pcd-photo-name">{photo.name}</span>
        </>
      ) : (
        <div className="pcd-photo-empty">
          <GSIcon name="image" size={34} />
          <strong>시스템 정보 사진을 넣어주세요</strong>
          <span>Windows 설정 → 시스템 → 정보</span>
        </div>
      )}
      <button className="pcd-outline-action" onClick={() => inputRef.current.click()}>
        <GSIcon name="image" size={17} />
        {photo ? '사진 변경' : '사진 선택'}
      </button>
      {allowManual && (
        <button
          className="pcd-inline-action"
          disabled={busy}
          onClick={() => {
            cancel()
            setManual(true)
            setGpus([])
            setValues({})
            setWarnings([])
            setError('')
          }}
        >
          사진 없이 사양 직접 입력하기
        </button>
      )}
      <p className="pcd-photo-formats">JPG · PNG · WEBP / 최대 10MB · 2400만 화소</p>
      {!signedIn && (
        <p className="pcd-photo-pending">
          <Link to="/login?next=%2Fpc-check">로그인</Link> 후 AI로 사양을 읽을 수 있어요.
        </p>
      )}
      {photo && signedIn && !values && (
        <>
          <p className="pcd-photo-pending">
            장치 ID·제품 ID·사용자 이름은 가리고 사양 부분만 올려주세요. 사진은 서비스 서버에 저장하지 않아요.
          </p>
          <label className="pcd-photo-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              disabled={busy || !provider}
            />
            사진과 확인한 PC 사양을{' '}
            {provider === 'Groq ↔ Gemini'
              ? '사진·큰 요청은 Gemini, 짧은 요청은 Groq에 우선 전송하고 이용 제한 시 다른 AI에도 전송해'
              : provider === 'Gemini → Groq'
                ? 'Gemini에 우선 전송하고, 제한·혼잡 시 Groq에도 전송해'
                : `${provider ?? 'AI 서비스(확인 중)'}에 전송해`}{' '}
            사양 판독과 게임 분석에 사용하는 데 동의해요.
          </label>
          <button className="gs-primary-button" disabled={!consent || busy || !provider} onClick={readPhoto}>
            {busy ? `사진에서 사양 읽는 중… ${elapsed}초` : 'AI로 사양 읽기'}
          </button>
          {busy && (
            <button className="pcd-inline-action" onClick={cancel}>
              취소
            </button>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="pcd-photo-error">
          {error}
        </p>
      )}
      {values && (
        <form
          className="pcd-spec-review"
          onSubmit={event => {
            event.preventDefault()
            try {
              const pc = normalizeSpecs(values)
              if (gpuCandidates(pc.gpuModel).length > 1) throw new Error('분석할 GPU 하나만 입력해 주세요.')
              if (gpus.length > 1 && !pc.gpuModel) throw new Error('분석에 사용할 GPU를 선택해 주세요.')
              if (!pc.cpuModel && !pc.gpuModel && !pc.ramGB)
                throw new Error('CPU·GPU·RAM 중 확인할 수 있는 사양을 입력해 주세요.')
              onApply(pc)
            } catch (e) {
              setError(e.message)
            }
          }}
        >
          <h3>{manual ? '내 PC 사양을 입력해 주세요' : '읽은 사양을 확인해 주세요'}</h3>
          <p>
            {manual
              ? 'Windows 시스템 정보에 표시된 값만 입력하고 모르는 항목은 비워두세요. 사진 판독은 건너뛰며, 적용한 사양은 게임 AI 분석에 전송돼요.'
              : '사진에 없거나 불명확한 값은 비워뒀어요. 직접 수정할 수 있어요.'}
          </p>
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
          {manual && signedIn && (
            <label className="pcd-photo-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                disabled={!provider}
              />
              확인한 PC 사양을{' '}
              {provider === 'Groq ↔ Gemini'
                ? '사진·큰 요청은 Gemini, 짧은 요청은 Groq에 우선 전송하고 이용 제한 시 다른 AI에도 전송해'
                : provider === 'Gemini → Groq'
                  ? 'Gemini에 우선 전송하고, 제한·혼잡 시 Groq에도 전송해'
                  : `${provider ?? 'AI 서비스(확인 중)'}에 전송해`}{' '}
              게임 분석에 사용하는 데 동의해요.
            </label>
          )}
          <button className="gs-primary-button" type="submit" disabled={signedIn && (!provider || !consent)}>
            확인한 사양 적용하기
            <GSIcon name="check" size={17} />
          </button>
        </form>
      )}
    </div>
  )
}
