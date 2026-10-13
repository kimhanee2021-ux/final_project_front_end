const samplePrices = new Map([[1145360, 2700000], [367520, 1650000], [1868140, 2400000], [588650, 3200000], [2379780, 1650000], [427520, 4500000], [294100, 3800000], [1030300, 2200000], [2524850, 2900000], [2429050, 2100000], [3084280, 1800000], [3376990, 1100000]]);
export function managerDemoProduct(game, now = new Date().toISOString()) {
  return {
    appId: game.appId,
    name: game.name,
    type: 'game',
    parentAppId: null,
    currency: 'KRW',
    minorPrice: samplePrices.get(game.appId) ?? 2000000,
    imageUrl: game.imageUrl,
    dlcIds: [],
    checkedAt: now
  };
}
export function createManagerDemo(games, now = new Date().toISOString()) {
  const byId = new Map(games.map(g => [g.appId, g]));
  const ownedIds = [105600, 620, 413150, 526870, 646570, 292030, 1794680, 433340, 400, 418240, 610370, 1948280, 1366540, 1062090, 1284190, 1520370, 284160, 635260, 4700, 213670, 2291760, 546560, 1059990, 667970];
  const owned = ownedIds.map((id, index) => ({
    appId: id,
    name: byId.get(id).name,
    minutes: index % 7 === 0 ? 0 : 180 + index * 150,
    source: '데모 샘플 · 플레이 시간 예시'
  }));
  const collectionSpecs = [['탐험하고 싶은 날', '탐험과 모험을 즐기는 게임', [105600, 292030, 433340, 1284190]], ['퍼즐과 전략', '퍼즐 풀이와 전략적 선택', [620, 400, 646570, 1948280]], ['농장과 편안한 일상', '농장과 생활을 꾸미는 게임', [413150, 433340, 2291760]], ['공장과 도시 설계', '생산과 건설을 중심으로 묶은 게임', [526870, 1366540, 1062090]], ['전술을 고민하는 시간', '전술과 잠입을 즐기는 게임', [418240, 610370, 4700]], ['자동차와 드라이빙', '운전과 자동차를 다루는 게임', [284160, 635260, 1520370]], ['VR과 리듬 체험', 'VR 또는 리듬 조작을 체험하는 게임', [546560, 667970, 1059990]], ['오늘 다시 꺼내볼 게임', '다시 플레이할 게임을 직접 모아 둔 예시', [1794680, 105600, 213670, 620]]];
  const collections = collectionSpecs.map(([name, reason, appIds], i) => ({
    id: 101 + i,
    kind: 'collection',
    data: {
      name: '샘플 · ' + name,
      explanation: reason + '을 모아 둔 샘플 컬렉션이에요. 실제 AI 분석 결과가 아니며 이름과 구성을 바꿔볼 수 있어요.',
      appIds
    }
  }));
  const watchIds = [1145360, 367520, 1868140, 588650, 2379780, 427520, 294100, 1030300, 2524850, 2429050, 3084280, 3376990];
  const watches = watchIds.map((appId, i) => {
    const p = managerDemoProduct(byId.get(appId), now);
    const status = i % 4,
      price = p.minorPrice / 100,
      targetWon = status === 1 ? price + 3500 : Math.max(1000, price - 5000);
    return {
      id: 201 + i,
      kind: 'watch',
      data: {
        appIds: [appId],
        targetWon,
        label: '샘플 · ' + p.name,
        enabled: status !== 3,
        lastChecked: now,
        matched: status === 1,
        error: status === 2 ? '샘플 조회 실패: 가격을 가져오지 못했어요. ‘샘플 다시 확인’을 눌러 재시도 화면을 체험하세요.' : '',
        prices: [p],
        totalMinor: p.minorPrice
      }
    };
  });
  const notifications = watches.slice(0, 8).map((w, i) => ({
    id: 301 + i,
    kind: 'notification',
    data: {
      watchId: w.id,
      title: w.data.label + ' · ' + (w.data.matched ? '구매 조건 충족' : '이전 할인 알림'),
      message: w.data.matched ? `샘플 알림: 예시 가격 ${(w.data.totalMinor / 100).toLocaleString('ko-KR')}원이 목표 ${w.data.targetWon.toLocaleString('ko-KR')}원 이하예요. 실제 할인이나 현재 상점 가격을 의미하지 않아요.` : `샘플 알림: 과거 예시 가격 ${Math.max(0, w.data.targetWon - 1000).toLocaleString('ko-KR')}원이 목표 금액을 충족했던 상황이에요. 현재 샘플 가격과 상태는 구매 대기 카드에서 확인하세요.`,
      read: i % 2 === 1,
      createdAt: new Date(new Date(now).getTime() - i * 86400000).toISOString()
    }
  }));
  return {
    catalog: games,
    owned,
    checkIntervalMinutes: 60,
    records: [...collections, ...watches, ...notifications]
  };
}
export function applyManagerDemoAction(state, id, type, now = new Date().toISOString()) {
  const record = state.records.find(r => r.id === id);
  if (!record) return state;
  if (type === 'delete') return {
    ...state,
    records: state.records.filter(r => r.id !== id)
  };
  let data = {
      ...record.data
    },
    notification = null;
  if (type === 'read') data.read = true;
  if (type === 'pause') {
    data.enabled = !data.enabled;
    if (data.enabled) {
      data.matched = false;
      data.lastChecked = '';
    }
  }
  if (type === 'check' && data.enabled) {
    const matched = data.totalMinor != null && data.totalMinor <= data.targetWon * 100;
    if (matched && !data.matched) notification = {
      id: Math.max(1000, ...state.records.map(r => r.id)) + 1,
      kind: 'notification',
      data: {
        watchId: id,
        title: data.label,
        message: '샘플 알림: 예시 가격이 목표 금액을 충족했어요. 실제 가격 조회나 서버 감시는 하지 않아요.',
        read: false,
        createdAt: now
      }
    };
    data = {
      ...data,
      lastChecked: now,
      matched,
      error: ''
    };
  }
  return {
    ...state,
    records: [...(notification ? [notification] : []), ...state.records.map(r => r.id === id ? {
      ...r,
      data
    } : r)]
  };
}
