import React, { useId, useState } from 'react';
import { CurrencyCode, YearBreakdown } from '../types/sip';
import { formatCurrency } from '../utils/currencies';

interface GrowthChartProps {
  data: YearBreakdown[];
  currency: CurrencyCode;
  showInflation: boolean;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  currency,
  showInflation,
}) => {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
        No projection data available
      </div>
    );
  }

  // Determine bounds
  const maxBalance = Math.max(...data.map((d) => d.endingBalance), 1);
  const maxYear = data[data.length - 1].year;

  // Chart dimensions inside SVG coordinate system
  const width = 800;
  const height = 360;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (year: number) => {
    return paddingLeft + ((year - 1) / Math.max(1, maxYear - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxBalance) * chartHeight;
  };

  // Generate SVG path for endingBalance
  const balancePoints = data.map((d) => ({
    x: getX(d.year),
    y: getY(d.endingBalance),
  }));

  const investedPoints = data.map((d) => ({
    x: getX(d.year),
    y: getY(d.totalInvested),
  }));

  const inflationPoints = data.map((d) => ({
    x: getX(d.year),
    y: getY(d.inflationAdjustedBalance),
  }));

  const balanceLinePath = balancePoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const balanceAreaPath = `${balanceLinePath} L ${balancePoints[balancePoints.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${balancePoints[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  const investedLinePath = investedPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const investedAreaPath = `${investedLinePath} L ${investedPoints[investedPoints.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${investedPoints[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  const inflationLinePath = inflationPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  // Y-axis grid ticks (4 intervals)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: maxBalance * pct,
    y: paddingTop + chartHeight - pct * chartHeight,
  }));

  // X-axis step intervals
  const yearStep = maxYear <= 10 ? 1 : maxYear <= 25 ? 5 : 10;
  const xTicks = data.filter((d) => d.year === 1 || d.year % yearStep === 0 || d.year === maxYear);

  // Active data point for scrub tooltip
  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const activeX = activeItem ? getX(activeItem.year) : 0;
  const activeBalanceY = activeItem ? getY(activeItem.endingBalance) : 0;
  const activeInvestedY = activeItem ? getY(activeItem.totalInvested) : 0;

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Wealth Accumulation Trajectory</h3>
          <p className="text-xs text-slate-500">Projected portfolio growth over {maxYear} years</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Total Corpus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span>Invested Capital</span>
          </div>
          {showInflation && (
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-t-2 border-dashed border-amber-500" />
              <span>Real Value (Inflation Adj.)</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            if (mouseX >= paddingLeft && mouseX <= paddingLeft + chartWidth) {
              const fraction = (mouseX - paddingLeft) / chartWidth;
              const targetYear = Math.round(1 + fraction * (maxYear - 1));
              const idx = data.findIndex((d) => d.year === targetYear);
              if (idx !== -1) setHoveredIndex(idx);
            }
          }}
        >
          <defs>
            <linearGradient id={`${gradientId}-emerald`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={`${gradientId}-slate`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={paddingLeft + chartWidth}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="font-mono text-[10px] fill-slate-400 tabular-nums"
              >
                {formatCurrency(tick.value, currency, true)}
              </text>
            </g>
          ))}

          {/* Area under curves */}
          <path d={balanceAreaPath} fill={`url(#${gradientId}-emerald)`} />
          <path d={investedAreaPath} fill={`url(#${gradientId}-slate)`} />

          {/* Stroke curves */}
          <path
            d={investedLinePath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={balanceLinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {showInflation && (
            <path
              d={inflationLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* X Axis line & labels */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={paddingLeft + chartWidth}
            y2={paddingTop + chartHeight}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          {xTicks.map((d) => (
            <g key={d.year}>
              <line
                x1={getX(d.year)}
                y1={paddingTop + chartHeight}
                x2={getX(d.year)}
                y2={paddingTop + chartHeight + 4}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={getX(d.year)}
                y={paddingTop + chartHeight + 18}
                textAnchor="middle"
                className="font-mono text-[10px] fill-slate-500 tabular-nums"
              >
                Yr {d.year}
              </text>
            </g>
          ))}

          {/* Active indicator hairline */}
          {activeItem && (
            <g>
              <line
                x1={activeX}
                y1={paddingTop}
                x2={activeX}
                y2={paddingTop + chartHeight}
                stroke="#0f172a"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              {/* Point on Balance line */}
              <circle
                cx={activeX}
                cy={activeBalanceY}
                r="4.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Point on Invested line */}
              <circle
                cx={activeX}
                cy={activeInvestedY}
                r="4"
                fill="#64748b"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Scrub tooltip display */}
      {activeItem && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">Year {activeItem.year} Milestone</span>
            <span className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
              {formatCurrency(activeItem.endingBalance, currency)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">Invested Capital</span>
            <span className="font-mono text-sm font-semibold text-slate-600 tabular-nums">
              {formatCurrency(activeItem.totalInvested, currency)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">Est. Growth Gain</span>
            <span className="font-mono text-sm font-semibold text-emerald-600 tabular-nums">
              +{formatCurrency(activeItem.totalInterestEarned, currency)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">Annual Interest Earned</span>
            <span className="font-mono text-sm font-semibold text-teal-600 tabular-nums">
              {formatCurrency(activeItem.interestEarnedYear, currency)}/yr
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
