import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { PublishMatchDto } from './dto/publish-match.dto';
import { Player } from '../players/player.entity';
import { MatchResult } from './models/match-result';
import { RankingCacheService } from './ranking-cache.service';
import { MatchEntity } from './entities/match.entity';
import { EloService } from './elo.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class RankingService {
    private readonly playersService;
    private readonly rankingCache;
    private readonly eloService;
    private readonly eventEmitter;
    private readonly matchRepo;
    constructor(playersService: PlayersService, rankingCache: RankingCacheService, eloService: EloService, eventEmitter: EventEmitter2, matchRepo: Repository<MatchEntity>);
    getRanking(): Promise<Player[]>;
    processMatch(dto: PublishMatchDto): Promise<MatchResult>;
    streamRankingEvents(): Observable<MessageEvent>;
}
