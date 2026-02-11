import { Player } from '../../players/player.entity';

export interface MatchResult {
  winner: Player;
  loser: Player;
}
