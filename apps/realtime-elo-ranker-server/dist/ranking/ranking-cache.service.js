"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingCacheService = void 0;
const common_1 = require("@nestjs/common");
let RankingCacheService = class RankingCacheService {
    constructor() {
        this.ranking = new Map();
    }
    getAll() {
        return Array.from(this.ranking.values());
    }
    getById(id) {
        return this.ranking.get(id);
    }
    upsert(player) {
        this.ranking.set(player.id, player);
    }
    bulkSet(players) {
        players.forEach((p) => this.ranking.set(p.id, p));
    }
    clear() {
        this.ranking.clear();
    }
};
exports.RankingCacheService = RankingCacheService;
exports.RankingCacheService = RankingCacheService = __decorate([
    (0, common_1.Injectable)()
], RankingCacheService);
//# sourceMappingURL=ranking-cache.service.js.map