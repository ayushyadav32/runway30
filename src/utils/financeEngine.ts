import { FinancialState, SimulationMetrics, RiskLevel } from '../types/finance';

/**
 * Computes all linked financial metrics based on current state variables.
 * Every calculation is strictly guarded against division by zero and supports 30 or 31 day cycles.
 */
export function computeSimulationMetrics(state: FinancialState): SimulationMetrics {
  const totalBudget = Number.isFinite(state.totalBudget) ? state.totalBudget : 10000;
  const currentDay = Number.isFinite(state.currentDay) ? Math.max(1, Math.round(state.currentDay)) : 1;
  const currentBalance = Number.isFinite(state.currentBalance) ? state.currentBalance : 0;
  const fixedCommitments = Number.isFinite(state.fixedCommitments) ? Math.max(0, state.fixedCommitments) : 0;
  const savingsGoal = Number.isFinite(state.savingsGoal) ? Math.max(0, state.savingsGoal) : 1500;
  const cycleDays = state.cycleDays === 31 ? 31 : 30;

  // 1. Days Remaining (selectedCycleDays - currentDay + 1, min 1, strictly finite)
  const rawDaysRemaining = cycleDays - currentDay + 1;
  const daysRemaining = Math.max(1, Number.isFinite(rawDaysRemaining) ? rawDaysRemaining : 1);

  // 2. Discretionary Safe Pool
  const discretionaryPool = currentBalance - fixedCommitments - savingsGoal;
  const safeDiscretionary = Number.isFinite(discretionaryPool) ? discretionaryPool : 0;

  // 3. Dynamic Daily Safe-To-Spend (guarded against NaN/Infinity/<=0)
  const dailySafeToSpend = safeDiscretionary > 0 && daysRemaining > 0
    ? Math.max(0, Math.round(safeDiscretionary / daysRemaining))
    : 0;

  // 4. Burn rates
  const totalSpentSoFar = Math.max(0, totalBudget - currentBalance);
  const safeCurrentDay = Math.max(1, currentDay);
  const dailyBurnRate = currentDay > 1 
    ? (Number.isFinite(totalSpentSoFar) ? totalSpentSoFar : 0) / (safeCurrentDay - 1) 
    : 0;
  const idealDailyBurnRate = Math.max(1, totalBudget / cycleDays);

  // Ideal baseline daily discretionary
  const totalInitialDiscretionary = Math.max(1, totalBudget - fixedCommitments - savingsGoal);
  const idealDailyDiscretionary = Math.max(1, totalInitialDiscretionary / cycleDays);

  // 5. Dynamic Health Score (0 - 1000)
  // Component A: Runway Pace (0 to 400 pts)
  let runwayPaceScore = 0;
  if (safeDiscretionary > 0 && idealDailyDiscretionary > 0) {
    const paceRatio = dailySafeToSpend / idealDailyDiscretionary;
    runwayPaceScore = Math.min(400, Math.round((Number.isFinite(paceRatio) ? paceRatio : 0) * 380));
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
    savingsShieldScore = Math.round(Math.max(0, Number.isFinite(savingsKeptRatio) ? savingsKeptRatio : 0) * 200);
  } else {
    savingsShieldScore = 0;
  }

  // Component C: Burn Discipline (0 to 300 pts)
  let burnDisciplineScore = 0;
  if (dailyBurnRate <= idealDailyBurnRate) {
    const buffer = idealDailyBurnRate - dailyBurnRate;
    burnDisciplineScore = Math.min(300, 240 + Math.round((buffer / idealDailyBurnRate) * 60));
  } else {
    const safeBurnRate = Math.max(1, dailyBurnRate);
    const overburnFactor = idealDailyBurnRate / safeBurnRate;
    burnDisciplineScore = Math.max(20, Math.round((Number.isFinite(overburnFactor) ? overburnFactor : 0) * 220));
  }

  // If discretionary pool is negative, heavily penalize total
  let totalScore = runwayPaceScore + savingsShieldScore + burnDisciplineScore;
  if (safeDiscretionary < 0) {
    totalScore = Math.min(250, Math.max(50, Math.round(totalScore * 0.3)));
  }

  const financialHealthScore = Math.min(1000, Math.max(0, Number.isFinite(totalScore) ? totalScore : 100));

  // 6. Risk Level
  let riskLevel: RiskLevel = 'LOW';
  let statusLabel = 'Cruise Control';
  let statusQuote = 'Clean runway. You are floating comfortably within safe flight parameters.';

  if (safeDiscretionary <= 0 || financialHealthScore < 450 || dailySafeToSpend < 50) {
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

  // Projected end balance
  const projectedEndBalance = Math.round(currentBalance - (dailySafeToSpend * daysRemaining));
  const projectedSurplus = Math.round(projectedEndBalance - savingsGoal);

  return {
    daysRemaining,
    cycleDays,
    discretionaryPool: safeDiscretionary,
    dailySafeToSpend,
    totalSpentSoFar: Number.isFinite(totalSpentSoFar) ? totalSpentSoFar : 0,
    dailyBurnRate: Number.isFinite(dailyBurnRate) ? dailyBurnRate : 0,
    idealDailyBurnRate: Number.isFinite(idealDailyBurnRate) ? idealDailyBurnRate : 0,
    projectedEndBalance: Number.isFinite(projectedEndBalance) ? projectedEndBalance : 0,
    projectedSurplus: Number.isFinite(projectedSurplus) ? projectedSurplus : 0,
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
 * Guaranteed:
 * 1. Safe against NaN/Infinity
 * 2. Negative numbers formatted as -₹X (never --₹X)
 * 3. Indian digit comma grouping
 */
export function formatINR(val: number, includeDecimals: boolean = false): string {
  if (!Number.isFinite(val)) {
    return '₹0';
  }

  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const rounded = includeDecimals ? absVal.toFixed(2) : Math.round(absVal).toString();
  const parts = rounded.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  // Indian number grouping on absolute value integer
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}₹${formattedInteger}${decimalPart}`;
}
