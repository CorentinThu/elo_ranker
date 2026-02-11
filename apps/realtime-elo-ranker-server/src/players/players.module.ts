import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { RankingCacheModule } from '../ranking/ranking-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity } from './player.entity';

@Module({
  imports: [RankingCacheModule, TypeOrmModule.forFeature([PlayerEntity])],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
