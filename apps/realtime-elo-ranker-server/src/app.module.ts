import { Module } from '@nestjs/common';
import { PlayersModule } from './players/players.module';
import { RankingModule } from './ranking/ranking.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PlayersModule, RankingModule],
  controllers: [HealthController],
})
export class AppModule {}
