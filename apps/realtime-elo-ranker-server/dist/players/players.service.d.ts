import { Player } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
export declare class PlayersService {
    private players;
    create(dto: CreatePlayerDto): Player;
    findAll(): Player[];
    findById(id: string): Player | undefined;
    upsert(player: Player): void;
    private computeInitialRank;
}
