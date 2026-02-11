import { Module } from '@nestjs/common';
import { PlayersModule } from './players/players.module';
import { RankingModule } from './ranking/ranking.module';
import { HealthController } from './health.controller';
import { RankingCacheModule } from './ranking/ranking-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/elo.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    RankingCacheModule,
    PlayersModule,
    RankingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
