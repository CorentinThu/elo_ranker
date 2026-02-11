import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlayersService } from '../players/players.service';
import { PublishMatchDto } from './dto/publish-match.dto';
import { Player } from '../players/player.entity';
import { MatchResult } from './models/match-result';
import { RankingCacheService } from './ranking-cache.service';
export declare class RankingService {
    private readonly playersService;
    private readonly rankingCache;
    constructor(playersService: PlayersService, rankingCache: RankingCacheService);
    getRanking(): Player[];
    processMatch(dto: PublishMatchDto): MatchResult;
    streamRankingEvents(): Observable<MessageEvent>;
}
