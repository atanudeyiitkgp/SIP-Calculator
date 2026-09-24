import { ArrowDownToLine, Globe, Plus, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import { CurrencyCode } from '../types/sip';
import { CURRENCIES } from '../utils/currencies';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  onOpenExport: () => void;
  onOpenAddSIP: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenExport,
  onOpenAddSIP,
}) => {
  const navItems = [
    { id: 'calculator', label: 'SIP Calculator' },
    { id: 'portfolio', label: 'Portfolio Tracker' },
    { id: 'goal-planner', label: 'Goal Planner' },
    { id: 'cost-of-delay', label: 'Cost of Delay' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('calculator');
          }}
          className="text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-emerald-600"
        >
          AcuitySIP
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="currency-select" className="sr-only">Select Currency</label>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent font-mono text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].symbol} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'portfolio' ? (
            <button
              onClick={onOpenAddSIP}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New SIP</span>
            </button>
          ) : (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-slate-500" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-2 bg-slate-50/50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === item.id
                ? 'bg-white text-emerald-700 shadow-xs font-semibold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
