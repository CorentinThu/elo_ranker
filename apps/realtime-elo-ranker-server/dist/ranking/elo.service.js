"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EloService = void 0;
const common_1 = require("@nestjs/common");
/**
 * Pure service implementing the Elo formula.
 */
let EloService = class EloService {
    constructor() {
        this.kFactor = 32;
    }
    compute({ ratingA, ratingB, scoreA, scoreB, }) {
        const expectedA = this.expectedScore(ratingA, ratingB);
        const expectedB = this.expectedScore(ratingB, ratingA);
        const nextRatingA = Math.round(ratingA + this.kFactor * (scoreA - expectedA));
        const nextRatingB = Math.round(ratingB + this.kFactor * (scoreB - expectedB));
        return { nextRatingA, nextRatingB };
    }
    expectedScore(rating, opponent) {
        return 1 / (1 + 10 ** ((opponent - rating) / 400));
    }
};
exports.EloService = EloService;
exports.EloService = EloService = __decorate([
    (0, common_1.Injectable)()
], EloService);
//# sourceMappingURL=elo.service.js.map