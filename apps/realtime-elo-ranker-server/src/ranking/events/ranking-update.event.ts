import { Player } from '../../players/player.entity';

export class RankingUpdateEvent {
  constructor(public readonly player: Player) {}
}
