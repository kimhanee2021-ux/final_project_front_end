// 사용자가 입력한 PC 사양을 다루는 순수 함수들. 화면은 이 결과만 받아서 그린다.

export const SPEC_FIELDS = [
  { key: 'cpu', hardwareId: 'cpu', label: 'CPU', placeholder: '예: AMD Ryzen 5 5600X' },
  { key: 'gpu', hardwareId: 'gpu', label: 'GPU', placeholder: '예: NVIDIA GeForce RTX 3060' },
  { key: 'ram', hardwareId: 'ram', label: 'RAM', placeholder: '예: 16 GB' },
  { key: 'storage', hardwareId: 'drive', label: '저장장치', placeholder: '예: Samsung SSD 970 EVO 512GB' },
]

export const EMPTY_SPECS = { cpu: '', gpu: '', ram: '', storage: '' }

// 윈도우 PowerShell에서 실행하면 CPU/GPU/RAM/저장장치를 JSON 한 줄로 출력하는 명령어.
// 브라우저는 내 PC 부품을 읽을 수 없어서, 이 결과를 복사해 붙여넣는 방식으로 받는다.
export const SPEC_COMMAND =
  '$c=Get-CimInstance Win32_Processor|select -First 1;$g=Get-CimInstance Win32_VideoController|select -First 1;' +
  '$m=[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB);' +
  '$d=(Get-CimInstance Win32_DiskDrive|%{"$($_.Model) $([math]::Round($_.Size/1GB))GB"}) -join ", ";' +
  '[pscustomobject]@{cpu=$c.Name.Trim();gpu=$g.Name;ram="$m GB";storage=$d}|ConvertTo-Json -Compress'

// 명령어 실행 결과(JSON 글자)를 사양 객체로 바꾼다. 형식이 맞지 않으면 사용자에게 보여줄 안내 문구로 Error를 던진다.
export function parseSpecOutput(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('명령어 결과(중괄호 { } 로 된 한 줄)를 그대로 붙여넣어 주세요.')
  let parsed
  try {
    parsed = JSON.parse(text.slice(start, end + 1))
  } catch {
    throw new Error('결과를 읽지 못했어요. 명령어 출력 전체를 한 줄 그대로 붙여넣어 주세요.')
  }
  const specs = Object.fromEntries(SPEC_FIELDS.map(({ key }) => [key, String(parsed[key] ?? '').trim()]))
  if (!Object.values(specs).some(Boolean)) throw new Error('결과에서 부품 정보를 찾지 못했어요.')
  return specs
}

// 입력한 사양이 하나라도 있으면 true
export const hasSpecs = specs => Object.values(specs).some(value => value.trim() !== '')

// 예시 부품 목록(mock)에 사용자가 입력한 모델명을 덮어쓴다. 입력하지 않은 부품은 예시 그대로 둔다.
// 입력한 부품은 세부 사양(facts)을 알 수 없어서 비우고 custom 표시를 단다.
export function mergeHardware(hardware, specs) {
  return hardware.map(item => {
    const field = SPEC_FIELDS.find(spec => spec.hardwareId === item.id)
    const model = specs[field.key]?.trim()
    return model ? { ...item, model, facts: [], custom: true } : item
  })
}
