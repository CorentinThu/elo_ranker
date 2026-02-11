import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player, PlayerEntity } from './player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RankingCacheService } from '../ranking/ranking-cache.service';

@Injectable()
export class PlayersService {
  private players: Map<string, Player> = new Map();

  constructor(
    private readonly rankingCache: RankingCacheService,
    @InjectRepository(PlayerEntity)
    private readonly playersRepo: Repository<PlayerEntity>,
  ) {}

  async create(dto: CreatePlayerDto): Promise<Player> {
    const id = dto.id.trim();
    if (!id) {
      throw new BadRequestException({
        code: 400,
        message: 'Player id must be a non-empty string',
      });
    }
    if (this.players.has(id) || (await this.playersRepo.findOne({ where: { id } }))) {
      throw new ConflictException({
        code: 409,
        message: `Player '${id}' already exists`,
      });
    }
    const player: PlayerEntity = this.playersRepo.create({
      id,
      rank: await this.computeInitialRank(),
    });
    await this.playersRepo.save(player);
    this.players.set(id, player);
    this.rankingCache.upsert(player);
    return player;
  }

  async findAll(): Promise<Player[]> {
    if (this.players.size === 0) {
      const dbPlayers = await this.playersRepo.find();
      dbPlayers.forEach((p) => this.players.set(p.id, p));
      this.rankingCache.bulkSet(dbPlayers);
    }
    return Array.from(this.players.values());
  }

  async findById(id: string): Promise<Player | undefined> {
    const cached = this.players.get(id) ?? this.rankingCache.getById(id);
    if (cached) {
      return cached;
    }
    const found = await this.playersRepo.findOne({ where: { id } });
    if (found) {
      this.players.set(id, found);
      this.rankingCache.upsert(found);
    }
    return found ?? undefined;
  }

  async upsert(player: Player): Promise<void> {
    await this.playersRepo.save(player);
    this.players.set(player.id, player);
    this.rankingCache.upsert(player);
  }

  private async computeInitialRank(): Promise<number> {
    const count = await this.playersRepo.count();
    if (count === 0) {
      return 1000;
    }
    const raw = await this.playersRepo
      .createQueryBuilder('p')
      .select('AVG(p.rank)', 'avg')
      .getRawOne<{ avg: string } | undefined>();
    const parsedAvg = raw?.avg ? parseFloat(raw.avg) : 1000;
    return Math.round(parsedAvg);
  }
}
