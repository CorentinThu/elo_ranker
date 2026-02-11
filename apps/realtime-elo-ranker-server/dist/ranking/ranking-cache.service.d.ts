import { Player } from '../players/player.entity';
export declare class RankingCacheService {
    private ranking;
    getAll(): Player[];
    getById(id: string): Player | undefined;
    upsert(player: Player): void;
    bulkSet(players: Player[]): void;
    clear(): void;
}
