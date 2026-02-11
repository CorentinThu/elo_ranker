import { Player } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingCacheService } from '../ranking/ranking-cache.service';
export declare class PlayersService {
    private readonly rankingCache;
    private players;
    constructor(rankingCache: RankingCacheService);
    create(dto: CreatePlayerDto): Player;
    findAll(): Player[];
    findById(id: string): Player | undefined;
    upsert(player: Player): void;
    private computeInitialRank;
}
