// Tune future rewards here. Previously earned distance never gets recalculated.
window.JOURNEY_CONFIG = Object.freeze({
  totalDistanceMeters: 8000,
  metersPerPoint: 1,
  correctPoints: 10,
  weakRecoveryBonus: 20,
  vocabularyMasteryPoints: 10,
  checkpoints: [1000, 3000, 5000, 7000],
});
