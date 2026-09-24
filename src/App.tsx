import React, { useEffect, useMemo, useState } from 'react';
import { AddEditSIPModal } from './components/AddEditSIPModal';
import { CalculatorView } from './components/CalculatorView';
import { CostOfDelayView } from './components/CostOfDelayView';
import { ExportModal } from './components/ExportModal';
import { GoalPlannerView } from './components/GoalPlannerView';
import { Navbar } from './components/Navbar';
import { PortfolioTrackerView } from './components/PortfolioTrackerView';
import { ActiveSIPItem, CurrencyCode, SIPInputs } from './types/sip';
import { calculateSIP } from './utils/calculator';
import { CURRENCIES } from './utils/currencies';
import {
  getStoredPortfolio,
  saveStoredPortfolio,
} from './utils/portfolioStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Calculator inputs
  const [inputs, setInputs] = useState<SIPInputs>({
    monthlyInvestment: 500,
    expectedReturnRate: 12,
    timeHorizonYears: 15,
    initialLumpsum: 0,
    stepUpEnabled: true,
    stepUpType: 'percentage',
    stepUpValue: 10,
    adjustInflation: false,
    inflationRate: 6,
    estimateTax: false,
    taxRate: 12.5,
  });

  // Active SIP Portfolio state
  const [portfolio, setPortfolio] = useState<ActiveSIPItem[]>(() => getStoredPortfolio());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActiveSIPItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync portfolio changes to localStorage
  useEffect(() => {
    saveStoredPortfolio(portfolio);
  }, [portfolio]);

  // When currency changes, if monthly investment is still at previous currency default, adjust to new currency default
  const handleCurrencyChange = (newCode: CurrencyCode) => {
    const prevDefault = CURRENCIES[currency].defaultMonthly;
    if (inputs.monthlyInvestment === prevDefault) {
      setInputs((prev) => ({
        ...prev,
        monthlyInvestment: CURRENCIES[newCode].defaultMonthly,
      }));
    }
    setCurrency(newCode);
  };

  // Perform calculation
  const result = useMemo(() => {
    return calculateSIP(inputs);
  }, [inputs]);

  // Add / Edit SIP handler
  const handleSaveSIP = (item: ActiveSIPItem) => {
    setPortfolio((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? item : p));
      } else {
        return [item, ...prev];
      }
    });
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditSIP = (item: ActiveSIPItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleAddGoalToPortfolio = (goalSIP: ActiveSIPItem) => {
    setPortfolio((prev) => [goalSIP, ...prev]);
    setActiveTab('portfolio');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Top Bar Contract Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currency={currency}
          setCurrency={handleCurrencyChange}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenAddSIP={handleOpenAdd}
        />

        {/* Main Content Viewport */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === 'calculator' && (
            <CalculatorView
              currency={currency}
              inputs={inputs}
              setInputs={setInputs}
              result={result}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTrackerView
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              currency={currency}
              onOpenAddSIP={handleOpenAdd}
              onEditSIP={handleEditSIP}
            />
          )}

          {activeTab === 'goal-planner' && (
            <GoalPlannerView
              currency={currency}
              onAddGoalToPortfolio={handleAddGoalToPortfolio}
            />
          )}

          {activeTab === 'cost-of-delay' && (
            <CostOfDelayView currency={currency} />
          )}
        </main>
      </div>

      {/* Add / Edit SIP Modal */}
      <AddEditSIPModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveSIP}
        existingItem={editingItem}
        currency={currency}
      />

      {/* Report / Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currency={currency}
        inputs={inputs}
        result={result}
        portfolio={portfolio}
      />

      {/* Clean Footer adhering to anti-slop rules (no fake telemetry, no fake engines) */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">AcuitySIP</span>
            <span aria-hidden="true">·</span>
            <span>Systematic Investment Plan & Wealth Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Past performance is not indicative of future returns</span>
            <span aria-hidden="true">·</span>
            <span>Projections are illustrative estimates</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
