import { Repository } from 'typeorm';
import { Player, PlayerEntity } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingCacheService } from '../ranking/ranking-cache.service';
export declare class PlayersService {
    private readonly rankingCache;
    private readonly playersRepo;
    private players;
    constructor(rankingCache: RankingCacheService, playersRepo: Repository<PlayerEntity>);
    create(dto: CreatePlayerDto): Promise<Player>;
    findAll(): Promise<Player[]>;
    findById(id: string): Promise<Player | undefined>;
    upsert(player: Player): Promise<void>;
    private computeInitialRank;
}
