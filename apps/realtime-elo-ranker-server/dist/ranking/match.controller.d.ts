import { PublishMatchDto } from './dto/publish-match.dto';
import { RankingService } from './ranking.service';
export declare class MatchController {
    private readonly rankingService;
    constructor(rankingService: RankingService);
    publishMatch(dto: PublishMatchDto): import("./models/match-result").MatchResult;
}
