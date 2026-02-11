import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Player } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';

@Injectable()
export class PlayersService {
  private players: Map<string, Player> = new Map();

  create(dto: CreatePlayerDto): Player {
    const id = dto.id.trim();
    if (!id) {
      throw new BadRequestException({
        code: 400,
        message: 'Player id must be a non-empty string',
      });
    }
    if (this.players.has(id)) {
      throw new ConflictException({
        code: 409,
        message: `Player '${id}' already exists`,
      });
    }
    const player: Player = {
      id,
      rank: this.computeInitialRank(),
    };
    this.players.set(id, player);
    return player;
  }

  findAll(): Player[] {
    return Array.from(this.players.values());
  }

  findById(id: string): Player | undefined {
    return this.players.get(id);
  }

  upsert(player: Player): void {
    this.players.set(player.id, player);
  }

  private computeInitialRank(): number {
    if (this.players.size === 0) {
      return 1000;
    }
    const sum = Array.from(this.players.values()).reduce(
      (acc, p) => acc + p.rank,
      0,
    );
    return Math.round(sum / this.players.size);
  }
}
