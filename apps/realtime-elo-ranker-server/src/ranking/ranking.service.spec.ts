import { MessageEvent, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RankingService } from "./ranking.service";
import { PlayersService } from "../players/players.service";
import { RankingCacheService } from "./ranking-cache.service";
import { EloService } from "./elo.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MatchEntity } from "./entities/match.entity";

const mockMatchRepo = () => ({
  save: jest.fn(),
  create: jest.fn().mockImplementation((p) => p),
});

const mockPlayers = () => ({
  findById: jest.fn(),
  upsert: jest.fn(),
  findAll: jest.fn(),
});

const mockCache = () => ({
  getAll: jest.fn().mockReturnValue([]),
  bulkSet: jest.fn(),
  upsert: jest.fn(),
});

describe("RankingService", () => {
  let service: RankingService;
  let players: ReturnType<typeof mockPlayers>;
  let matchRepo: ReturnType<typeof mockMatchRepo>;
  let emitter: EventEmitter2;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RankingService,
        EloService,
        { provide: PlayersService, useFactory: mockPlayers },
        { provide: RankingCacheService, useFactory: mockCache },
        { provide: EventEmitter2, useValue: { emit: jest.fn(), on: jest.fn(), off: jest.fn() } },
        { provide: getRepositoryToken(MatchEntity), useFactory: mockMatchRepo },
      ],
    }).compile();

    service = module.get(RankingService);
    players = module.get(PlayersService);
    matchRepo = module.get(getRepositoryToken(MatchEntity));
    emitter = module.get(EventEmitter2);
  });

  it("throws NotFound when no players in ranking", async () => {
    players.findAll.mockResolvedValue([]);
    await expect(service.getRanking()).rejects.toBeInstanceOf(NotFoundException);
  });

  it("processes draw without Elo shift and emits events", async () => {
    const winner = { id: "alice", rank: 1200 };
    const loser = { id: "bob", rank: 1100 };
    players.findById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);

    const res = await service.processMatch({ winner: "alice", loser: "bob", draw: true });

    expect(players.upsert).toHaveBeenCalledTimes(2);
    expect(matchRepo.save).toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledTimes(2);
    expect(res.winner.rank).toBeLessThan(1200);
    expect(res.loser.rank).toBeGreaterThan(1100);
  });

  it("rejects match when winner and loser are identical", async () => {
    await expect(
      service.processMatch({ winner: "same", loser: "same", draw: false }),
    ).rejects.toThrow();
  });

  it("emits Error event on SSE when no ranking", async () => {
    jest.useFakeTimers();
    players.findAll.mockResolvedValue([]); // getRanking -> NotFound

    const evtPromise = new Promise<MessageEvent>((resolve) => {
      const sub = service.streamRankingEvents().subscribe((e: MessageEvent) => {
        sub.unsubscribe();
        resolve(e);
      });
    });

    jest.advanceTimersByTime(5000);
    const evt = await evtPromise;
    jest.useRealTimers();

    expect((evt.data as any).type).toBe("Error");
  });
});
