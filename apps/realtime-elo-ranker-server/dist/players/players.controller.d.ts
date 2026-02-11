import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';
export declare class PlayersController {
    private readonly playersService;
    constructor(playersService: PlayersService);
    createPlayer(dto: CreatePlayerDto): import("./player.entity").Player;
}
