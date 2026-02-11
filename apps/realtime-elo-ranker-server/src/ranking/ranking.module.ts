import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { MatchController } from './match.controller';
import { RankingService } from './ranking.service';
import { PlayersModule } from '../players/players.module';
import { RankingCacheModule } from './ranking-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';

@Module({
  imports: [PlayersModule, RankingCacheModule, TypeOrmModule.forFeature([MatchEntity])],
  controllers: [RankingController, MatchController],
  providers: [RankingService],
})
export class RankingModule {}
