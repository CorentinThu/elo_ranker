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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rxjs_1 = require("rxjs");
const typeorm_2 = require("typeorm");
const players_service_1 = require("../players/players.service");
const ranking_cache_service_1 = require("./ranking-cache.service");
const match_entity_1 = require("./entities/match.entity");
let RankingService = class RankingService {
    constructor(playersService, rankingCache, matchRepo) {
        this.playersService = playersService;
        this.rankingCache = rankingCache;
        this.matchRepo = matchRepo;
    }
    async getRanking() {
        let ranking = this.rankingCache.getAll();
        if (ranking.length === 0) {
            const players = await this.playersService.findAll();
            this.rankingCache.bulkSet(players);
            ranking = players;
        }
        ranking = ranking.sort((a, b) => b.rank - a.rank);
        if (ranking.length === 0) {
            throw new common_1.NotFoundException({
                code: 404,
                message: 'No players available to compute ranking',
            });
        }
        return ranking;
    }
    async processMatch(dto) {
        const winner = await this.playersService.findById(dto.winner);
        const loser = await this.playersService.findById(dto.loser);
        if (!winner || !loser) {
            throw new common_1.UnprocessableEntityException({
                code: 422,
                message: 'One or both players do not exist',
            });
        }
        if (dto.draw) {
            await this.playersService.upsert(winner);
            await this.playersService.upsert(loser);
            await this.matchRepo.save(this.matchRepo.create({
                winner: winner.id,
                loser: loser.id,
                draw: dto.draw,
            }));
            return { winner, loser };
        }
        const winnerNewRank = winner.rank + 10;
        const loserNewRank = Math.max(loser.rank - 10, 0);
        const winnerUpdated = Object.assign(Object.assign({}, winner), { rank: winnerNewRank });
        const loserUpdated = Object.assign(Object.assign({}, loser), { rank: loserNewRank });
        await this.playersService.upsert(winnerUpdated);
        await this.playersService.upsert(loserUpdated);
        await this.matchRepo.save(this.matchRepo.create({
            winner: winner.id,
            loser: loser.id,
            draw: dto.draw,
        }));
        return {
            winner: winnerUpdated,
            loser: loserUpdated,
        };
    }
    streamRankingEvents() {
        return (0, rxjs_1.interval)(5000).pipe((0, rxjs_1.mergeMap)((tick) => (0, rxjs_1.from)(this.getRanking()).pipe((0, rxjs_1.map)((ranking) => {
            const player = ranking[tick % ranking.length];
            return {
                data: {
                    type: 'RankingUpdate',
                    player: { id: player.id, rank: player.rank },
                },
            };
        }), (0, rxjs_1.catchError)((err) => {
            if (err instanceof common_1.NotFoundException) {
                return (0, rxjs_1.of)({
                    data: { type: 'Error', code: 404, message: 'No ranking available' },
                });
            }
            throw err;
        }))));
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(match_entity_1.MatchEntity)),
    __metadata("design:paramtypes", [players_service_1.PlayersService,
        ranking_cache_service_1.RankingCacheService,
        typeorm_2.Repository])
], RankingService);
//# sourceMappingURL=ranking.service.js.map