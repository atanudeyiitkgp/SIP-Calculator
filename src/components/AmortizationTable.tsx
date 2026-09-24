import { Download, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CurrencyCode, MonthBreakdown, YearBreakdown } from '../types/sip';
import { exportYearlyToCSV } from '../utils/calculator';
import { formatCurrency } from '../utils/currencies';

interface AmortizationTableProps {
  yearlyData: YearBreakdown[];
  monthlyData: MonthBreakdown[];
  currency: CurrencyCode;
  crossoverYear: number | null;
  showInflation: boolean;
  showTax: boolean;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  yearlyData,
  monthlyData,
  currency,
  crossoverYear,
  showInflation,
  showTax,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'yearly' ? 15 : 24;

  const handleDownloadCSV = () => {
    const csvContent = exportYearlyToCSV(yearlyData, currency);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SIP_Amortization_Schedule_${currency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredYearly = useMemo(() => {
    if (!searchQuery.trim()) return yearlyData;
    return yearlyData.filter((d) => d.year.toString().includes(searchQuery.trim()));
  }, [yearlyData, searchQuery]);

  const filteredMonthly = useMemo(() => {
    if (!searchQuery.trim()) return monthlyData;
    const q = searchQuery.trim();
    return monthlyData.filter(
      (d) => d.year.toString().includes(q) || d.month.toString().includes(q)
    );
  }, [monthlyData, searchQuery]);

  const displayedList = viewMode === 'yearly' ? filteredYearly : filteredMonthly;
  const totalPages = Math.ceil(displayedList.length / pageSize) || 1;
  const pagedItems = displayedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Compounding Schedule</h3>
          <p className="text-xs text-slate-500">
            Detailed ledger of contributions, interest accrual, and ending corpus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented view switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-medium">
            <button
              onClick={() => {
                setViewMode('yearly');
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly View
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={viewMode === 'yearly' ? 'Find year...' : 'Find month/year...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 w-32 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 sm:w-36"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCSV}
            title="Download CSV Spreadsheet"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        {viewMode === 'yearly' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Monthly SIP</th>
                <th className="py-2.5 px-3 text-right">Annual Deposit</th>
                <th className="py-2.5 px-3 text-right">Total Invested</th>
                <th className="py-2.5 px-3 text-right">Interest Earned (Yr)</th>
                <th className="py-2.5 px-3 text-right">Ending Corpus</th>
                {showInflation && (
                  <th className="py-2.5 px-3 text-right">Purchasing Power</th>
                )}
                {showTax && (
                  <th className="py-2.5 px-3 text-right">Post-Tax Value</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pagedItems as YearBreakdown[]).map((row) => {
                const isCrossover = crossoverYear === row.year;
                return (
                  <tr
                    key={row.year}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isCrossover ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>Year {row.year}</span>
                        {isCrossover && (
                          <span
                            title="Crossover Point: Annual interest earned surpasses your fresh deposits!"
                            className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded"
                          >
                            Inflection
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(row.monthlyInvestment, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(row.annualInvestment, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatCurrency(row.totalInvested, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-600">
                      +{formatCurrency(row.interestEarnedYear, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(row.endingBalance, currency)}
                    </td>
                    {showInflation && (
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700">
                        {formatCurrency(row.inflationAdjustedBalance, currency)}
                      </td>
                    )}
                    {showTax && (
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                        {formatCurrency(row.taxAdjustedBalance, currency)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Deposit</th>
                <th className="py-2.5 px-3 text-right">Interest This Month</th>
                <th className="py-2.5 px-3 text-right">Cumulative Invested</th>
                <th className="py-2.5 px-3 text-right">Total Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pagedItems as MonthBreakdown[]).map((row) => (
                <tr key={row.month} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900 tabular-nums">
                    M#{row.month}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">Year {row.year}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrency(row.monthlyDeposit, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-emerald-600">
                    +{formatCurrency(row.interestEarned, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    {formatCurrency(row.cumulativeInvested, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(row.cumulativeBalance, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, displayedList.length)} of {displayedList.length} rows
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-slate-200 px-2.5 py-1 text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-slate-200 px-2.5 py-1 text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
