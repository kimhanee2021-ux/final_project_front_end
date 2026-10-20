// 일반 규격 확인 자료이며 개별 PC 장착 인증이나 FPS 보장이 아니다.
export const pcUpgradeSources = [
  {
    category: 'CPU',
    title: 'Intel 노트북 프로세서 업그레이드 안내',
    url: 'https://www.intel.com/content/www/us/en/support/articles/000088013/processors.html',
    checkedAt: '2026-10-20',
    scope: '노트북 CPU 교체 제약과 제조사 확인 필요. 개별 AMD/Intel 노트북 모델 호환 인증 아님',
  },
  {
    category: 'GPU',
    title: 'NVIDIA 노트북 GPU 공식 비교',
    url: 'https://www.nvidia.com/en-us/geforce/laptops/compare/',
    checkedAt: '2026-10-20',
    scope: '노트북 GPU별 전력 범위와 사양. 같은 이름이라도 노트북 전력/냉각 조건 확인 필요. 개인 PC FPS 측정 아님',
  },
  {
    category: 'RAM',
    title: 'Crucial 메모리 설치 안내',
    url: 'https://www.crucial.com/content/dam/crucial/dram-products/dram-family/documents/installation-guides/crucial-dram-install-guide-en.pdf',
    checkedAt: '2026-10-20',
    scope: 'UDIMM/SODIMM 설치 규격 확인. 슬롯·온보드·최대 용량은 정확한 기기 서비스 설명서 필요',
  },
  {
    category: 'SSD',
    title: 'Samsung 990 EVO Plus 공식 규격 안내',
    url: 'https://news.samsung.com/us/samsung-launches-990-evo-plus-ssd-with-improved-performance-speeds-supported-by-pcie-4-0/',
    checkedAt: '2026-10-20',
    scope: 'M.2 2280 제품 규격. 사용자 PC에 NVMe 슬롯/추가 공간이 있다는 뜻 아님',
  },
]
