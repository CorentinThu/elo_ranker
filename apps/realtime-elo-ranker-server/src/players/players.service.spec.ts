import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PlayerEntity } from './player.entity';
import { RankingCacheService } from '../ranking/ranking-cache.service';

const mockRankingCache = () => ({
  upsert: jest.fn(),
  bulkSet: jest.fn(),
});

const mockRepo = () => {
  const qb = { select: jest.fn().mockReturnThis(), getRawOne: jest.fn() };
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    create: jest.fn().mockImplementation((p) => p),
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    qb,
  };
};

describe('PlayersService', () => {
  let service: PlayersService;
  let repo: ReturnType<typeof mockRepo>;
  let cache: ReturnType<typeof mockRankingCache>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlayersService,
        { provide: RankingCacheService, useFactory: mockRankingCache },
        { provide: getRepositoryToken(PlayerEntity), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PlayersService);
    repo = module.get(getRepositoryToken(PlayerEntity));
    cache = module.get(RankingCacheService);
  });

  it('returns 1000 when no players exist', async () => {
    repo.count.mockResolvedValue(0);
    const created = await service.create({ id: 'alice' });
    expect(created.rank).toBe(1000);
  });

  it('uses DB average for initial rank', async () => {
    repo.count.mockResolvedValue(2);
    repo.qb.getRawOne.mockResolvedValue({ avg: '1100' });
    const created = await service.create({ id: 'bob' });
    expect(created.rank).toBe(1100);
  });

  it('rejects duplicate player', async () => {
    repo.count.mockResolvedValue(0);
    repo.findOne.mockResolvedValueOnce({ id: 'dup' });
    await expect(service.create({ id: 'dup' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('warms cache on findAll when map empty', async () => {
    repo.find.mockResolvedValue([{ id: 'carl', rank: 1000 }]);
    const res = await service.findAll();
    expect(res).toHaveLength(1);
    expect(cache.bulkSet).toHaveBeenCalled();
  });
});
