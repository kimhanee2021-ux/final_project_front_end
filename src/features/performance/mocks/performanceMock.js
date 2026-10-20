// UI demonstration only. These values are not measurements or real benchmarks.
export const performanceSummary = {
  score: 84,
  grade: 'A',
  label: '좋음',
  title: '고성능 게이밍 PC',
}

export const hardware = [
  {
    id: 'cpu',
    name: 'CPU',
    model: 'AMD Ryzen 5 5600X',
    usage: 72,
    score: 82,
    color: 'blue',
    facts: [
      ['cpu', '6 코어 12 스레드'],
      ['clock', '3.7 GHz'],
    ],
    detail: '프로세서',
    recommendation: '예시 구성에서 대부분의 게임을 쾌적하게 즐길 수 있는 CPU입니다.',
  },
  {
    id: 'gpu',
    name: 'GPU',
    model: 'NVIDIA GeForce RTX 3060',
    usage: 78,
    score: 88,
    color: 'mint',
    facts: [
      ['gpu', '12 GB GDDR6'],
    ],
    detail: '그래픽 카드',
    recommendation: 'QHD 이상에서는 게임별 그래픽 설정을 조절해 보세요.',
  },
  {
    id: 'ram',
    name: 'RAM',
    model: '16 GB DDR4',
    usage: 62,
    score: 76,
    color: 'blue',
    facts: [
      ['ram', '16 GB (8 GB × 2)'],
      ['clock', '3200 MHz'],
    ],
    detail: '메모리',
    recommendation: '게임과 여러 앱을 동시에 사용하는 환경이라면 메모리 여유를 확인해 보세요.',
  },
  {
    id: 'drive',
    name: '저장장치',
    model: 'Samsung SSD 970 EVO',
    usage: 45,
    score: 70,
    color: 'purple',
    facts: [
      ['drive', '512 GB (SSD)'],
      ['folder', '잔여 공간 282 GB'],
    ],
    detail: '저장장치',
    recommendation:
      '512 GB 중 230 GB를 사용 중인 예시입니다. 큰 게임을 설치하기 전에 여유 공간을 확인하세요.',
  },
]
