import React from 'react';
import { CurrencyCode } from '../types/sip';
import { formatCurrency } from '../utils/currencies';

interface BreakdownDonutProps {
  totalInvested: number;
  totalReturns: number;
  maturityValue: number;
  currency: CurrencyCode;
}

export const BreakdownDonut: React.FC<BreakdownDonutProps> = ({
  totalInvested,
  totalReturns,
  maturityValue,
  currency,
}) => {
  const safeTotal = Math.max(1, maturityValue);
  const investedPct = Math.round((totalInvested / safeTotal) * 100);
  const returnsPct = Math.max(0, 100 - investedPct);

  // SVG circular calculations
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const investedStrokeDashoffset = circumference * (1 - totalInvested / safeTotal);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Capital vs Wealth Gain</h3>
        <p className="text-xs text-slate-500">Distribution of final maturity corpus</p>
      </div>

      <div className="my-4 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90 transform">
            {/* Background / Returns circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#10b981" // emerald
              strokeWidth={strokeWidth}
            />
            {/* Invested portion */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#94a3b8" // slate
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={investedStrokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {returnsPct}%
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
              Wealth Gain
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-600">Invested Capital</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-medium text-slate-700 tabular-nums">
              {formatCurrency(totalInvested, currency)}
            </span>
            <span className="ml-1 text-[11px] text-slate-400">({investedPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Compound Returns</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-semibold text-emerald-600 tabular-nums">
              {formatCurrency(totalReturns, currency)}
            </span>
            <span className="ml-1 text-[11px] text-emerald-600/70">({returnsPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
