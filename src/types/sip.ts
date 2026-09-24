export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  defaultMonthly: number;
  defaultTarget: number;
}

export type RiskProfile = 'conservative' | 'balanced' | 'growth' | 'aggressive';

export interface SIPInputs {
  monthlyInvestment: number;
  expectedReturnRate: number; // percentage annual, e.g. 12
  timeHorizonYears: number;
  initialLumpsum: number;
  stepUpEnabled: boolean;
  stepUpType: 'percentage' | 'fixed';
  stepUpValue: number; // e.g. 10% or 100
  adjustInflation: boolean;
  inflationRate: number; // percentage annual, e.g. 6
  estimateTax: boolean;
  taxRate: number; // percentage, e.g. 12.5
}

export interface YearBreakdown {
  year: number;
  monthlyInvestment: number;
  annualInvestment: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalInterestEarned: number;
  endingBalance: number;
  inflationAdjustedBalance: number;
  taxAdjustedBalance: number;
}

export interface MonthBreakdown {
  month: number;
  year: number;
  monthlyDeposit: number;
  interestEarned: number;
  cumulativeInvested: number;
  cumulativeBalance: number;
}

export interface SIPCalculationResult {
  totalInvested: number;
  totalReturns: number;
  maturityValue: number;
  realPurchasingPower: number; // after inflation
  postTaxMaturityValue: number; // after tax on gains
  wealthMultiplier: number;
  crossoverYear: number | null; // year when yearly returns > yearly deposits
  yearlyBreakdown: YearBreakdown[];
  monthlyBreakdown: MonthBreakdown[];
}

export type SIPCategory = 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Flexi Cap' | 'Index / ETF' | 'International' | 'Debt / Bonds' | 'Hybrid / Balanced' | 'Gold / Commodities';

export interface ActiveSIPItem {
  id: string;
  name: string;
  category: SIPCategory;
  monthlyAmount: number;
  startDate: string; // YYYY-MM
  debitDay: number; // 1-28
  expectedReturn: number;
  targetYears: number;
  stepUpAnnualPercent: number;
  goalTag?: string;
  isActive: boolean;
  notes?: string;
}

export interface GoalPlan {
  id: string;
  title: string;
  targetAmount: number;
  targetYears: number;
  expectedReturn: number;
  inflationAdjusted: boolean;
  inflationRate: number;
  category: 'retirement' | 'house' | 'education' | 'car' | 'wealth' | 'custom';
}
