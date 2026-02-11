export interface EloComputationInput {
    ratingA: number;
    ratingB: number;
    scoreA: number;
    scoreB: number;
}
export interface EloComputationResult {
    nextRatingA: number;
    nextRatingB: number;
}
/**
 * Pure service implementing the Elo formula.
 */
export declare class EloService {
    private readonly kFactor;
    compute({ ratingA, ratingB, scoreA, scoreB, }: EloComputationInput): EloComputationResult;
    private expectedScore;
}
