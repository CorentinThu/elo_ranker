import { Injectable } from '@nestjs/common';
import { Player } from '../players/player.entity';

@Injectable()
export class RankingCacheService {
  private ranking = new Map<string, Player>();

  getAll(): Player[] {
    return Array.from(this.ranking.values());
  }

  getById(id: string): Player | undefined {
    return this.ranking.get(id);
  }

  upsert(player: Player): void {
    this.ranking.set(player.id, player);
  }

  bulkSet(players: Player[]): void {
    players.forEach((p) => this.ranking.set(p.id, p));
  }

  clear(): void {
    this.ranking.clear();
  }
}
