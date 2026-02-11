import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PublishMatchDto } from './dto/publish-match.dto';
import { RankingService } from './ranking.service';

@Controller('match')
export class MatchController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  publishMatch(@Body() dto: PublishMatchDto) {
    return this.rankingService.processMatch(dto);
  }
}
