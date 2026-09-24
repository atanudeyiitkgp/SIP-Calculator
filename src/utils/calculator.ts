import { MonthBreakdown, SIPCalculationResult, SIPInputs, YearBreakdown } from '../types/sip';

/**
 * Calculates comprehensive SIP returns including optional Step-Up,
 * Inflation discount, Tax estimations, and detailed yearly/monthly schedules.
 */
export function calculateSIP(inputs: SIPInputs): SIPCalculationResult {
  const {
    monthlyInvestment,
    expectedReturnRate,
    timeHorizonYears,
    initialLumpsum = 0,
    stepUpEnabled = false,
    stepUpType = 'percentage',
    stepUpValue = 10,
    adjustInflation = false,
    inflationRate = 6,
    estimateTax = false,
    taxRate = 12.5,
  } = inputs;

  const totalYears = Math.max(1, Math.min(40, timeHorizonYears));
  const totalMonths = totalYears * 12;
  const monthlyRate = expectedReturnRate > 0 ? (expectedReturnRate / 100) / 12 : 0;

  const yearlyBreakdown: YearBreakdown[] = [];
  const monthlyBreakdown: MonthBreakdown[] = [];

  let currentBalance = Math.max(0, initialLumpsum);
  let totalInvested = Math.max(0, initialLumpsum);
  let currentMonthlySIP = Math.max(0, monthlyInvestment);
  let crossoverYear: number | null = null;

  for (let year = 1; year <= totalYears; year++) {
    // If step-up is enabled and not first year, apply annual increase
    if (stepUpEnabled && year > 1) {
      if (stepUpType === 'percentage') {
        currentMonthlySIP = currentMonthlySIP * (1 + stepUpValue / 100);
      } else {
        currentMonthlySIP = currentMonthlySIP + stepUpValue;
      }
    }

    let yearStartBalance = currentBalance;
    let yearTotalDeposited = 0;

    for (let monthInYear = 1; monthInYear <= 12; monthInYear++) {
      const overallMonth = (year - 1) * 12 + monthInYear;

      // Add monthly investment at the start of the month
      currentBalance += currentMonthlySIP;
      yearTotalDeposited += currentMonthlySIP;
      totalInvested += currentMonthlySIP;

      // Earn interest for this month
      const monthInterest = currentBalance * monthlyRate;
      currentBalance += monthInterest;

      // Record monthly detail
      monthlyBreakdown.push({
        month: overallMonth,
        year,
        monthlyDeposit: Math.round(currentMonthlySIP),
        interestEarned: Math.round(monthInterest),
        cumulativeInvested: Math.round(totalInvested),
        cumulativeBalance: Math.round(currentBalance),
      });
    }

    const yearInterestEarned = currentBalance - yearStartBalance - yearTotalDeposited;
    const totalInterestSoFar = currentBalance - totalInvested;

    // Check for crossover year (first year where interest earned in that year > annual deposits)
    if (crossoverYear === null && yearInterestEarned > yearTotalDeposited) {
      crossoverYear = year;
    }

    // Inflation discounting for this year
    const inflationFactor = Math.pow(1 + inflationRate / 100, year);
    const inflationAdjusted = currentBalance / inflationFactor;

    // Tax calculation on accrued gains
    const accruedGains = Math.max(0, currentBalance - totalInvested);
    const estimatedTaxDue = accruedGains * (taxRate / 100);
    const taxAdjusted = currentBalance - estimatedTaxDue;

    yearlyBreakdown.push({
      year,
      monthlyInvestment: Math.round(currentMonthlySIP),
      annualInvestment: Math.round(yearTotalDeposited),
      totalInvested: Math.round(totalInvested),
      interestEarnedYear: Math.round(yearInterestEarned),
      totalInterestEarned: Math.round(totalInterestSoFar),
      endingBalance: Math.round(currentBalance),
      inflationAdjustedBalance: Math.round(inflationAdjusted),
      taxAdjustedBalance: Math.round(taxAdjusted),
    });
  }

  const finalMaturity = currentBalance;
  const totalReturns = Math.max(0, finalMaturity - totalInvested);
  const inflationDiscount = Math.pow(1 + (adjustInflation ? inflationRate : 0) / 100, totalYears);
  const realPurchasingPower = finalMaturity / inflationDiscount;

  const taxAmount = estimateTax ? totalReturns * (taxRate / 100) : 0;
  const postTaxMaturityValue = finalMaturity - taxAmount;
  const wealthMultiplier = totalInvested > 0 ? Number((finalMaturity / totalInvested).toFixed(2)) : 0;

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    maturityValue: Math.round(finalMaturity),
    realPurchasingPower: Math.round(realPurchasingPower),
    postTaxMaturityValue: Math.round(postTaxMaturityValue),
    wealthMultiplier,
    crossoverYear,
    yearlyBreakdown,
    monthlyBreakdown,
  };
}

/**
 * Calculates Required Monthly SIP to reach a specific Target Corpus (Goal Planner)
 */
export function calculateRequiredSIP(
  targetAmount: number,
  expectedReturnRate: number,
  timeHorizonYears: number,
  adjustForInflation: boolean = false,
  inflationRate: number = 6
): {
  nominalTarget: number;
  effectiveTarget: number;
  requiredMonthlySIP: number;
  requiredWith10PercentStepUp: number;
  totalInvested: number;
  wealthGain: number;
} {
  const years = Math.max(1, timeHorizonYears);
  const months = years * 12;
  const i = expectedReturnRate > 0 ? (expectedReturnRate / 100) / 12 : 0;

  let effectiveTarget = targetAmount;
  if (adjustForInflation) {
    // If inflation is factored in, target grows to maintain purchasing power
    effectiveTarget = targetAmount * Math.pow(1 + inflationRate / 100, years);
  }

  // Formula for standard SIP: M = P * [((1+i)^n - 1) / i] * (1+i)
  // P = M / { [((1+i)^n - 1) / i] * (1+i) }
  let requiredMonthly = 0;
  if (i > 0) {
    const factor = ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    requiredMonthly = effectiveTarget / factor;
  } else {
    requiredMonthly = effectiveTarget / months;
  }

  // Calculate with 10% annual step-up: binary search or approximate factor
  let low = 1;
  let high = requiredMonthly;
  let requiredWithStepUp = requiredMonthly * 0.6; // initial guess

  for (let iter = 0; iter < 25; iter++) {
    const mid = (low + high) / 2;
    const testResult = calculateSIP({
      monthlyInvestment: mid,
      expectedReturnRate,
      timeHorizonYears: years,
      initialLumpsum: 0,
      stepUpEnabled: true,
      stepUpType: 'percentage',
      stepUpValue: 10,
      adjustInflation: false,
      inflationRate: 0,
      estimateTax: false,
      taxRate: 0,
    });
    if (testResult.maturityValue < effectiveTarget) {
      low = mid;
    } else {
      high = mid;
    }
  }
  requiredWithStepUp = Math.round(high);

  const roundedMonthly = Math.round(requiredMonthly);
  const totalInvested = roundedMonthly * months;
  const wealthGain = Math.max(0, effectiveTarget - totalInvested);

  return {
    nominalTarget: Math.round(targetAmount),
    effectiveTarget: Math.round(effectiveTarget),
    requiredMonthlySIP: roundedMonthly,
    requiredWith10PercentStepUp: requiredWithStepUp,
    totalInvested: Math.round(totalInvested),
    wealthGain: Math.round(wealthGain),
  };
}

/**
 * Calculates the cost of delaying the investment start
 */
export function calculateDelayCost(
  monthlyAmount: number,
  expectedReturnRate: number,
  originalHorizonYears: number
): Array<{
  delayYears: number;
  finalCorpus: number;
  wealthLoss: number;
  percentageLoss: number;
  catchUpSIPRequired: number;
}> {
  const baseResult = calculateSIP({
    monthlyInvestment: monthlyAmount,
    expectedReturnRate,
    timeHorizonYears: originalHorizonYears,
    initialLumpsum: 0,
    stepUpEnabled: false,
    stepUpType: 'percentage',
    stepUpValue: 0,
    adjustInflation: false,
    inflationRate: 0,
    estimateTax: false,
    taxRate: 0,
  });

  const baseCorpus = baseResult.maturityValue;
  const delayOptions = [1, 2, 3, 5, 10].filter((d) => d < originalHorizonYears);

  return delayOptions.map((delay) => {
    const remainingYears = originalHorizonYears - delay;
    const delayedResult = calculateSIP({
      monthlyInvestment: monthlyAmount,
      expectedReturnRate,
      timeHorizonYears: remainingYears,
      initialLumpsum: 0,
      stepUpEnabled: false,
      stepUpType: 'percentage',
      stepUpValue: 0,
      adjustInflation: false,
      inflationRate: 0,
      estimateTax: false,
      taxRate: 0,
    });

    const wealthLoss = Math.max(0, baseCorpus - delayedResult.maturityValue);
    const percentageLoss = baseCorpus > 0 ? (wealthLoss / baseCorpus) * 100 : 0;

    // What monthly SIP would they now need in the remaining years to match baseCorpus?
    const catchUp = calculateRequiredSIP(baseCorpus, expectedReturnRate, remainingYears);

    return {
      delayYears: delay,
      finalCorpus: delayedResult.maturityValue,
      wealthLoss,
      percentageLoss: Math.round(percentageLoss),
      catchUpSIPRequired: catchUp.requiredMonthlySIP,
    };
  });
}

/**
 * Generate CSV data string for download
 */
export function exportYearlyToCSV(yearlyData: YearBreakdown[], currencyCode: string): string {
  const headers = [
    'Year',
    `Monthly Investment (${currencyCode})`,
    `Annual Investment (${currencyCode})`,
    `Total Invested (${currencyCode})`,
    `Interest Earned in Year (${currencyCode})`,
    `Cumulative Interest (${currencyCode})`,
    `Nominal Balance (${currencyCode})`,
    `Inflation Adjusted (${currencyCode})`,
    `Post-Tax Balance (${currencyCode})`,
  ];

  const rows = yearlyData.map((row) => [
    row.year,
    row.monthlyInvestment,
    row.annualInvestment,
    row.totalInvested,
    row.interestEarnedYear,
    row.totalInterestEarned,
    row.endingBalance,
    row.inflationAdjustedBalance,
    row.taxAdjustedBalance,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
