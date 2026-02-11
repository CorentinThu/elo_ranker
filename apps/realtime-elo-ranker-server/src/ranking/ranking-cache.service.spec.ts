import { RankingCacheService } from './ranking-cache.service';

describe('RankingCacheService', () => {
  it('stores and retrieves players', () => {
    const cache = new RankingCacheService();
    cache.upsert({ id: 'p1', rank: 1200 });
    expect(cache.getById('p1')?.rank).toBe(1200);
    expect(cache.getAll()).toHaveLength(1);
    cache.clear();
    expect(cache.getAll()).toHaveLength(0);
  });
});
