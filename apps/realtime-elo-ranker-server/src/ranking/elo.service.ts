import { Injectable } from '@nestjs/common';

export interface EloComputationInput {
  ratingA: number;
  ratingB: number;
  scoreA: number; // 1 = win, 0.5 = draw, 0 = loss
  scoreB: number;
}

export interface EloComputationResult {
  nextRatingA: number;
  nextRatingB: number;
}

/**
 * Pure service implementing the Elo formula.
 */
@Injectable()
export class EloService {
  private readonly kFactor = 32;

  compute({
    ratingA,
    ratingB,
    scoreA,
    scoreB,
  }: EloComputationInput): EloComputationResult {
    const expectedA = this.expectedScore(ratingA, ratingB);
    const expectedB = this.expectedScore(ratingB, ratingA);

    const nextRatingA = Math.round(ratingA + this.kFactor * (scoreA - expectedA));
    const nextRatingB = Math.round(ratingB + this.kFactor * (scoreB - expectedB));

    return { nextRatingA, nextRatingB };
  }

  private expectedScore(rating: number, opponent: number): number {
    return 1 / (1 + 10 ** ((opponent - rating) / 400));
  }
}
