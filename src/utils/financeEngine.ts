import { FinancialState, SimulationMetrics, RiskLevel } from '../types/finance';

/**
 * Computes all linked financial metrics based on current state variables.
 * Every calculation is strictly guarded against division by zero and supports 30 or 31 day cycles.
 */
export function computeSimulationMetrics(state: FinancialState): SimulationMetrics {
  const { 
    totalBudget, 
    currentDay, 
    currentBalance, 
    fixedCommitments, 
    savingsGoal,
    cycleDays = 30,
  } = state;

  const totalCycleDays = cycleDays === 31 ? 31 : 30;

  // 1. Days Remaining (selectedCycleDays - currentDay + 1, min 1)
  const rawDaysRemaining = totalCycleDays - currentDay + 1;
  const daysRemaining = Math.max(1, rawDaysRemaining);

  // 2. Discretionary Safe Pool
  const discretionaryPool = currentBalance - fixedCommitments - savingsGoal;

  // 3. Dynamic Daily Safe-To-Spend
  const dailySafeToSpend = discretionaryPool > 0 
    ? Math.max(0, discretionaryPool / daysRemaining) 
    : 0;

  // 4. Burn rates
  const totalSpentSoFar = Math.max(0, totalBudget - currentBalance);
  const safeCurrentDay = Math.max(1, currentDay);
  const dailyBurnRate = currentDay > 1 ? totalSpentSoFar / (safeCurrentDay - 1) : 0;
  const idealDailyBurnRate = Math.max(1, totalBudget / totalCycleDays);

  // Ideal baseline daily discretionary
  const totalInitialDiscretionary = Math.max(1, totalBudget - fixedCommitments - savingsGoal);
  const idealDailyDiscretionary = Math.max(1, totalInitialDiscretionary / totalCycleDays);

  // 5. Dynamic Health Score (0 - 1000)
  // Component A: Runway Pace (0 to 400 pts)
  let runwayPaceScore = 0;
  if (discretionaryPool > 0) {
    const paceRatio = dailySafeToSpend / idealDailyDiscretionary;
    runwayPaceScore = Math.min(400, Math.round(paceRatio * 380));
  } else {
    runwayPaceScore = 0;
  }

  // Component B: Savings Shield (0 to 300 pts)
  let savingsShieldScore = 0;
  const safeSavingsGoal = Math.max(1, savingsGoal);
  const protectedThreshold = fixedCommitments + savingsGoal;
  if (currentBalance >= protectedThreshold) {
    savingsShieldScore = 300;
  } else if (currentBalance > fixedCommitments) {
    const savingsKeptRatio = (currentBalance - fixedCommitments) / safeSavingsGoal;
    savingsShieldScore = Math.round(Math.max(0, savingsKeptRatio) * 200);
  } else {
    // Dipping even below fixed commitments!
    savingsShieldScore = 0;
  }

  // Component C: Burn Discipline (0 to 300 pts)
  let burnDisciplineScore = 0;
  if (dailyBurnRate <= idealDailyBurnRate) {
    const buffer = idealDailyBurnRate - dailyBurnRate;
    burnDisciplineScore = Math.min(300, 240 + Math.round((buffer / idealDailyBurnRate) * 60));
  } else {
    const overburnFactor = idealDailyBurnRate / Math.max(1, dailyBurnRate);
    burnDisciplineScore = Math.max(20, Math.round(overburnFactor * 220));
  }

  // If discretionary pool is negative, heavily penalize total
  let totalScore = runwayPaceScore + savingsShieldScore + burnDisciplineScore;
  if (discretionaryPool < 0) {
    totalScore = Math.min(250, Math.max(50, Math.round(totalScore * 0.3)));
  }

  const financialHealthScore = Math.min(1000, Math.max(0, totalScore));

  // 6. Risk Level
  let riskLevel: RiskLevel = 'LOW';
  let statusLabel = 'Cruise Control';
  let statusQuote = 'Clean runway. You are floating comfortably within safe flight parameters.';

  if (discretionaryPool <= 0 || financialHealthScore < 450 || dailySafeToSpend < 50) {
    riskLevel = 'CRITICAL';
    statusLabel = 'Mayday Burnout';
    statusQuote = 'Warning! Discretionary pool depleted or safety buffer breached. Halt impulse spending.';
  } else if (financialHealthScore < 720 || dailySafeToSpend < 120) {
    riskLevel = 'MODERATE';
    statusLabel = 'Turbulence Watch';
    statusQuote = 'Safe to spend is tightening. Pacing is key to preserve the savings vault.';
  } else {
    riskLevel = 'LOW';
    statusLabel = 'God Mode / Cruise';
    statusQuote = 'Clean runway. You are floating comfortably within safe flight parameters.';
  }

  // Projected end balance assuming user spends exactly the daily safe-to-spend
  const projectedEndBalance = Math.round(currentBalance - (dailySafeToSpend * daysRemaining));
  const projectedSurplus = Math.round(projectedEndBalance - savingsGoal);

  return {
    daysRemaining,
    cycleDays: totalCycleDays,
    discretionaryPool,
    dailySafeToSpend,
    totalSpentSoFar,
    dailyBurnRate,
    idealDailyBurnRate,
    projectedEndBalance,
    projectedSurplus,
    financialHealthScore,
    riskLevel,
    healthBreakdown: {
      runwayPaceScore,
      savingsShieldScore,
      burnDisciplineScore
    },
    statusLabel,
    statusQuote,
  };
}

/**
 * Currency formatter for Indian Rupee (INR)
 */
export function formatINR(val: number, includeDecimals: boolean = false): string {
  const rounded = includeDecimals ? val.toFixed(2) : Math.round(val).toString();
  const parts = rounded.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.slice(1);

  // Indian number grouping
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}₹${formattedInteger}${decimalPart}`;
}
