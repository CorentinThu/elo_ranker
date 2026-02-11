import { Controller, Get, MessageEvent, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  getRanking() {
    return this.rankingService.getRanking();
  }

  @Sse('events')
  streamRankingUpdates(): Observable<MessageEvent> {
    return this.rankingService.streamRankingEvents();
  }
}
