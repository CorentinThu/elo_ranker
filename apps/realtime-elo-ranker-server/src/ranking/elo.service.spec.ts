import { EloService } from './elo.service';

describe('EloService', () => {
  const service = new EloService();

  it('should increase winner rating and decrease loser rating', () => {
    const res = service.compute({
      ratingA: 1200,
      ratingB: 1200,
      scoreA: 1,
      scoreB: 0,
    });

    expect(res.nextRatingA).toBeGreaterThan(1200);
    expect(res.nextRatingB).toBeLessThan(1200);
  });

  it('should handle draw symmetrically', () => {
    const res = service.compute({
      ratingA: 1300,
      ratingB: 1250,
      scoreA: 0.5,
      scoreB: 0.5,
    });

    // Ratings move toward each other
    expect(res.nextRatingA).toBeLessThan(1300);
    expect(res.nextRatingB).toBeGreaterThan(1250);
  });
});
