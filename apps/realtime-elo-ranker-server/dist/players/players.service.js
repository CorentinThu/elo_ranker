"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_entity_1 = require("./player.entity");
const ranking_cache_service_1 = require("../ranking/ranking-cache.service");
let PlayersService = class PlayersService {
    constructor(rankingCache, playersRepo) {
        this.rankingCache = rankingCache;
        this.playersRepo = playersRepo;
        this.players = new Map();
    }
    async create(dto) {
        const id = dto.id.trim();
        if (!id) {
            throw new common_1.BadRequestException({
                code: 400,
                message: 'Player id must be a non-empty string',
            });
        }
        if (this.players.has(id) || (await this.playersRepo.findOne({ where: { id } }))) {
            throw new common_1.ConflictException({
                code: 409,
                message: `Player '${id}' already exists`,
            });
        }
        const player = this.playersRepo.create({
            id,
            rank: await this.computeInitialRank(),
        });
        await this.playersRepo.save(player);
        this.players.set(id, player);
        this.rankingCache.upsert(player);
        return player;
    }
    async findAll() {
        if (this.players.size === 0) {
            const dbPlayers = await this.playersRepo.find();
            dbPlayers.forEach((p) => this.players.set(p.id, p));
            this.rankingCache.bulkSet(dbPlayers);
        }
        return Array.from(this.players.values());
    }
    async findById(id) {
        var _a;
        const cached = (_a = this.players.get(id)) !== null && _a !== void 0 ? _a : this.rankingCache.getById(id);
        if (cached) {
            return cached;
        }
        const found = await this.playersRepo.findOne({ where: { id } });
        if (found) {
            this.players.set(id, found);
            this.rankingCache.upsert(found);
        }
        return found !== null && found !== void 0 ? found : undefined;
    }
    async upsert(player) {
        await this.playersRepo.save(player);
        this.players.set(player.id, player);
        this.rankingCache.upsert(player);
    }
    async computeInitialRank() {
        const count = await this.playersRepo.count();
        if (count === 0) {
            return 1000;
        }
        const raw = await this.playersRepo
            .createQueryBuilder('p')
            .select('AVG(p.rank)', 'avg')
            .getRawOne();
        const parsedAvg = (raw === null || raw === void 0 ? void 0 : raw.avg) ? parseFloat(raw.avg) : 1000;
        return Math.round(parsedAvg);
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(player_entity_1.PlayerEntity)),
    __metadata("design:paramtypes", [ranking_cache_service_1.RankingCacheService,
        typeorm_2.Repository])
], PlayersService);
//# sourceMappingURL=players.service.js.map