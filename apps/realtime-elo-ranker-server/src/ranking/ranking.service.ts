import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  MessageEvent,
} from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';
import { PlayersService } from '../players/players.service';
import { PublishMatchDto } from './dto/publish-match.dto';
import { Player } from '../players/player.entity';
import { MatchResult } from './models/match-result';
import { RankingCacheService } from './ranking-cache.service';

@Injectable()
export class RankingService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly rankingCache: RankingCacheService,
  ) {}

  getRanking(): Player[] {
    let ranking = this.rankingCache.getAll();

    if (ranking.length === 0) {
      const players = this.playersService.findAll();
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

  processMatch(dto: PublishMatchDto): MatchResult {
    const winner = this.playersService.findById(dto.winner);
    const loser = this.playersService.findById(dto.loser);

    if (!winner || !loser) {
      throw new UnprocessableEntityException({
        code: 422,
        message: 'One or both players do not exist',
      });
    }

    if (dto.draw) {
      this.rankingCache.upsert(winner);
      this.rankingCache.upsert(loser);
      return { winner, loser };
    }

    const winnerNewRank = winner.rank + 10;
    const loserNewRank = Math.max(loser.rank - 10, 0);

    const winnerUpdated: Player = { ...winner, rank: winnerNewRank };
    const loserUpdated: Player = { ...loser, rank: loserNewRank };

    this.playersService.upsert(winnerUpdated);
    this.playersService.upsert(loserUpdated);
    this.rankingCache.upsert(winnerUpdated);
    this.rankingCache.upsert(loserUpdated);

    return {
      winner: winnerUpdated,
      loser: loserUpdated,
    };
  }

  streamRankingEvents(): Observable<MessageEvent> {
    return interval(5000).pipe(
      map((tick) => {
        try {
          const ranking = this.getRanking();
          const player = ranking[tick % ranking.length];
          return {
            data: {
              type: 'RankingUpdate',
              player: { id: player.id, rank: player.rank },
            },
          };
        } catch (err) {
          if (err instanceof NotFoundException) {
            return {
              data: {
                type: 'Error',
                code: 404,
                message: 'No ranking available',
              },
            };
          }
          throw err;
        }
      }),
    );
  }
}
