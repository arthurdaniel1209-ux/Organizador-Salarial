
import React, { useState, useMemo, useCallback } from 'react';
import { INITIAL_EXPENSES, AVAILABLE_ICONS } from './constants';
import { Expense, AllocationType, Goal, OneTimeExpense, OneTimeGain } from './types';
import BudgetChart from './components/BudgetChart';
import SummaryCard from './components/SummaryCard';
import BalanceProjectionChart from './components/BalanceProjectionChart';
import IconPickerModal from './components/IconPickerModal';
import SavingsTipsCard from './components/SavingsTipsCard';
import { WalletIcon, MoneyBillIcon, BalanceIcon, ResetIcon, PlusIcon, CloseIcon, WarningIcon, PencilIcon, TrashIcon } from './components/icons';

const App: React.FC = () => {
  const [salary, setSalary] = useState<number>(0);
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [oneTimeExpenses, setOneTimeExpenses] = useState<OneTimeExpense[]>([]);
  const [oneTimeGains, setOneTimeGains] = useState<OneTimeGain[]>([]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState<boolean>(false);
  
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState<number>(1000);
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  
  const [newOneTimeName, setNewOneTimeName] = useState('');
  const [newOneTimeValue, setNewOneTimeValue] = useState<string>('');

  const [newOneTimeGainName, setNewOneTimeGainName] = useState('');
  const [newOneTimeGainValue, setNewOneTimeGainValue] = useState<string>('');

  const [projectionPeriod, setProjectionPeriod] = useState<number>(6);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalIncome = useMemo(() => {
    const totalGains = oneTimeGains.reduce((total, gain) => total + gain.value, 0);
    return salary + totalGains;
  }, [salary, oneTimeGains]);

  const totalExpenses = useMemo(() => {
    const totalFixed = fixedExpenses.reduce((total, expense) => {
      if (expense.type === AllocationType.PERCENTAGE) {
        return total + (totalIncome * (expense.value / 100));
      }
      return total + expense.value;
    }, 0);
    const totalOneTime = oneTimeExpenses.reduce((total, expense) => total + expense.value, 0);
    return totalFixed + totalOneTime;
  }, [fixedExpenses, oneTimeExpenses, totalIncome]);

  const remainingBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  
  const savingsAllocation = useMemo(() => {
    const savingsExpense = fixedExpenses.find(e => e.name === 'Investimentos/Poupança');
    if (!savingsExpense) return 0;
    return savingsExpense.type === AllocationType.PERCENTAGE ? totalIncome * (savingsExpense.value / 100) : savingsExpense.value;
  }, [fixedExpenses, totalIncome]);

  const chartData = useMemo(() => {
    const fixedData = fixedExpenses.map(expense => ({
      name: expense.name,
      value: expense.type === AllocationType.PERCENTAGE ? totalIncome * (expense.value / 100) : expense.value,
      fill: expense.color,
    }));

    const oneTimeData = oneTimeExpenses.map(expense => ({
        name: expense.name,
        value: expense.value,
        fill: '#6b7280' // gray-500 for one-time expenses
    }));

    const combinedData = [...fixedData, ...oneTimeData];

    if (remainingBalance > 0) {
      combinedData.push({
        name: 'Sobra',
        value: remainingBalance,
        fill: '#22c55e', // green-500
      });
    }

    return combinedData.filter(d => d.value > 0);
  }, [fixedExpenses, oneTimeExpenses, totalIncome, remainingBalance]);

  const projectionData = useMemo(() => {
    if (remainingBalance <= 0) return [];
    return Array.from({ length: projectionPeriod }, (_, i) => ({
      name: `Mês ${i + 1}`,
      saldo: remainingBalance * (i + 1),
    }));
  }, [remainingBalance, projectionPeriod]);
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSalary(value);
  };

  const handleExpenseChange = (id: string, value: number) => {
    setFixedExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, value: value } : expense
      )
    );
  };

  const handleAllocationTypeChange = (id: string, type: AllocationType) => {
    setFixedExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, type, value: 0 } : expense
      )
    );
  };
  
  const resetBudget = useCallback(() => {
    setSalary(0);
    setFixedExpenses(INITIAL_EXPENSES);
    setOneTimeExpenses([]);
    setOneTimeGains([]);
    setGoals([]);
  }, []);
  
  const handleAddGoal = () => {
    if (newGoalName.trim() && newGoalAmount > 0 && newGoalDeadline) {
      const newGoal: Goal = {
        id: new Date().toISOString(),
        name: newGoalName,
        targetAmount: newGoalAmount,
        deadline: newGoalDeadline,
      };
      setGoals([...goals, newGoal]);
      setIsGoalModalOpen(false);
      setNewGoalName('');
      setNewGoalAmount(1000);
      setNewGoalDeadline('');
    }
  };
  
  const calculateMonthsDifference = (date: string) => {
    const today = new Date();
    const deadlineDate = new Date(date);
    deadlineDate.setDate(deadlineDate.getDate() + 1);
    const months = (deadlineDate.getFullYear() - today.getFullYear()) * 12 + (deadlineDate.getMonth() - today.getMonth());
    return Math.max(1, months);
  };
  
  const isDeadlineSoon = (deadline: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 28;
  };

  const isDeadlineOverdue = (deadline: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    const deadlineDate = new Date(deadline);
    // Adding one day to the deadline to make it inclusive
    const adjustedDeadline = new Date(deadlineDate.setDate(deadlineDate.getDate() + 1));
    return adjustedDeadline.getTime() < today.getTime();
  };

  const openIconModal = (expenseId: string) => {
    setEditingExpenseId(expenseId);
    setIsIconModalOpen(true);
  };

  const closeIconModal = () => {
    setEditingExpenseId(null);
    setIsIconModalOpen(false);
  };

  const handleIconChange = (newIcon: string) => {
    if (!editingExpenseId) return;
    setFixedExpenses(prev => prev.map(exp => 
      exp.id === editingExpenseId ? { ...exp, icon: newIcon } : exp
    ));
    closeIconModal();
  };

  const handleAddFixedExpense = () => {
    const newExpense: Expense = {
      id: new Date().toISOString(),
      name: 'Nova Categoria',
      icon: '<i class="fa-solid fa-shapes"></i>',
      value: 0,
      type: AllocationType.FIXED,
      color: '#71717a', // zinc-500
    };
    setFixedExpenses([...fixedExpenses, newExpense]);
  };

  const handleDeleteFixedExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter(exp => exp.id !== id));
  };
  
  const handleStartEditingName = (expense: Expense) => {
    setEditingNameId(expense.id);
    setEditingNameValue(expense.name);
  };
  
  const handleSaveName = (id: string) => {
    setFixedExpenses(fixedExpenses.map(exp => exp.id === id ? {...exp, name: editingNameValue} : exp));
    setEditingNameId(null);
    setEditingNameValue('');
  };
  
  const handleAddOneTimeExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(newOneTimeValue);
    if (newOneTimeName.trim() && !isNaN(numericValue) && numericValue > 0) {
      const newExpense: OneTimeExpense = {
        id: new Date().toISOString(),
        name: newOneTimeName,
        value: numericValue,
      };
      setOneTimeExpenses([...oneTimeExpenses, newExpense]);
      setNewOneTimeName('');
      setNewOneTimeValue('');
    }
  };

  const handleDeleteOneTimeExpense = (id: string) => {
    setOneTimeExpenses(oneTimeExpenses.filter(exp => exp.id !== id));
  };
  
  const handleAddOneTimeGain = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(newOneTimeGainValue);
    if (newOneTimeGainName.trim() && !isNaN(numericValue) && numericValue > 0) {
        const newGain: OneTimeGain = {
            id: new Date().toISOString(),
            name: newOneTimeGainName,
            value: numericValue,
        };
        setOneTimeGains([...oneTimeGains, newGain]);
        setNewOneTimeGainName('');
        setNewOneTimeGainValue('');
    }
  };

  const handleDeleteOneTimeGain = (id: string) => {
    setOneTimeGains(oneTimeGains.filter(gain => gain.id !== id));
  };


  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
              Organizador de Salário
            </h1>
            <p className="text-gray-500 mt-2">
              Planeje suas finanças, visualize o futuro e atinja suas metas.
            </p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Seu Orçamento</h2>
                <button
                  onClick={resetBudget}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ResetIcon />
                  Resetar
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Renda Mensal</h3>
                  <div className="mb-6">
                    <label htmlFor="salary" className="block text-sm font-medium mb-1 text-gray-600">
                      Salário Fixo (Bruto)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500">R$</span>
                      </div>
                      <input
                        type="number"
                        id="salary"
                        value={salary}
                        onChange={handleSalaryChange}
                        onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                        onBlur={(e) => { if (e.target.value === '') setSalary(0); }}
                        className="w-full pl-10 pr-4 py-2 text-md bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-0 rounded-md transition"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Ganhos Pontuais</label>
                    <form onSubmit={handleAddOneTimeGain} className="flex items-center gap-3 mb-4">
                        <input type="text" value={newOneTimeGainName} onChange={e => setNewOneTimeGainName(e.target.value)} placeholder="Ex: Bônus, Venda, etc." className="flex-grow p-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                        <input type="number" value={newOneTimeGainValue} onChange={e => setNewOneTimeGainValue(e.target.value)} placeholder="Valor (R$)" className="w-32 p-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                        <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">Adicionar</button>
                    </form>
                    <div className="space-y-2">
                        {oneTimeGains.map(gain => (
                            <div key={gain.id} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-md">
                                <span>{gain.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">{formatCurrency(gain.value)}</span>
                                    <button onClick={() => handleDeleteOneTimeGain(gain.id)} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>

                <hr/>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Despesas Fixas</h3>
                        <button onClick={handleAddFixedExpense} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:opacity-80 transition-opacity">
                            <PlusIcon /> Adicionar Categoria
                        </button>
                    </div>
                    <div className="space-y-4">
                    {fixedExpenses.map(expense => (
                        <div key={expense.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-3 flex-grow">
                                <button onClick={() => openIconModal(expense.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0">
                                    <span className="transform scale-110" dangerouslySetInnerHTML={{ __html: expense.icon }} />
                                </button>
                                {editingNameId === expense.id ? (
                                    <input type="text" value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)} onBlur={() => handleSaveName(expense.id)} onKeyDown={e => e.key === 'Enter' && handleSaveName(expense.id)} autoFocus className="font-medium bg-gray-100 border-b-2 border-blue-500 outline-none w-full" />
                                ) : (
                                    <label htmlFor={`expense-${expense.id}`} className="font-medium flex-grow">{expense.name}</label>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleStartEditingName(expense)} className="text-gray-400 hover:text-gray-600 transition-colors"><PencilIcon /></button>
                                <button onClick={() => handleDeleteFixedExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
                                <div className="flex items-center bg-gray-200 rounded-full p-0.5">
                                <button
                                    onClick={() => handleAllocationTypeChange(expense.id, AllocationType.FIXED)}
                                    className={`px-2 py-0.5 rounded-full text-xs transition-colors ${expense.type === AllocationType.FIXED ? 'bg-white text-blue-600 font-semibold shadow-sm' : 'text-gray-500'}`}
                                >
                                    R$
                                </button>
                                <button
                                    onClick={() => handleAllocationTypeChange(expense.id, AllocationType.PERCENTAGE)}
                                    className={`px-2 py-0.5 rounded-full text-xs transition-colors ${expense.type === AllocationType.PERCENTAGE ? 'bg-white text-blue-600 font-semibold shadow-sm' : 'text-gray-500'}`}
                                >
                                    %
                                </button>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-400 text-sm">
                                {expense.type === AllocationType.FIXED ? 'R$' : '%'}
                            </span>
                            </div>
                            <input
                            type="number"
                            id={`expense-${expense.id}`}
                            value={expense.value}
                            onChange={(e) => handleExpenseChange(expense.id, parseFloat(e.target.value) || 0)}
                            onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                            onBlur={(e) => { if (e.target.value === '') handleExpenseChange(expense.id, 0); }}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4">Despesas Pontuais</h3>
                    <form onSubmit={handleAddOneTimeExpense} className="flex items-center gap-3 mb-4">
                        <input type="text" value={newOneTimeName} onChange={e => setNewOneTimeName(e.target.value)} placeholder="Nome da despesa" className="flex-grow p-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                        <input type="number" value={newOneTimeValue} onChange={e => setNewOneTimeValue(e.target.value)} placeholder="Valor (R$)" className="w-32 p-2 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Adicionar</button>
                    </form>
                    <div className="space-y-2">
                        {oneTimeExpenses.map(expense => (
                            <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <span>{expense.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">{formatCurrency(expense.value)}</span>
                                    <button onClick={() => handleDeleteOneTimeExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Resumo Financeiro</h2>
                <div className="space-y-4">
                  <SummaryCard title="Renda Total Mensal" value={formatCurrency(totalIncome)} icon={<WalletIcon />} color="text-blue-500" />
                  <SummaryCard title="Total de Despesas" value={formatCurrency(totalExpenses)} icon={<MoneyBillIcon />} color="text-red-500" />
                  <SummaryCard title="Saldo Restante" value={formatCurrency(remainingBalance)} icon={<BalanceIcon />} color={remainingBalance >= 0 ? 'text-green-500' : 'text-amber-500'} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Metas de Poupança</h2>
                    <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:opacity-80 transition-opacity">
                        <PlusIcon /> Adicionar
                    </button>
                </div>
                <div className="space-y-4">
                    {goals.length > 0 ? goals.map(goal => {
                        const monthsRemaining = calculateMonthsDifference(goal.deadline);
                        const requiredMonthlySavings = goal.targetAmount / monthsRemaining;
                        const progress = savingsAllocation > 0 ? (savingsAllocation / requiredMonthlySavings) * 100 : 0;
                        const isSoon = isDeadlineSoon(goal.deadline);
                        const isOverdue = isDeadlineOverdue(goal.deadline);

                        let containerClasses = "text-sm p-3 rounded-lg border transition-colors";
                        let progressBarColor = "bg-blue-500";
                        let warningMessage = null;

                        if (isOverdue) {
                            containerClasses += " border-red-400 bg-red-50";
                            progressBarColor = "bg-red-500";
                            warningMessage = (
                                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                    <WarningIcon className="h-5 w-5" />
                                    Prazo vencido!
                                </p>
                            );
                        } else if (isSoon) {
                            containerClasses += " border-amber-400 bg-amber-50";
                            progressBarColor = "bg-amber-500";
                            warningMessage = (
                                <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
                                    <WarningIcon className="h-5 w-5" />
                                    Prazo se aproximando!
                                </p>
                            );
                        } else {
                            containerClasses += " border-transparent";
                        }

                        return (
                            <div key={goal.id} className={containerClasses}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="font-semibold">{goal.name}</p>
                                    <p className="text-gray-500">{formatCurrency(goal.targetAmount)}</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className={`h-2.5 rounded-full transition-colors ${progressBarColor}`} 
                                      style={{ width: `${Math.min(100, progress)}%` }}>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Economia mensal necessária: <span className="font-semibold text-gray-700">{formatCurrency(requiredMonthlySavings)}</span>
                                </p>
                                {warningMessage}
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-400 text-sm py-4">Crie metas para começar a poupar!</p>
                    )}
                </div>
              </div>

              <SavingsTipsCard 
                totalIncome={totalIncome}
                fixedExpenses={fixedExpenses}
                oneTimeExpenses={oneTimeExpenses}
                remainingBalance={remainingBalance}
              />

              <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col h-96">
                  <h2 className="text-2xl font-semibold mb-4">Distribuição</h2>
                  <div className="w-full flex-grow relative">
                    <BudgetChart data={chartData} />
                  </div>
              </div>
              
               <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col h-96">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Projeção de Saldo</h2>
                    <select value={projectionPeriod} onChange={e => setProjectionPeriod(Number(e.target.value))} className="bg-gray-100 border-gray-300 rounded-md text-sm py-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                    </select>
                  </div>
                  <div className="w-full flex-grow relative">
                    <BalanceProjectionChart data={projectionData} />
                  </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative border border-gray-200">
            <button onClick={() => setIsGoalModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Nova Meta de Poupança</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-gray-600 mb-1">Nome da Meta</label>
                <input type="text" id="goal-name" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Ex: Viagem de Férias" className="w-full p-2 bg-gray-100 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition" />
              </div>
              <div>
                <label htmlFor="goal-amount" className="block text-sm font-medium text-gray-600 mb-1">Valor Total (R$)</label>
                <input 
                  type="number" 
                  id="goal-amount" 
                  value={newGoalAmount} 
                  onChange={e => setNewGoalAmount(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                  onBlur={(e) => { if (e.target.value === '') setNewGoalAmount(0); }}
                  className="w-full p-2 bg-gray-100 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition" />
              </div>
              <div>
                <label htmlFor="goal-deadline" className="block text-sm font-medium text-gray-600 mb-1">Data Limite</label>
                <input type="date" id="goal-deadline" value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} className="w-full p-2 bg-gray-100 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition" min={new Date().toISOString().split("T")[0]}/>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
              <button onClick={handleAddGoal} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      <IconPickerModal
        isOpen={isIconModalOpen}
        onClose={closeIconModal}
        onSelectIcon={handleIconChange}
        icons={AVAILABLE_ICONS}
      />
    </>
  );
};

export default App;