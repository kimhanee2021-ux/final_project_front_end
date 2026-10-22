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
  // 그래픽 장치는 여러 개일 수 있다(내장 GPU, 외장 카드, 원격·가상 디스플레이). 실제 PCI 장치 중 메모리가 가장 큰 것(외장 카드)을 고르고,
  // PCI 장치가 하나도 없으면(가상 머신 등) 첫 번째 장치를 쓴다.
  '$c=Get-CimInstance Win32_Processor|select -First 1;' +
  "$v=Get-CimInstance Win32_VideoController;$g=$v|?{$_.PNPDeviceID -like 'PCI*'}|sort {[uint64]$_.AdapterRAM} -Descending|select -First 1;if(-not $g){$g=$v|select -First 1};" +
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

// 사진에서 읽은 사양(cpuModel, gpuModel, ramGB, storageTotalGB …)을 사양 입력 칸 형식으로 바꾼다. 읽지 못한 값은 빈 글자로 둔다.
export function specsFromPhoto({ cpuModel, gpuModel, ramGB, storageTotalGB }) {
  return {
    cpu: cpuModel ?? '',
    gpu: gpuModel ?? '',
    ram: ramGB ? `${ramGB} GB` : '',
    storage: storageTotalGB ? `${storageTotalGB} GB` : '',
  }
}

// 입력한 사양이 하나라도 있으면 true. 사양 칸(SPEC_FIELDS)만 본다.
export const hasSpecs = specs => SPEC_FIELDS.some(({ key }) => (specs[key] ?? '').trim() !== '')

// "512GB", "1 TB, 500GB"처럼 단위가 붙은 용량 글자를 GB 합계로 바꾼다. 단위가 없으면 null.
function capacityGB(text) {
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)/gi)]
  if (!matches.length) return null
  return matches.reduce((sum, [, amount, unit]) => sum + Number(amount) * (unit.toUpperCase() === 'TB' ? 1000 : 1), 0)
}

// "16 GB" 같은 글자에서 첫 숫자만 꺼낸다. 없으면 null.
function firstNumber(text) {
  const match = text.match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

// 입력 창에서 저장한 사양을 PC 성능 진단(AI 분석)이 받는 형식으로 바꾼다.
// 사진으로 읽은 상세 값(detail)은 사용자가 칸을 고치지 않았을 때만 그대로 쓰고, 고쳤다면 칸의 값으로 다시 만든다.
export function toDiagnosisSpecs(specs, detail) {
  if (detail) {
    const fromPhoto = specsFromPhoto(detail)
    if (SPEC_FIELDS.every(({ key }) => fromPhoto[key] === specs[key])) return detail
  }
  return {
    cpuModel: specs.cpu,
    gpuModel: specs.gpu,
    ramGB: firstNumber(specs.ram),
    storageTotalGB: capacityGB(specs.storage),
    deviceType: 'UNKNOWN',
  }
}

// 입력한 사양을 부품 카드 목록으로 바꾼다. 입력하지 않은 부품은 model이 빈 글자다.
export function hardwareFromSpecs(specs) {
  return SPEC_FIELDS.map(field => ({
    id: field.hardwareId,
    name: field.label,
    model: (specs[field.key] ?? '').trim(),
  }))
}
