import { Body, Controller, Post } from '@nestjs/common';
import { PublishMatchDto } from './dto/publish-match.dto';
import { RankingService } from './ranking.service';

@Controller('match')
export class MatchController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  publishMatch(@Body() dto: PublishMatchDto) {
    return this.rankingService.processMatch(dto);
  }
}
