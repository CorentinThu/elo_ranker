import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlayersService } from '../players/players.service';
import { PublishMatchDto } from './dto/publish-match.dto';
import { Player } from '../players/player.entity';
import { MatchResult } from './models/match-result';
export declare class RankingService {
    private readonly playersService;
    constructor(playersService: PlayersService);
    getRanking(): Player[];
    processMatch(dto: PublishMatchDto): MatchResult;
    streamRankingEvents(): Observable<MessageEvent>;
}
