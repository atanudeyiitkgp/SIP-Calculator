import { Check, Copy, Printer, X } from 'lucide-react';
import React, { useState } from 'react';
import { ActiveSIPItem, CurrencyCode, SIPCalculationResult, SIPInputs } from '../types/sip';
import { CURRENCIES, formatCurrency } from '../utils/currencies';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  inputs: SIPInputs;
  result: SIPCalculationResult;
  portfolio: ActiveSIPItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currency,
  inputs,
  result,
  portfolio,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `AcuitySIP Investment Report
----------------------------------------
Currency: ${currency}
Monthly Contribution: ${formatCurrency(inputs.monthlyInvestment, currency)}
Expected Return Rate: ${inputs.expectedReturnRate}% p.a.
Investment Horizon: ${inputs.timeHorizonYears} Years
Step-Up Enabled: ${inputs.stepUpEnabled ? `Yes (${inputs.stepUpValue}%)` : 'No'}

PROJECTIONS SUMMARY:
Total Capital Invested: ${formatCurrency(result.totalInvested, currency)}
Estimated Compound Returns: +${formatCurrency(result.totalReturns, currency)}
Projected Final Maturity Corpus: ${formatCurrency(result.maturityValue, currency)}
Wealth Multiplier: ${result.wealthMultiplier}x Principal
Compounding Inflection Year: ${result.crossoverYear ? `Year ${result.crossoverYear}` : 'N/A'}
Purchasing Power (Real Value): ${formatCurrency(result.realPurchasingPower, currency)}

PORTFOLIO OVERVIEW:
Total Tracked Funds: ${portfolio.length}
Total Active Outflow: ${formatCurrency(
      portfolio.filter((p) => p.isActive).reduce((acc, p) => acc + p.monthlyAmount, 0),
      currency
    )} / month
----------------------------------------
Generated via AcuitySIP Planner`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl print:max-h-none print:w-full print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Systematic Investment Report Summary
            </h3>
            <p className="text-xs text-slate-500">
              Printable portfolio projections and schedule digest
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Content Body */}
        <div className="space-y-6 text-xs text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AcuitySIP Wealth Blueprint</h2>
              <span className="text-[11px] text-slate-500">
                Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-semibold text-slate-700">
                Currency: {currency}
              </span>
            </div>
          </div>

          {/* Parameters grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Monthly SIP</span>
              <div className="font-bold text-slate-900">
                {formatCurrency(inputs.monthlyInvestment, currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Expected Rate</span>
              <div className="font-bold text-slate-900">{inputs.expectedReturnRate}% p.a.</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Duration</span>
              <div className="font-bold text-slate-900">{inputs.timeHorizonYears} Years</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Step-Up Rate</span>
              <div className="font-bold text-slate-900">
                {inputs.stepUpEnabled ? `+${inputs.stepUpValue}%/yr` : 'None'}
              </div>
            </div>
          </div>

          {/* Projections Key Findings */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <span className="text-slate-500 text-[11px]">Total Invested</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-800 tabular-nums">
                {formatCurrency(result.totalInvested, currency)}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-center">
              <span className="text-emerald-700 text-[11px]">Estimated Gains</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 tabular-nums">
                +{formatCurrency(result.totalReturns, currency)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-900 p-4 text-center text-white">
              <span className="text-slate-300 text-[11px]">Projected Maturity</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-400 tabular-nums">
                {formatCurrency(result.maturityValue, currency)}
              </div>
            </div>
          </div>

          {/* Milestones Snapshot */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">5-Year Growth Benchmarks</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
              {result.yearlyBreakdown
                .filter((d) => d.year % 5 === 0 || d.year === result.yearlyBreakdown.length)
                .slice(0, 4)
                .map((d) => (
                  <div key={d.year} className="rounded-lg border border-slate-200 p-2.5">
                    <span className="text-[10px] text-slate-500">Year {d.year}</span>
                    <div className="font-bold text-slate-800 tabular-nums">
                      {formatCurrency(d.endingBalance, currency)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Active Tracked Funds Table */}
          {portfolio.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Active Tracked Portfolio ({portfolio.length} Funds)
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Fund</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Monthly Outflow</th>
                    <th className="py-2 px-3 text-right">Debit Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolio.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {formatCurrency(p.monthlyAmount, currency)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 tabular-nums">
                        Day {p.debitDay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer actions (hidden in print) */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 print:hidden">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
