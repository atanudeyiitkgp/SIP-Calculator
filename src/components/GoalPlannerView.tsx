import {
  Briefcase,
  Car,
  CheckCircle,
  GraduationCap,
  Home,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ActiveSIPItem, CurrencyCode } from '../types/sip';
import { calculateRequiredSIP } from '../utils/calculator';
import { CURRENCIES, formatCurrency, formatNumber } from '../utils/currencies';

interface GoalPlannerViewProps {
  currency: CurrencyCode;
  onAddGoalToPortfolio: (sip: ActiveSIPItem) => void;
}

export const GoalPlannerView: React.FC<GoalPlannerViewProps> = ({
  currency,
  onAddGoalToPortfolio,
}) => {
  const currencyConfig = CURRENCIES[currency];

  const presets = [
    {
      id: 'retirement',
      title: 'Retirement & FIRE',
      icon: Briefcase,
      defaultTarget: currency === 'INR' ? 20000000 : 1000000,
      defaultYears: 20,
      expectedReturn: 12,
      desc: 'Build financial independence to live off dividends & capital.',
    },
    {
      id: 'house',
      title: 'Home Downpayment',
      icon: Home,
      defaultTarget: currency === 'INR' ? 4000000 : 200000,
      defaultYears: 7,
      expectedReturn: 11,
      desc: 'Accumulate equity for mortgage downpayment without debt stress.',
    },
    {
      id: 'education',
      title: 'Child Higher Education',
      icon: GraduationCap,
      defaultTarget: currency === 'INR' ? 5000000 : 250000,
      defaultYears: 12,
      expectedReturn: 13,
      desc: 'Secure university tuition and living costs for future scholars.',
    },
    {
      id: 'wealth',
      title: 'Wealth Acceleration',
      icon: ShieldCheck,
      defaultTarget: currency === 'INR' ? 10000000 : 500000,
      defaultYears: 15,
      expectedReturn: 13.5,
      desc: 'Build a multi-generational sovereign family safety cushion.',
    },
    {
      id: 'car',
      title: 'Dream Automobile',
      icon: Car,
      defaultTarget: currency === 'INR' ? 2500000 : 80000,
      defaultYears: 4,
      expectedReturn: 10,
      desc: 'Cash purchase for luxury vehicle avoiding expensive car loans.',
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string>('retirement');
  const [goalName, setGoalName] = useState('Retirement & FIRE');
  const [targetAmount, setTargetAmount] = useState(
    currency === 'INR' ? 20000000 : 1000000
  );
  const [targetYears, setTargetYears] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [adjustInflation, setAdjustInflation] = useState(true);
  const [inflationRate, setInflationRate] = useState(6);
  const [addedMessage, setAddedMessage] = useState(false);

  const selectPreset = (p: typeof presets[0]) => {
    setSelectedPreset(p.id);
    setGoalName(p.title);
    setTargetAmount(p.defaultTarget);
    setTargetYears(p.defaultYears);
    setExpectedReturn(p.expectedReturn);
  };

  const calculation = useMemo(() => {
    return calculateRequiredSIP(
      targetAmount,
      expectedReturn,
      targetYears,
      adjustInflation,
      inflationRate
    );
  }, [targetAmount, expectedReturn, targetYears, adjustInflation, inflationRate]);

  const handleAddToPortfolio = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const newSIP: ActiveSIPItem = {
      id: `goal-sip-${Date.now()}`,
      name: `${goalName} Target SIP`,
      category: 'Index / ETF',
      monthlyAmount: calculation.requiredMonthlySIP,
      startDate: currentMonth,
      debitDay: 5,
      expectedReturn: expectedReturn,
      targetYears: targetYears,
      stepUpAnnualPercent: 10,
      goalTag: goalName,
      isActive: true,
      notes: `Targeting ${formatCurrency(targetAmount, currency)} in ${targetYears} years.`,
    };

    onAddGoalToPortfolio(newSIP);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reverse SIP & Goal Planner
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Target-Based Financial Planning</span>
          <span aria-hidden="true">·</span>
          <span>Reverse Compound Engineering</span>
          <span aria-hidden="true">·</span>
          <span>Step-Up Optimization</span>
        </div>
      </div>

      {/* Preset Goal Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {presets.map((p) => {
          const isSelected = selectedPreset === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`rounded-lg p-2 ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-2 font-semibold text-xs text-slate-900">{p.title}</span>
              <span className="mt-0.5 text-[11px] text-slate-400 font-mono">
                {p.defaultYears} Years Horizon
              </span>
            </button>
          );
        })}
      </div>

      {/* Planner Controls and Output Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Inputs (5 cols) */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Define Target Objective
          </h2>

          <div>
            <label className="text-xs font-medium text-slate-700">Goal Title</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700">Target Corpus Needed</label>
              <span className="font-mono text-xs font-bold text-slate-900">
                {formatCurrency(targetAmount, currency)}
              </span>
            </div>
            <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white">
              <span className="mr-1 font-mono text-xs text-slate-400">{currencyConfig.symbol}</span>
              <input
                type="number"
                min={1000}
                step={currency === 'INR' ? 100000 : 5000}
                value={targetAmount}
                onChange={(e) => setTargetAmount(Math.max(1000, Number(e.target.value) || 0))}
                className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700">Time Horizon</label>
              <span className="font-mono text-xs font-bold text-slate-900">{targetYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={35}
              value={targetYears}
              onChange={(e) => setTargetYears(Number(e.target.value))}
              className="mt-1.5 h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700">Expected Annual Return</label>
              <span className="font-mono text-xs font-bold text-slate-900">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min={4}
              max={25}
              step={0.5}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="mt-1.5 h-1.5 w-full cursor-pointer accent-emerald-600 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Inflation Toggle */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-800">Adjust for Inflation</span>
                <p className="text-[11px] text-slate-500">Calculate future cost in today's dollars</p>
              </div>
              <input
                type="checkbox"
                checked={adjustInflation}
                onChange={(e) => setAdjustInflation(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {adjustInflation && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-[11px] text-slate-600">Expected Inflation Rate:</span>
                <div className="flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value) || 0)}
                    className="w-10 bg-transparent text-right font-semibold text-slate-900 outline-none tabular-nums"
                  />
                  <span className="ml-1 text-slate-400">%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Main Calculation Result Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-medium text-slate-500">
              Required Monthly Investment (Fixed SIP)
            </span>
            <div className="mt-1 font-mono text-3xl font-extrabold text-emerald-600 tabular-nums sm:text-4xl">
              {formatCurrency(calculation.requiredMonthlySIP, currency)}
              <span className="text-sm font-normal text-slate-500"> / month</span>
            </div>

            {adjustInflation && (
              <p className="mt-2 text-xs text-amber-700 leading-relaxed bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
                To maintain purchasing power of <strong>{formatCurrency(targetAmount, currency)}</strong>{' '}
                in {targetYears} years at {inflationRate}% inflation, your nominal target will be{' '}
                <strong>{formatCurrency(calculation.effectiveTarget, currency)}</strong>.
              </p>
            )}

            {/* Step-Up Supercharger alternative */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Pro Strategy: Start with 10% Annual Step-Up
                  </h4>
                  <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                    If you commit to increasing your SIP by just <strong>10% each year</strong> as
                    your salary grows, you can start today with only:
                  </p>
                  <div className="mt-2 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(calculation.requiredWith10PercentStepUp, currency)}
                    <span className="text-xs font-normal text-emerald-800">
                      {' '}
                      / month (45% lower starting burden!)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Capital Breakdown summary */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-slate-400">Total Capital Contributed:</span>
                <div className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
                  {formatCurrency(calculation.totalInvested, currency)}
                </div>
              </div>

              <div>
                <span className="text-slate-400">Compound Returns Generated:</span>
                <div className="mt-0.5 font-mono text-sm font-bold text-emerald-600 tabular-nums">
                  +{formatCurrency(calculation.wealthGain, currency)}
                </div>
              </div>

              <div>
                <span className="text-slate-400">Wealth Gain Ratio:</span>
                <div className="mt-0.5 font-mono text-sm font-bold text-slate-800 tabular-nums">
                  {calculation.totalInvested > 0
                    ? `${(calculation.effectiveTarget / calculation.totalInvested).toFixed(1)}x`
                    : '—'}
                </div>
              </div>
            </div>

            {/* Action button: Add to portfolio */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddToPortfolio}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Track This Goal in My Portfolio</span>
              </button>

              {addedMessage && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Goal successfully added to Portfolio Tracker!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
