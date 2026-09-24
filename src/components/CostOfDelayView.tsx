import { AlertTriangle, Clock, FastForward, TrendingDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CurrencyCode } from '../types/sip';
import { calculateDelayCost, calculateSIP } from '../utils/calculator';
import { CURRENCIES, formatCurrency } from '../utils/currencies';

interface CostOfDelayViewProps {
  currency: CurrencyCode;
}

export const CostOfDelayView: React.FC<CostOfDelayViewProps> = ({ currency }) => {
  const currencyConfig = CURRENCIES[currency];

  const [monthlyAmount, setMonthlyAmount] = useState(
    currency === 'INR' ? 10000 : 500
  );
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [horizonYears, setHorizonYears] = useState(20);

  const baseResult = useMemo(() => {
    return calculateSIP({
      monthlyInvestment: monthlyAmount,
      expectedReturnRate: expectedReturn,
      timeHorizonYears: horizonYears,
      initialLumpsum: 0,
      stepUpEnabled: false,
      stepUpType: 'percentage',
      stepUpValue: 0,
      adjustInflation: false,
      inflationRate: 0,
      estimateTax: false,
      taxRate: 0,
    });
  }, [monthlyAmount, expectedReturn, horizonYears]);

  const delayRows = useMemo(() => {
    return calculateDelayCost(monthlyAmount, expectedReturn, horizonYears);
  }, [monthlyAmount, expectedReturn, horizonYears]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          The Cost of Delay Calculator
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Compounding Time-Penalty Analysis</span>
          <span aria-hidden="true">·</span>
          <span>Inaction Opportunity Cost</span>
          <span aria-hidden="true">·</span>
          <span>Catch-Up Inflow Modeling</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:grid-cols-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700">Planned Monthly SIP</label>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(monthlyAmount, currency)}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={currency === 'INR' ? 100000 : 5000}
            step={currency === 'INR' ? 500 : 50}
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            className="mt-2 h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700">Expected Annual Return</label>
            <span className="font-mono font-bold text-slate-900">{expectedReturn}% p.a.</span>
          </div>
          <input
            type="range"
            min={4}
            max={25}
            step={0.5}
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="mt-2 h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700">Investment Horizon</label>
            <span className="font-mono font-bold text-slate-900">{horizonYears} Years</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={horizonYears}
            onChange={(e) => setHorizonYears(Number(e.target.value))}
            className="mt-2 h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Baseline Hero: Starting Today */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Baseline Benchmark: Starting Today
              </span>
              <div className="font-mono text-2xl font-black text-slate-900 tabular-nums sm:text-3xl">
                {formatCurrency(baseResult.maturityValue, currency)}
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-500">Total Capital Contributed:</div>
            <div className="font-mono font-bold text-slate-800 tabular-nums">
              {formatCurrency(baseResult.totalInvested, currency)}
            </div>
            <div className="text-[11px] font-medium text-emerald-700">
              +{formatCurrency(baseResult.totalReturns, currency)} Compound Profit
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Penalties of Inaction: What Waiting Costs You
          </h3>
          <p className="text-xs text-slate-500">
            The mathematical impact on your retirement corpus if you postpone starting
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Delay Period</th>
                <th className="py-3 px-4 text-right">Remaining Years</th>
                <th className="py-3 px-4 text-right">Achievable Corpus</th>
                <th className="py-3 px-4 text-right">Permanent Wealth Loss</th>
                <th className="py-3 px-4 text-right">Loss %</th>
                <th className="py-3 px-4 text-right">Catch-Up SIP Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delayRows.map((row) => (
                <tr key={row.delayYears} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Delay by {row.delayYears} {row.delayYears === 1 ? 'Year' : 'Years'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                    {horizonYears - row.delayYears} yrs
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                    {formatCurrency(row.finalCorpus, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                    −{formatCurrency(row.wealthLoss, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-600 tabular-nums">
                    −{row.percentageLoss}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-900 border border-amber-200">
                      {formatCurrency(row.catchUpSIPRequired, currency)} / mo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytical Callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold">The Exponential Compounding Rule</h4>
            <p className="leading-relaxed">
              In compound interest, the final 5 years of an investment typically account for over 50%
              of the entire wealth accumulated. Postponing your start by even 3 years doesn't just
              cost you 36 months of deposits—it permanently amputates the most lucrative final
              growth cycles from your financial future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
