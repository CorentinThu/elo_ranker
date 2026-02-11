import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  MessageEvent,
  BadRequestException,
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
import { EloService } from './elo.service';

@Injectable()
export class RankingService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly rankingCache: RankingCacheService,
    private readonly eloService: EloService,
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
    if (dto.winner === dto.loser) {
      throw new BadRequestException({
        code: 400,
        message: 'Winner and loser must be different players',
      });
    }

    const winner = await this.playersService.findById(dto.winner);
    const loser = await this.playersService.findById(dto.loser);

    if (!winner || !loser) {
      throw new UnprocessableEntityException({
        code: 422,
        message: 'One or both players do not exist',
      });
    }

    const scoreA = dto.draw ? 0.5 : 1;
    const scoreB = dto.draw ? 0.5 : 0;

    const { nextRatingA, nextRatingB } = this.eloService.compute({
      ratingA: winner.rank,
      ratingB: loser.rank,
      scoreA,
      scoreB,
    });

    const winnerUpdated: Player = { ...winner, rank: nextRatingA };
    const loserUpdated: Player = { ...loser, rank: nextRatingB };

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
