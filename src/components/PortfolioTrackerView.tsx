import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  Filter,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ActiveSIPItem, CurrencyCode, SIPCategory } from '../types/sip';
import { CURRENCIES, formatCurrency } from '../utils/currencies';
import { computeActiveSIPStatus } from '../utils/portfolioStorage';

interface PortfolioTrackerViewProps {
  portfolio: ActiveSIPItem[];
  setPortfolio: React.Dispatch<React.SetStateAction<ActiveSIPItem[]>>;
  currency: CurrencyCode;
  onOpenAddSIP: () => void;
  onEditSIP: (item: ActiveSIPItem) => void;
}

const CATEGORIES: Array<SIPCategory | 'All'> = [
  'All',
  'Index / ETF',
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'International',
  'Debt / Bonds',
  'Hybrid / Balanced',
];

export const PortfolioTrackerView: React.FC<PortfolioTrackerViewProps> = ({
  portfolio,
  setPortfolio,
  currency,
  onOpenAddSIP,
  onEditSIP,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SIPCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoalTag, setSelectedGoalTag] = useState<string>('All');

  // Compute portfolio overall stats
  const portfolioStats = useMemo(() => {
    let totalMonthlyOutflow = 0;
    let totalInvestedToDate = 0;
    let currentValuation = 0;
    let projectedValuation = 0;
    let projectedContributions = 0;

    portfolio.forEach((sip) => {
      if (sip.isActive) {
        totalMonthlyOutflow += sip.monthlyAmount;
      }
      const status = computeActiveSIPStatus(sip);
      totalInvestedToDate += status.totalContributed;
      currentValuation += status.currentEstimatedValuation;
      if (sip.isActive) {
        projectedValuation += status.projectedValuation;
        projectedContributions += status.projectedTotalContributed;
      }
    });

    const currentProfit = Math.max(0, currentValuation - totalInvestedToDate);
    const returnPct = totalInvestedToDate > 0 ? (currentProfit / totalInvestedToDate) * 100 : 0;

    return {
      totalMonthlyOutflow,
      totalInvestedToDate,
      currentValuation,
      currentProfit,
      returnPct: Math.round(returnPct),
      projectedValuation,
      projectedContributions,
    };
  }, [portfolio]);

  // Unique Goal Tags
  const goalTags = useMemo(() => {
    const tags = new Set<string>();
    portfolio.forEach((item) => {
      if (item.goalTag?.trim()) tags.add(item.goalTag.trim());
    });
    return ['All', ...Array.from(tags)];
  }, [portfolio]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return portfolio.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchGoal = selectedGoalTag === 'All' || item.goalTag === selectedGoalTag;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.goalTag && item.goalTag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchGoal && matchSearch;
    });
  }, [portfolio, selectedCategory, selectedGoalTag, searchQuery]);

  const handleToggleActive = (id: string) => {
    setPortfolio((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setPortfolio((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Export Portfolio JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AcuitySIP_Portfolio_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Portfolio JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setPortfolio(parsed);
          alert('Portfolio imported successfully!');
        } else {
          alert('Invalid portfolio file format.');
        }
      } catch {
        alert('Failed to parse portfolio file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Active Investment Portfolio
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{portfolio.length} Tracked Funds</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Valuation Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Automated Debit Calendar</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import / Export JSON buttons */}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={onOpenAddSIP}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add SIP</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Monthly SIP Outflow</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
            {formatCurrency(portfolioStats.totalMonthlyOutflow, currency)}
          </div>
          <span className="text-[11px] text-slate-400">
            {portfolio.filter((p) => p.isActive).length} active systematic debits
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Capital Invested to Date</span>
          <div className="mt-1 font-mono text-lg font-semibold text-slate-700 tabular-nums sm:text-xl">
            {formatCurrency(portfolioStats.totalInvestedToDate, currency)}
          </div>
          <span className="text-[11px] text-slate-400">Calculated from start dates</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Estimated Current Value</span>
          <div className="mt-1 font-mono text-lg font-bold text-emerald-600 tabular-nums sm:text-xl">
            {formatCurrency(portfolioStats.currentValuation, currency)}
          </div>
          <span className="text-[11px] font-medium text-emerald-600">
            +{formatCurrency(portfolioStats.currentProfit, currency)} ({portfolioStats.returnPct}%)
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Projected Maturity Value</span>
          <div className="mt-1 font-mono text-lg font-bold text-slate-800 tabular-nums sm:text-xl">
            {formatCurrency(portfolioStats.projectedValuation, currency)}
          </div>
          <span className="text-[11px] text-slate-400">Target tenure sum</span>
        </div>
      </div>

      {/* Monthly Debit Calendar Alert Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Monthly Payment Schedule (Debit Dates)</span>
          </div>
          <span className="text-[11px] text-slate-400">Auto-debits occur monthly</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
            const debitsOnDay = portfolio.filter((p) => p.isActive && p.debitDay === day);
            const totalOnDay = debitsOnDay.reduce((sum, item) => sum + item.monthlyAmount, 0);

            if (debitsOnDay.length === 0) return null;

            return (
              <div
                key={day}
                className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-700">Day {day}</span>
                  <span className="rounded bg-emerald-100 px-1 py-0.2 text-[10px] font-bold text-emerald-700">
                    {debitsOnDay.length} SIP
                  </span>
                </div>
                <span className="mt-1 font-mono font-bold text-slate-900 tabular-nums">
                  {formatCurrency(totalOnDay, currency)}
                </span>
                <span className="truncate text-[10px] text-slate-500">
                  {debitsOnDay.map((d) => d.name).join(', ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search funds or goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 sm:w-56"
            />
          </div>
        </div>

        {/* Goal Tag filter if tags exist */}
        {goalTags.length > 2 && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
            <Tag className="h-3 w-3 text-slate-400" />
            <span>Filter by Target Goal:</span>
            <div className="flex flex-wrap gap-1.5">
              {goalTags.map((gt) => (
                <button
                  key={gt}
                  onClick={() => setSelectedGoalTag(gt)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    selectedGoalTag === gt
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {gt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SIP List Table / Cards */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Layers className="h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">No investment plans found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchQuery
                ? 'Try adjusting your search query or filters.'
                : 'Start tracking your monthly mutual fund or ETF SIPs.'}
            </p>
            <button
              onClick={onOpenAddSIP}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First SIP</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const status = computeActiveSIPStatus(item);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between ${
                    !item.isActive ? 'opacity-60 bg-slate-50/30' : ''
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600">{item.category}</span>
                      {item.goalTag && (
                        <>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-emerald-700 font-medium">{item.goalTag}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Started {item.startDate} ({status.monthsElapsed} mos)</span>
                      <span aria-hidden="true">·</span>
                      <span>Debits on Day {item.debitDay}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.expectedReturn}% p.a.</span>
                      {item.stepUpAnnualPercent > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>+{item.stepUpAnnualPercent}% Annual Step-Up</span>
                        </>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right Financial Metrics */}
                  <div className="flex flex-wrap items-center gap-6 sm:justify-end">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Monthly Inflow</span>
                      <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatCurrency(item.monthlyAmount, currency)}
                      </div>
                      <span className="text-[10px] text-slate-400">/month</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Invested to Date</span>
                      <div className="font-mono text-sm font-semibold text-slate-700 tabular-nums">
                        {formatCurrency(status.totalContributed, currency)}
                      </div>
                      <span className="text-[10px] text-slate-400">{status.monthsElapsed} mos</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Current Valuation</span>
                      <div className="font-mono text-sm font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(status.currentEstimatedValuation, currency)}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        +{formatCurrency(status.currentProfit, currency)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        title={item.isActive ? 'Pause SIP' : 'Resume SIP'}
                        className={`rounded-lg p-1.5 transition-colors ${
                          item.isActive
                            ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {item.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onEditSIP(item)}
                        title="Edit SIP Details"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Delete SIP"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
