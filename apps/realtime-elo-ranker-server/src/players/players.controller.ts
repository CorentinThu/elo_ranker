import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';

@Controller('player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createPlayer(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }
}
