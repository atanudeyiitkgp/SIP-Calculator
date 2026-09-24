import { X } from 'lucide-react';
import React, { useState } from 'react';
import { ActiveSIPItem, CurrencyCode, SIPCategory } from '../types/sip';
import { CURRENCIES, formatCurrency } from '../utils/currencies';
import { computeActiveSIPStatus } from '../utils/portfolioStorage';

interface AddEditSIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ActiveSIPItem) => void;
  existingItem?: ActiveSIPItem | null;
  currency: CurrencyCode;
}

const CATEGORIES: SIPCategory[] = [
  'Index / ETF',
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'Flexi Cap',
  'International',
  'Debt / Bonds',
  'Hybrid / Balanced',
  'Gold / Commodities',
];

export const AddEditSIPModal: React.FC<AddEditSIPModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingItem,
  currency,
}) => {
  const currencyConfig = CURRENCIES[currency];

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [formData, setFormData] = useState<Partial<ActiveSIPItem>>({
    id: existingItem?.id || `sip-${Date.now()}`,
    name: existingItem?.name || '',
    category: existingItem?.category || 'Index / ETF',
    monthlyAmount: existingItem?.monthlyAmount || currencyConfig.defaultMonthly,
    startDate: existingItem?.startDate || currentMonthStr,
    debitDay: existingItem?.debitDay || 5,
    expectedReturn: existingItem?.expectedReturn || 12,
    targetYears: existingItem?.targetYears || 15,
    stepUpAnnualPercent: existingItem?.stepUpAnnualPercent || 10,
    goalTag: existingItem?.goalTag || 'Retirement Wealth',
    isActive: existingItem ? existingItem.isActive : true,
    notes: existingItem?.notes || '',
  });

  if (!isOpen) return null;

  // Real-time preview calculation
  const previewItem: ActiveSIPItem = {
    id: formData.id || 'preview',
    name: formData.name || 'New Fund',
    category: formData.category || 'Index / ETF',
    monthlyAmount: formData.monthlyAmount || 100,
    startDate: formData.startDate || currentMonthStr,
    debitDay: formData.debitDay || 5,
    expectedReturn: formData.expectedReturn || 12,
    targetYears: formData.targetYears || 10,
    stepUpAnnualPercent: formData.stepUpAnnualPercent || 0,
    goalTag: formData.goalTag || '',
    isActive: true,
    notes: formData.notes || '',
  };

  const previewStatus = computeActiveSIPStatus(previewItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Please enter a fund name');
      return;
    }
    onSave(previewItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {existingItem ? 'Edit Investment Plan' : 'Add New SIP to Portfolio'}
            </h3>
            <p className="text-xs text-slate-500">Configure monthly debit and growth parameters</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fund Name */}
          <div>
            <label className="font-medium text-slate-700">Fund / ETF Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vanguard Total World Stock / Nifty 50 Index"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category & Goal Tag */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-slate-700">Asset Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, category: e.target.value as SIPCategory }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700">Target Goal / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Retirement, House, Education"
                value={formData.goalTag}
                onChange={(e) => setFormData((p) => ({ ...p, goalTag: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Monthly Amount & Expected Return */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-slate-700">
                Monthly Amount ({currencyConfig.symbol})
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white">
                <span className="mr-1 text-slate-400 font-mono">{currencyConfig.symbol}</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.monthlyAmount}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      monthlyAmount: Math.max(1, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700">Expected Annual Return (%)</label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white">
                <input
                  type="number"
                  min={1}
                  max={35}
                  step={0.5}
                  required
                  value={formData.expectedReturn}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      expectedReturn: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 outline-none tabular-nums"
                />
                <span className="ml-1 text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Start Date & Debit Day */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-slate-700">Start Date (YYYY-MM)</label>
              <input
                type="month"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Monthly Debit Day (1–28)</label>
              <input
                type="number"
                min={1}
                max={28}
                value={formData.debitDay}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    debitDay: Math.max(1, Math.min(28, Number(e.target.value) || 1)),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white tabular-nums"
              />
            </div>
          </div>

          {/* Target Years & Step Up */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-slate-700">Target Horizon (Years)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={formData.targetYears}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    targetYears: Math.max(1, Math.min(40, Number(e.target.value) || 1)),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Annual Step-Up (% / year)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={formData.stepUpAnnualPercent}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    stepUpAnnualPercent: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white tabular-nums"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-medium text-slate-700">Strategy / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Long-term compounding core index bucket"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Live Preview Box */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
            <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
              Projected Outcome for this Fund
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Current Capital Contributed:</span>
                <div className="font-bold text-slate-800 tabular-nums">
                  {formatCurrency(previewStatus.totalContributed, currency)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Current Estimated Value:</span>
                <div className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(previewStatus.currentEstimatedValuation, currency)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Target Horizon ({previewItem.targetYears}y) Total:</span>
                <div className="font-bold text-slate-800 tabular-nums">
                  {formatCurrency(previewStatus.projectedTotalContributed, currency)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Projected Maturity Corpus:</span>
                <div className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(previewStatus.projectedValuation, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              {existingItem ? 'Update Fund' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
