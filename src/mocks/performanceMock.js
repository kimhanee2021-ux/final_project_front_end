// UI demonstration only. These values are not measurements or real benchmarks.
export const performanceSummary = {
  score: 84,
  grade: 'A',
  label: '좋음',
  title: '고성능 게이밍 PC',
}

export const hardware = [
  { id: 'cpu', name: 'CPU', model: 'AMD Ryzen 5 5600X', usage: 72, score: 82, color: 'blue', facts: [['cpu', '6 코어 12 스레드'], ['clock', '3.7 GHz']], detail: '프로세서', recommendation: '예시 구성에서 대부분의 게임을 쾌적하게 즐길 수 있는 CPU입니다.' },
  { id: 'gpu', name: 'GPU', model: 'NVIDIA GeForce RTX 3060', usage: 78, score: 88, color: 'mint', facts: [['gpu', '12 GB GDDR6'], ['check', '드라이버 최신 버전']], detail: '그래픽 카드', recommendation: 'QHD 이상에서는 게임별 그래픽 설정을 조절해 보세요.' },
  { id: 'ram', name: 'RAM', model: '16 GB DDR4', usage: 62, score: 76, color: 'blue', facts: [['ram', '16 GB (8 GB × 2)'], ['clock', '3200 MHz']], detail: '메모리', recommendation: '게임과 여러 앱을 동시에 사용하는 환경이라면 메모리 여유를 확인해 보세요.' },
  { id: 'drive', name: '저장장치', model: 'Samsung SSD 970 EVO', usage: 45, score: 70, color: 'purple', facts: [['drive', '512 GB (SSD)'], ['folder', '잔여 공간 282 GB']], detail: '저장장치', recommendation: '512 GB 중 230 GB를 사용 중인 예시입니다. 큰 게임을 설치하기 전에 여유 공간을 확인하세요.' },
]

export const resolutions = [{ id: 'fhd', label: 'FHD', pixels: '1080p' }, { id: 'qhd', label: 'QHD', pixels: '1440p' }, { id: 'uhd', label: '4K', pixels: '2160p' }]
export const performanceGames = [
  { id: 'elden', name: 'Elden Ring', image: '/images/elden-ring.jpg', fps: { fhd: 60, qhd: 58, uhd: 42 }, note: '기본 프레임 제한을 고려한 예시입니다.' },
  { id: 'baldur', name: 'Baldur’s Gate 3', image: '/images/baldurs-gate.jpg', fps: { fhd: 132, qhd: 87, uhd: 51 } },
  { id: 'wukong', name: 'Black Myth: Wukong', image: '/images/wukong.jpg', fps: { fhd: 118, qhd: 76, uhd: 42 } },
  { id: 'zelda', name: 'The Legend of Zelda: Tears of the Kingdom', image: '/images/zelda.jpg', fps: null, note: '이 목록의 Nintendo Switch 게임은 PC FPS 평가에서 제외합니다.' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', image: '/images/cyberpunk.jpg', fps: { fhd: 92, qhd: 58, uhd: 32 } },
  { id: 'forza', name: 'Forza Horizon 5', image: '/images/forza.jpg', fps: { fhd: 104, qhd: 65, uhd: 37 } },
  { id: 'hades', name: 'Hades II', image: '/images/hades.jpg', fps: { fhd: 165, qhd: 144, uhd: 98 } },
  { id: 'dave', name: 'Dave the Diver', image: '/images/dave.jpg', fps: { fhd: 144, qhd: 120, uhd: 90 } },
]

export const upgrades = [
  { id: 'gpu', title: '그래픽 카드 업그레이드', description: '더 높은 해상도에서 부드러운 게임 플레이가 가능합니다.', heading: '더 선명한 세계, 더 부드러운 플레이', body: 'QHD·4K 게임을 자주 즐기는 상황을 가정한 업그레이드 예시입니다. 현재 그래픽 카드로도 충분하다면 게임 내 그림자와 효과 옵션부터 조절해 보세요.', tips: ['목표 해상도와 원하는 FPS를 먼저 정해보세요.', '그래픽 카드 교체 전 전원 공급 장치와 케이스 공간을 확인하세요.', '이 제안은 예시 사양에 대한 안내이며 실제 성능 향상을 보장하지 않습니다.'] },
  { id: 'ram', title: 'RAM 용량 늘리기', description: '16 GB → 32 GB로 여유로운 멀티태스킹을 경험해보세요.', heading: '게임과 여러 앱을 여유롭게', body: '게임과 브라우저, 스트리밍 앱을 함께 실행하는 사용 패턴을 가정한 예시입니다. 먼저 사용하지 않는 앱을 닫아 메모리 여유가 충분한지 확인해 보세요.', tips: ['예시 구성: DDR4 16 GB (8 GB × 2), 3200 MHz', '추가 메모리의 규격과 메인보드 지원 여부를 확인하세요.', '32 GB는 제안 예시이며 모든 게임에 필요한 조건은 아닙니다.'] },
  { id: 'drive', title: '저장 공간 정리하기', description: '즐기지 않는 게임을 정리하고 새로운 모험을 준비하세요.', heading: '새로운 게임을 위한 여유 공간', body: '예시 PC에는 282 GB의 여유 공간이 있습니다. 설치 용량이 큰 게임을 준비한다면 오래 플레이하지 않은 게임부터 살펴보세요.', tips: ['설치된 게임 목록을 용량 순으로 정리해 보세요.', '삭제 전 저장 데이터의 백업 상태를 확인하세요.', '이 화면은 실제 파일을 확인하거나 삭제하지 않습니다.'] },
]

export const systemMetrics = [
  { id: 'cpu-temp', icon: 'thermometer', label: 'CPU 온도', value: '54°C', state: '정상', color: 'mint' },
  { id: 'gpu-temp', icon: 'thermometer', label: 'GPU 온도', value: '62°C', state: '정상', color: 'gold' },
  { id: 'usage', icon: 'activity', label: '평균 사용률', value: '48%', state: '낮음', color: 'blue' },
  { id: 'storage', icon: 'drive', label: '저장 공간', value: '55%', state: '282 GB 남음', color: 'purple' },
]

export const diagnosticSteps = ['CPU 구성 확인', '그래픽 성능 확인', '메모리 상태 확인', '저장 공간 확인', '게임별 결과 정리']

export function getPerformanceRating(fps) {
  if (fps == null) return { label: '대상 제외', tone: 'muted' }
  if (fps >= 60) return { label: '원활', tone: 'mint' }
  if (fps >= 30) return { label: '보통', tone: 'gold' }
  return { label: '설정 조절', tone: 'coral' }
}
