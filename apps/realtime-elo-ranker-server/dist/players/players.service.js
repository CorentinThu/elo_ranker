"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
let PlayersService = class PlayersService {
    constructor() {
        this.players = new Map();
    }
    create(dto) {
        const id = dto.id.trim();
        if (!id) {
            throw new common_1.BadRequestException({
                code: 400,
                message: 'Player id must be a non-empty string',
            });
        }
        if (this.players.has(id)) {
            throw new common_1.ConflictException({
                code: 409,
                message: `Player '${id}' already exists`,
            });
        }
        const player = {
            id,
            rank: this.computeInitialRank(),
        };
        this.players.set(id, player);
        return player;
    }
    findAll() {
        return Array.from(this.players.values());
    }
    findById(id) {
        return this.players.get(id);
    }
    upsert(player) {
        this.players.set(player.id, player);
    }
    computeInitialRank() {
        if (this.players.size === 0) {
            return 1000;
        }
        const sum = Array.from(this.players.values()).reduce((acc, p) => acc + p.rank, 0);
        return Math.round(sum / this.players.size);
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)()
], PlayersService);
//# sourceMappingURL=players.service.js.map