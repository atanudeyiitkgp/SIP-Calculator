import { ActiveSIPItem } from '../types/sip';

const STORAGE_KEY = 'acuity_sip_portfolio_v1';

export const INITIAL_SAMPLE_PORTFOLIO: ActiveSIPItem[] = [
  {
    id: 'sip-1',
    name: 'Broad Market Equity Index Fund',
    category: 'Index / ETF',
    monthlyAmount: 350,
    startDate: '2023-01',
    debitDay: 5,
    expectedReturn: 12.5,
    targetYears: 15,
    stepUpAnnualPercent: 10,
    goalTag: 'Retirement Wealth',
    isActive: true,
    notes: 'Core foundation index tracking broad market performance with low expense ratio.',
  },
  {
    id: 'sip-2',
    name: 'Mid-Cap Growth Opportunities',
    category: 'Mid Cap',
    monthlyAmount: 200,
    startDate: '2023-06',
    debitDay: 10,
    expectedReturn: 14.0,
    targetYears: 12,
    stepUpAnnualPercent: 5,
    goalTag: 'Child Higher Education',
    isActive: true,
    notes: 'Alpha generation via high growth mid-market leaders.',
  },
  {
    id: 'sip-3',
    name: 'Global Tech & Innovation Fund',
    category: 'International',
    monthlyAmount: 150,
    startDate: '2024-01',
    debitDay: 15,
    expectedReturn: 13.5,
    targetYears: 10,
    stepUpAnnualPercent: 10,
    goalTag: 'House Downpayment',
    isActive: true,
    notes: 'Geographic diversification in global technology leaders.',
  },
  {
    id: 'sip-4',
    name: 'Dynamic Sovereign Bond Fund',
    category: 'Debt / Bonds',
    monthlyAmount: 100,
    startDate: '2023-03',
    debitDay: 20,
    expectedReturn: 7.2,
    targetYears: 8,
    stepUpAnnualPercent: 0,
    goalTag: 'Emergency Buffer',
    isActive: true,
    notes: 'Defensive asset allocation to minimize overall portfolio volatility.',
  },
];

export function getStoredPortfolio(): ActiveSIPItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PORTFOLIO));
      return INITIAL_SAMPLE_PORTFOLIO;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_PORTFOLIO;
  } catch (err) {
    console.error('Failed to load stored portfolio:', err);
    return INITIAL_SAMPLE_PORTFOLIO;
  }
}

export function saveStoredPortfolio(items: ActiveSIPItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save portfolio to localStorage:', err);
  }
}

/**
 * Calculates how many months have elapsed between a given YYYY-MM start date and current date
 */
export function getMonthsElapsed(startDateStr: string): number {
  if (!startDateStr) return 0;
  const [startYear, startMonth] = startDateStr.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const elapsed = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  return Math.max(1, elapsed);
}

/**
 * Compute current invested amount and estimated current value for an active SIP
 */
export function computeActiveSIPStatus(sip: ActiveSIPItem) {
  const monthsElapsed = getMonthsElapsed(sip.startDate);
  const monthlyRate = (sip.expectedReturn / 100) / 12;

  let totalContributed = 0;
  let currentEstimatedValuation = 0;
  let monthlyAmt = sip.monthlyAmount;

  for (let m = 1; m <= monthsElapsed; m++) {
    // If step-up applies annually
    if (m > 1 && (m - 1) % 12 === 0 && sip.stepUpAnnualPercent > 0) {
      monthlyAmt = monthlyAmt * (1 + sip.stepUpAnnualPercent / 100);
    }
    totalContributed += monthlyAmt;
    currentEstimatedValuation += monthlyAmt;
    currentEstimatedValuation += currentEstimatedValuation * monthlyRate;
  }

  // Future target projection for full targetYears
  const totalTargetMonths = sip.targetYears * 12;
  let projectedValuation = 0;
  let futureMonthlyAmt = sip.monthlyAmount;
  let projectedTotalContributed = 0;

  for (let m = 1; m <= totalTargetMonths; m++) {
    if (m > 1 && (m - 1) % 12 === 0 && sip.stepUpAnnualPercent > 0) {
      futureMonthlyAmt = futureMonthlyAmt * (1 + sip.stepUpAnnualPercent / 100);
    }
    projectedTotalContributed += futureMonthlyAmt;
    projectedValuation += futureMonthlyAmt;
    projectedValuation += projectedValuation * monthlyRate;
  }

  return {
    monthsElapsed,
    totalContributed: Math.round(totalContributed),
    currentEstimatedValuation: Math.round(currentEstimatedValuation),
    currentProfit: Math.round(Math.max(0, currentEstimatedValuation - totalContributed)),
    projectedTotalContributed: Math.round(projectedTotalContributed),
    projectedValuation: Math.round(projectedValuation),
    projectedProfit: Math.round(Math.max(0, projectedValuation - projectedTotalContributed)),
  };
}
