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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const players_service_1 = require("../players/players.service");
let RankingService = class RankingService {
    constructor(playersService) {
        this.playersService = playersService;
    }
    getRanking() {
        const ranking = this.playersService
            .findAll()
            .sort((a, b) => b.rank - a.rank);
        if (ranking.length === 0) {
            throw new common_1.NotFoundException({
                code: 404,
                message: 'No players available to compute ranking',
            });
        }
        return ranking;
    }
    processMatch(dto) {
        const winner = this.playersService.findById(dto.winner);
        const loser = this.playersService.findById(dto.loser);
        if (!winner || !loser) {
            throw new common_1.UnprocessableEntityException({
                code: 422,
                message: 'One or both players do not exist',
            });
        }
        if (dto.draw) {
            return { winner, loser };
        }
        const winnerNewRank = winner.rank + 10;
        const loserNewRank = Math.max(loser.rank - 10, 0);
        const winnerUpdated = Object.assign(Object.assign({}, winner), { rank: winnerNewRank });
        const loserUpdated = Object.assign(Object.assign({}, loser), { rank: loserNewRank });
        this.playersService.upsert(winnerUpdated);
        this.playersService.upsert(loserUpdated);
        return {
            winner: winnerUpdated,
            loser: loserUpdated,
        };
    }
    streamRankingEvents() {
        return (0, rxjs_1.interval)(5000).pipe((0, rxjs_1.map)((tick) => {
            const ranking = this.playersService
                .findAll()
                .sort((a, b) => b.rank - a.rank);
            if (ranking.length === 0) {
                return {
                    data: { type: 'Error', code: 404, message: 'No ranking available' },
                };
            }
            const player = ranking[tick % ranking.length];
            return {
                data: {
                    type: 'RankingUpdate',
                    player: { id: player.id, rank: player.rank },
                },
            };
        }));
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [players_service_1.PlayersService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map