import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  MessageEvent,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, interval, map, mergeMap, Observable, of } from 'rxjs';
import { Repository } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { PublishMatchDto } from './dto/publish-match.dto';
import { Player } from '../players/player.entity';
import { MatchResult } from './models/match-result';
import { RankingCacheService } from './ranking-cache.service';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class RankingService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly rankingCache: RankingCacheService,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  async getRanking(): Promise<Player[]> {
    let ranking = this.rankingCache.getAll();

    if (ranking.length === 0) {
      const players = await this.playersService.findAll();
      this.rankingCache.bulkSet(players);
      ranking = players;
    }

    ranking = ranking.sort((a, b) => b.rank - a.rank);

    if (ranking.length === 0) {
      throw new NotFoundException({
        code: 404,
        message: 'No players available to compute ranking',
      });
    }
    return ranking;
  }

  async processMatch(dto: PublishMatchDto): Promise<MatchResult> {
    const winner = await this.playersService.findById(dto.winner);
    const loser = await this.playersService.findById(dto.loser);

    if (!winner || !loser) {
      throw new UnprocessableEntityException({
        code: 422,
        message: 'One or both players do not exist',
      });
    }

    if (dto.draw) {
      await this.playersService.upsert(winner);
      await this.playersService.upsert(loser);
      await this.matchRepo.save(
        this.matchRepo.create({
          winner: winner.id,
          loser: loser.id,
          draw: dto.draw,
        }),
      );
      return { winner, loser };
    }

    const winnerNewRank = winner.rank + 10;
    const loserNewRank = Math.max(loser.rank - 10, 0);

    const winnerUpdated: Player = { ...winner, rank: winnerNewRank };
    const loserUpdated: Player = { ...loser, rank: loserNewRank };

    await this.playersService.upsert(winnerUpdated);
    await this.playersService.upsert(loserUpdated);
    await this.matchRepo.save(
      this.matchRepo.create({
        winner: winner.id,
        loser: loser.id,
        draw: dto.draw,
      }),
    );

    return {
      winner: winnerUpdated,
      loser: loserUpdated,
    };
  }

  streamRankingEvents(): Observable<MessageEvent> {
    return interval(5000).pipe(
      mergeMap((tick) =>
        from(this.getRanking()).pipe(
          map((ranking) => {
            const player = ranking[tick % ranking.length];
            return {
              data: {
                type: 'RankingUpdate',
                player: { id: player.id, rank: player.rank },
              },
            };
          }),
          catchError((err) => {
            if (err instanceof NotFoundException) {
              return of({
                data: { type: 'Error', code: 404, message: 'No ranking available' },
              } as MessageEvent);
            }
            throw err;
          }),
        ),
      ),
    );
  }
}
