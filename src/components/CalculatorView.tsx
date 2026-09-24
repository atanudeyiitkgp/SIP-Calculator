import {
  ArrowUpRight,
  Flame,
  HelpCircle,
  Percent,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { CurrencyCode, SIPCalculationResult, SIPInputs } from '../types/sip';
import { CURRENCIES, formatCurrency, formatNumber } from '../utils/currencies';
import { AmortizationTable } from './AmortizationTable';
import { BreakdownDonut } from './BreakdownDonut';
import { GrowthChart } from './GrowthChart';

interface CalculatorViewProps {
  currency: CurrencyCode;
  inputs: SIPInputs;
  setInputs: React.Dispatch<React.SetStateAction<SIPInputs>>;
  result: SIPCalculationResult;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  currency,
  inputs,
  setInputs,
  result,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currencyConfig = CURRENCIES[currency];

  const presets = [
    { label: 'Defensive (8%)', rate: 8, desc: 'Bonds & Balanced Advantage' },
    { label: 'Index / Large Cap (12%)', rate: 12, desc: 'Nifty 50 / S&P 500' },
    { label: 'High Growth (15%)', rate: 15, desc: 'Mid & Small Cap Equities' },
    { label: 'Aggressive (18%)', rate: 18, desc: 'Tech & Emerging Markets' },
  ];

  const horizonPresets = [5, 10, 15, 20, 25, 30];

  const handleMonthlyChange = (val: number) => {
    setInputs((prev) => ({ ...prev, monthlyInvestment: Math.max(10, Math.min(10000000, val)) }));
  };

  const handleRateChange = (val: number) => {
    setInputs((prev) => ({ ...prev, expectedReturnRate: Math.max(1, Math.min(35, val)) }));
  };

  const handleYearsChange = (val: number) => {
    setInputs((prev) => ({ ...prev, timeHorizonYears: Math.max(1, Math.min(40, val)) }));
  };

  // Step calculations for slider bounds
  const maxMonthly = currency === 'INR' ? 500000 : 25000;
  const monthlyStep = currency === 'INR' ? 500 : 25;

  return (
    <div className="space-y-6">
      {/* Top Header intro with quiet text */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Systematic Investment Plan Calculator
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Compound Interest Modeling</span>
          <span aria-hidden="true">·</span>
          <span>Annual Step-Up Simulation</span>
          <span aria-hidden="true">·</span>
          <span>Inflation & Tax Adjusted</span>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Projections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Inputs (5 cols on lg) */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-sm font-semibold tracking-tight text-slate-900">
              Investment Parameters
            </h2>

            {/* Monthly Investment */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="monthly-amount" className="font-medium text-slate-700">
                  Monthly Contribution
                </label>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm font-semibold text-slate-900 focus-within:border-emerald-500">
                  <span className="mr-1 text-slate-500">{currencyConfig.symbol}</span>
                  <input
                    id="monthly-amount"
                    type="number"
                    min={10}
                    max={10000000}
                    step={monthlyStep}
                    value={inputs.monthlyInvestment}
                    onChange={(e) => handleMonthlyChange(Number(e.target.value) || 0)}
                    className="w-24 bg-transparent text-right font-mono text-sm font-bold text-slate-900 outline-none tabular-nums"
                  />
                </div>
              </div>

              <input
                type="range"
                min={10}
                max={maxMonthly}
                step={monthlyStep}
                value={inputs.monthlyInvestment}
                onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{currencyConfig.symbol}10</span>
                <span>{formatCurrency(maxMonthly / 2, currency, true)}</span>
                <span>{formatCurrency(maxMonthly, currency, true)}+</span>
              </div>
            </div>

            {/* Expected Annual Rate of Return */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span>Expected Return Rate (p.a.)</span>
                </div>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm font-semibold text-slate-900 focus-within:border-emerald-500">
                  <input
                    type="number"
                    min={1}
                    max={35}
                    step={0.5}
                    value={inputs.expectedReturnRate}
                    onChange={(e) => handleRateChange(Number(e.target.value) || 0)}
                    className="w-14 bg-transparent text-right font-mono text-sm font-bold text-slate-900 outline-none tabular-nums"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={inputs.expectedReturnRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
              />

              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
                {presets.map((p) => {
                  const isSelected = inputs.expectedReturnRate === p.rate;
                  return (
                    <button
                      key={p.rate}
                      type="button"
                      onClick={() => handleRateChange(p.rate)}
                      title={p.desc}
                      className={`rounded-lg border px-2 py-1 text-center transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono text-xs tabular-nums">{p.rate}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Horizon */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-700">Investment Horizon</label>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-sm font-semibold text-slate-900 focus-within:border-emerald-500">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={inputs.timeHorizonYears}
                    onChange={(e) => handleYearsChange(Number(e.target.value) || 0)}
                    className="w-12 bg-transparent text-right font-mono text-sm font-bold text-slate-900 outline-none tabular-nums"
                  />
                  <span className="ml-1 text-slate-500">Years</span>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={inputs.timeHorizonYears}
                onChange={(e) => handleYearsChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
              />

              {/* Horizon quick chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {horizonPresets.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearsChange(yr)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-mono transition-colors ${
                      inputs.timeHorizonYears === yr
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {yr}y
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  <span>Advanced Parameters (Step-Up, Inflation, Tax)</span>
                </div>
                <span className="text-slate-400 font-mono">{showAdvanced ? '−' : '+'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 rounded-lg bg-slate-50 p-3.5 text-xs">
                  {/* Initial Lumpsum */}
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Initial Starting Corpus (Optional Lumpsum)</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                      <span className="mr-1 text-slate-500 font-mono">{currencyConfig.symbol}</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={inputs.initialLumpsum}
                        onChange={(e) =>
                          setInputs((p) => ({ ...p, initialLumpsum: Math.max(0, Number(e.target.value) || 0) }))
                        }
                        className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 outline-none tabular-nums"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Step-Up SIP */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">Annual Step-Up (Top-Up)</span>
                        <p className="text-[11px] text-slate-500">Automatically increase contribution annually</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={inputs.stepUpEnabled}
                        onChange={(e) =>
                          setInputs((p) => ({ ...p, stepUpEnabled: e.target.checked }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {inputs.stepUpEnabled && (
                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value={inputs.stepUpType}
                          onChange={(e) =>
                            setInputs((p) => ({
                              ...p,
                              stepUpType: e.target.value as 'percentage' | 'fixed',
                            }))
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
                        >
                          <option value="percentage">Annual % Increase</option>
                          <option value="fixed">Fixed Amount ({currencyConfig.symbol})</option>
                        </select>

                        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs">
                          <input
                            type="number"
                            min={1}
                            max={inputs.stepUpType === 'percentage' ? 50 : 100000}
                            value={inputs.stepUpValue}
                            onChange={(e) =>
                              setInputs((p) => ({ ...p, stepUpValue: Number(e.target.value) || 0 }))
                            }
                            className="w-16 bg-transparent text-right font-semibold text-slate-800 outline-none tabular-nums"
                          />
                          <span className="ml-1 text-slate-500 font-mono">
                            {inputs.stepUpType === 'percentage' ? '%' : currencyConfig.symbol}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inflation Adjustment */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">Inflation Discounting</span>
                        <p className="text-[11px] text-slate-500">Calculate real purchasing power</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={inputs.adjustInflation}
                        onChange={(e) =>
                          setInputs((p) => ({ ...p, adjustInflation: e.target.checked }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {inputs.adjustInflation && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-600">Expected Annual Inflation:</span>
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs">
                          <input
                            type="number"
                            min={1}
                            max={15}
                            step={0.5}
                            value={inputs.inflationRate}
                            onChange={(e) =>
                              setInputs((p) => ({ ...p, inflationRate: Number(e.target.value) || 0 }))
                            }
                            className="w-12 bg-transparent text-right font-semibold text-slate-800 outline-none tabular-nums"
                          />
                          <span className="ml-1 text-slate-500">%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capital Gains Tax */}
                  <div className="space-y-2 border-t border-slate-200/60 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">Capital Gains Tax</span>
                        <p className="text-[11px] text-slate-500">Estimate post-tax net maturity corpus</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={inputs.estimateTax}
                        onChange={(e) =>
                          setInputs((p) => ({ ...p, estimateTax: e.target.checked }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    {inputs.estimateTax && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-600">Long-Term Gains Tax Rate:</span>
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            step={0.5}
                            value={inputs.taxRate}
                            onChange={(e) =>
                              setInputs((p) => ({ ...p, taxRate: Number(e.target.value) || 0 }))
                            }
                            className="w-12 bg-transparent text-right font-semibold text-slate-800 outline-none tabular-nums"
                          />
                          <span className="ml-1 text-slate-500">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compound Interest Callout / Inflection Point */}
          {result.crossoverYear && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-950">
                    Compounding Inflection Point: Year {result.crossoverYear}
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                    By <strong>Year {result.crossoverYear}</strong>, the compound interest generated
                    every single year exceeds your entire fresh annual deposit! From that moment on,
                    your money earns more than you put in.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hero KPI Cards & Visual Graphs (7 cols on lg) */}
        <div className="space-y-6 lg:col-span-7">
          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Projected Maturity</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
                {formatCurrency(result.maturityValue, currency)}
              </div>
              <span className="mt-0.5 inline-block text-[11px] text-emerald-600 font-medium">
                {result.wealthMultiplier}x Principal
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Total Invested</span>
              <div className="mt-1 font-mono text-lg font-semibold text-slate-700 tabular-nums sm:text-xl">
                {formatCurrency(result.totalInvested, currency)}
              </div>
              <span className="mt-0.5 inline-block text-[11px] text-slate-400">
                {inputs.timeHorizonYears * 12} Installments
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Estimated Returns</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 tabular-nums sm:text-xl">
                +{formatCurrency(result.totalReturns, currency)}
              </div>
              <span className="mt-0.5 inline-block text-[11px] text-emerald-600 font-medium">
                +{Math.round((result.totalReturns / Math.max(1, result.totalInvested)) * 100)}% Gain
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">
                {inputs.adjustInflation ? 'Real Value (Inflation)' : inputs.estimateTax ? 'Post-Tax Corpus' : 'Annual Inflow'}
              </span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-800 tabular-nums sm:text-xl">
                {inputs.adjustInflation
                  ? formatCurrency(result.realPurchasingPower, currency)
                  : inputs.estimateTax
                  ? formatCurrency(result.postTaxMaturityValue, currency)
                  : formatCurrency(inputs.monthlyInvestment * 12, currency)}
              </div>
              <span className="mt-0.5 inline-block text-[11px] text-slate-400">
                {inputs.adjustInflation
                  ? `At ${inputs.inflationRate}% Inflation`
                  : inputs.estimateTax
                  ? `At ${inputs.taxRate}% Tax`
                  : 'Annualized Deposit'}
              </span>
            </div>
          </div>

          {/* Visual Trajectory Chart */}
          <GrowthChart
            data={result.yearlyBreakdown}
            currency={currency}
            showInflation={inputs.adjustInflation}
          />

          {/* Breakdown Donut & Quick Insights side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BreakdownDonut
              totalInvested={result.totalInvested}
              totalReturns={result.totalReturns}
              maturityValue={result.maturityValue}
              currency={currency}
            />

            {/* Compounding Multipliers & Milestones Card */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Compounding Milestones</h3>
                <p className="text-xs text-slate-500">Key benchmarks reached across tenure</p>
              </div>

              <div className="my-3 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Wealth Multiplier:</span>
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">
                    {result.wealthMultiplier}x your invested money
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">10-Year Estimated Corpus:</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {result.yearlyBreakdown.length >= 10
                      ? formatCurrency(result.yearlyBreakdown[9].endingBalance, currency)
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">20-Year Estimated Corpus:</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {result.yearlyBreakdown.length >= 20
                      ? formatCurrency(result.yearlyBreakdown[19].endingBalance, currency)
                      : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Monthly Deposit at Year {inputs.timeHorizonYears}:</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(
                      result.yearlyBreakdown[result.yearlyBreakdown.length - 1]?.monthlyInvestment || inputs.monthlyInvestment,
                      currency
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
                Starting early allows compounding exponential curves to work their magic in later years.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      <AmortizationTable
        yearlyData={result.yearlyBreakdown}
        monthlyData={result.monthlyBreakdown}
        currency={currency}
        crossoverYear={result.crossoverYear}
        showInflation={inputs.adjustInflation}
        showTax={inputs.estimateTax}
      />
    </div>
  );
};
