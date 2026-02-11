import { Module } from '@nestjs/common';
import { PlayersModule } from './players/players.module';
import { RankingModule } from './ranking/ranking.module';
import { HealthController } from './health.controller';
import { RankingCacheModule } from './ranking/ranking-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
