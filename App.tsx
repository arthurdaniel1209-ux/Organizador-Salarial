
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { getSupabase } from './supabaseClient';
import { INITIAL_EXPENSES, AVAILABLE_ICONS, CDI_ANNUAL_RATE } from './constants';
import { Expense, AllocationType, Goal, OneTimeExpense, OneTimeGain, UserData, Investment } from './types';
import BudgetChart from './components/BudgetChart';
import SummaryCard from './components/SummaryCard';
import BalanceProjectionChart from './components/BalanceProjectionChart';
import IconPickerModal from './components/IconPickerModal';
import SavingsTipsCard from './components/SavingsTipsCard';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';
import { WalletIcon, MoneyBillIcon, BalanceIcon, ResetIcon, PlusIcon, CloseIcon, WarningIcon, PencilIcon, TrashIcon, LogoutIcon, CalendarIcon, InvestmentIcon, SunIcon, MoonIcon, SaveIcon, CheckIcon, SpinnerIcon } from './components/icons';
import { User } from '@supabase/supabase-js';


type ViewMode = 'APP' | 'LOGIN' | 'PASSWORD_RESET' | 'LOADING';

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [salary, setSalary] = useState<number>(0);
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [oneTimeExpenses, setOneTimeExpenses] = useState<OneTimeExpense[]>([]);
  const [oneTimeGains, setOneTimeGains] = useState<OneTimeGain[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<number>(0);
  const [lastSavedMonth, setLastSavedMonth] = useState<number>(new Date().getMonth());
  
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
  const [oneTimeExpenseError, setOneTimeExpenseError] = useState<string | null>(null);


  const [newOneTimeGainName, setNewOneTimeGainName] = useState('');
  const [newOneTimeGainValue, setNewOneTimeGainValue] = useState<string>('');
  const [oneTimeGainError, setOneTimeGainError] = useState<string | null>(null);
  
  const [newInvestmentName, setNewInvestmentName] = useState('');
  const [newInvestmentAmount, setNewInvestmentAmount] = useState('');
  const [newInvestmentCdiPercentage, setNewInvestmentCdiPercentage] = useState('100');
  const [investmentError, setInvestmentError] = useState<string | null>(null);


  const [projectionPeriod, setProjectionPeriod] = useState<number>(6);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  const [viewMode, setViewMode] = useState<ViewMode>('LOADING');

  // State for manual save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const saveSuccessTimeoutRef = useRef<number | null>(null);
  
  
  useEffect(() => {
    // Theme setup
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Cleanup for the save success timeout
  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserData = async (user: User) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      // If user data exists, load it into the app's state
      setName(data.name || '');
      setSalary(data.salary);
      setFixedExpenses(data.fixed_expenses);
      setOneTimeExpenses(data.onetime_expenses);
      setOneTimeGains(data.onetime_gains);
      setGoals(data.goals);
      setInvestments(data.investments || []);
      setLastSavedMonth(data.last_saved_month);
      setPreviousMonthExpenses(data.previous_month_expenses);
    } else if (error && error.code === 'PGRST116') {
      // PGRST116 means "No rows found". This is expected for a new user.
      // We'll create their profile row in the database.
      const newUserName = user.user_metadata.full_name || user.email || 'Novo Usuário';
      
      const initialData = {
        id: user.id,
        name: newUserName,
        salary: 0,
        fixed_expenses: INITIAL_EXPENSES,
        onetime_expenses: [],
        onetime_gains: [],
        goals: [],
        investments: [],
        last_saved_month: new Date().getMonth(),
        previous_month_expenses: 0,
      };

      const { error: insertError } = await supabase.from('user_data').insert(initialData);
      
      if (insertError) {
        console.error("Error creating user profile:", insertError);
        // Optionally, set an error state to show in the UI
      } else {
        // After creating the profile, load the initial data into the state
        setName(initialData.name);
        setSalary(initialData.salary);
        setFixedExpenses(initialData.fixed_expenses);
        setOneTimeExpenses(initialData.onetime_expenses);
        setOneTimeGains(initialData.onetime_gains);
        setGoals(initialData.goals);
        setInvestments(initialData.investments);
        setLastSavedMonth(initialData.last_saved_month);
        setPreviousMonthExpenses(initialData.previous_month_expenses);
      }
    } else if (error) { 
      // Handle other unexpected errors
      console.error("Error fetching user data:", error);
    }
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    const supabase = getSupabase();
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          await fetchUserData(session.user);
          setViewMode('APP');
        } else {
          setViewMode('LOGIN');
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setViewMode('LOGIN');
      } finally {
        setIsLoaded(true);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            setCurrentUser(session.user);
            await fetchUserData(session.user);
            setViewMode('APP');
        } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setViewMode('LOGIN');
            resetBudget();
        } else if (event === 'PASSWORD_RECOVERY') {
            setViewMode('PASSWORD_RESET');
        }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const dataToSave: Omit<UserData, 'password'> = {
        name,
        salary,
        fixed_expenses: fixedExpenses,
        onetime_expenses: oneTimeExpenses,
        onetime_gains: oneTimeGains,
        goals,
        investments,
        last_saved_month: lastSavedMonth,
        previous_month_expenses: previousMonthExpenses,
    };

    const supabase = getSupabase();
    const { error } = await supabase
        .from('user_data')
        .update({ ...dataToSave })
        .eq('id', currentUser.id);

    setIsSaving(false);
    if (error) {
        console.error("Error saving data:", error);
        alert("Erro ao salvar os dados. Tente novamente.");
    } else {
        setHasUnsavedChanges(false);
        setSaveSuccess(true);
        if (saveSuccessTimeoutRef.current) {
            clearTimeout(saveSuccessTimeoutRef.current);
        }
        saveSuccessTimeoutRef.current = window.setTimeout(() => {
            setSaveSuccess(false);
        }, 2000);
    }
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
  
  const totalInvested = useMemo(() => {
    return investments.reduce((total, investment) => total + investment.amount, 0);
  }, [investments]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const currentMonth = new Date().getMonth();
    if (lastSavedMonth !== currentMonth) {
      setPreviousMonthExpenses(totalExpenses);
      setLastSavedMonth(currentMonth);
      setHasUnsavedChanges(true);
    }
  }, [currentUser, totalExpenses, lastSavedMonth]);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const discretionaryIncome = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const finalBalance = useMemo(() => discretionaryIncome - totalInvested, [discretionaryIncome, totalInvested]);

  const chartData = useMemo(() => {
    const fixedData = fixedExpenses.map(expense => ({
      name: expense.name,
      value: expense.type === AllocationType.PERCENTAGE ? totalIncome * (expense.value / 100) : expense.value,
      fill: expense.color,
    }));

    const oneTimeData = oneTimeExpenses.map(expense => ({
        name: expense.name,
        value: expense.value,
        fill: '#6b7280'
    }));
    
    const investmentData = {
      name: 'Investimentos',
      value: totalInvested,
      fill: '#84cc16' // lime-500
    };

    const combinedData = [...fixedData, ...oneTimeData, investmentData];

    if (finalBalance > 0) {
      combinedData.push({
        name: 'Sobra',
        value: finalBalance,
        fill: '#22c55e',
      });
    }

    return combinedData.filter(d => d.value > 0);
  }, [fixedExpenses, oneTimeExpenses, totalInvested, totalIncome, finalBalance]);

  const projectionData = useMemo(() => {
    if (finalBalance <= 0) return [];
    return Array.from({ length: projectionPeriod }, (_, i) => ({
      name: `Mês ${i + 1}`,
      saldo: finalBalance * (i + 1),
    }));
  }, [finalBalance, projectionPeriod]);
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSalary(value);
    setHasUnsavedChanges(true);
  };

  const handleExpenseChange = (id: string, value: number) => {
    setFixedExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, value: value } : expense
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleAllocationTypeChange = (id: string, type: AllocationType) => {
    setFixedExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, type, value: 0 } : expense
      )
    );
    setHasUnsavedChanges(true);
  };
  
  const resetBudget = useCallback(() => {
    setName('');
    setSalary(0);
    setFixedExpenses(INITIAL_EXPENSES);
    setOneTimeExpenses([]);
    setOneTimeGains([]);
    setGoals([]);
    setInvestments([]);
    setPreviousMonthExpenses(0);
    setLastSavedMonth(new Date().getMonth());
    setHasUnsavedChanges(true);
  }, []);
  
  const handlePasswordResetSuccess = () => {
    alert("Senha redefinida com sucesso! Por favor, faça login com sua nova senha.");
    setViewMode('LOGIN');
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error("Error logging out:", error);
        alert("Ocorreu um erro ao tentar sair. Por favor, verifique sua conexão e tente novamente.");
    } else {
        // Explicitly update state to ensure UI reacts immediately,
        // making the logout button feel responsive and reliable.
        setCurrentUser(null);
        setViewMode('LOGIN');
        resetBudget();
    }
  };
  
  const handleAddGoal = () => {
    if (newGoalName.trim() && newGoalAmount > 0 && newGoalDeadline) {
      const newGoal: Goal = {
        id: new Date().toISOString(),
        name: newGoalName,
        targetAmount: newGoalAmount,
        deadline: newGoalDeadline,
      };
      setGoals(prev => [...prev, newGoal]);
      setHasUnsavedChanges(true);
      setIsGoalModalOpen(false);
      setNewGoalName('');
      setNewGoalAmount(1000);
      setNewGoalDeadline('');
    }
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
    today.setHours(0, 0, 0, 0);
    const adjustedDeadline = new Date(new Date(deadline).setDate(new Date(deadline).getDate() + 1));
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
    setHasUnsavedChanges(true);
    closeIconModal();
  };

  const handleAddFixedExpense = () => {
    const newExpense: Expense = {
      id: new Date().toISOString(),
      name: 'Nova Categoria',
      icon: '<i class="fa-solid fa-shapes"></i>',
      value: 0,
      type: AllocationType.FIXED,
      color: '#71717a',
    };
    setFixedExpenses(prev => [...prev, newExpense]);
    setHasUnsavedChanges(true);
  };

  const handleDeleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(exp => exp.id !== id));
    setHasUnsavedChanges(true);
  };
  
  const handleStartEditingName = (expense: Expense) => {
    setEditingNameId(expense.id);
    setEditingNameValue(expense.name);
  };
  
  const handleSaveName = (id: string) => {
    setFixedExpenses(prev => prev.map(exp => exp.id === id ? {...exp, name: editingNameValue} : exp));
    setHasUnsavedChanges(true);
    setEditingNameId(null);
    setEditingNameValue('');
  };
  
  const handleAddOneTimeExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setOneTimeExpenseError(null);

    const numericValue = parseFloat(newOneTimeValue);
    
    if (!newOneTimeName.trim()) {
        setOneTimeExpenseError("O nome da despesa não pode estar vazio.");
        return;
    }

    if (isNaN(numericValue) || numericValue <= 0) {
        setOneTimeExpenseError("O valor da despesa deve ser um número positivo.");
        return;
    }

    const newExpense: OneTimeExpense = {
        id: new Date().toISOString(),
        name: newOneTimeName,
        value: numericValue,
    };
    setOneTimeExpenses(prev => [...prev, newExpense]);
    setHasUnsavedChanges(true);
    setNewOneTimeName('');
    setNewOneTimeValue('');
  };

  const handleDeleteOneTimeExpense = (id: string) => {
    setOneTimeExpenses(prev => prev.filter(exp => exp.id !== id));
    setHasUnsavedChanges(true);
  };
  
  const handleAddOneTimeGain = (e: React.FormEvent) => {
    e.preventDefault();
    setOneTimeGainError(null);

    const numericValue = parseFloat(newOneTimeGainValue);
    
    if (!newOneTimeGainName.trim()) {
        setOneTimeGainError("O nome do ganho não pode estar vazio.");
        return;
    }

    if (isNaN(numericValue) || numericValue <= 0) {
        setOneTimeGainError("O valor do ganho deve ser um número positivo.");
        return;
    }

    const newGain: OneTimeGain = {
        id: new Date().toISOString(),
        name: newOneTimeGainName,
        value: numericValue,
    };
    setOneTimeGains(prev => [...prev, newGain]);
    setHasUnsavedChanges(true);
    setNewOneTimeGainName('');
    setNewOneTimeGainValue('');
  };

  const handleDeleteOneTimeGain = (id: string) => {
    setOneTimeGains(prev => prev.filter(gain => gain.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    setInvestmentError(null);
    
    const amount = parseFloat(newInvestmentAmount);
    const cdi = parseFloat(newInvestmentCdiPercentage);
    
    if (!newInvestmentName.trim() || isNaN(amount) || amount <= 0 || isNaN(cdi)) {
      setInvestmentError('Por favor, preencha todos os campos com valores válidos.');
      return;
    }
    
    if (cdi <= 0 || cdi > 200) {
      setInvestmentError('O percentual do CDI deve ser um valor positivo até 200%.');
      return;
    }

    const newInvestment: Investment = {
      id: new Date().toISOString(),
      name: newInvestmentName,
      amount: amount,
      cdiPercentage: cdi,
    };
    setInvestments(prev => [...prev, newInvestment]);
    setHasUnsavedChanges(true);
    setNewInvestmentName('');
    setNewInvestmentAmount('');
    setNewInvestmentCdiPercentage('100');
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    setHasUnsavedChanges(true);
  };
  
  const calculateMonthlyYield = (investment: Investment): number => {
    const monthlyCdiRate = Math.pow(1 + CDI_ANNUAL_RATE, 1 / 12) - 1;
    const investmentYieldRate = monthlyCdiRate * (investment.cdiPercentage / 100);
    return investment.amount * investmentYieldRate;
  };
  
  if (viewMode === 'LOADING' || !isLoaded) {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <p className="text-slate-500 dark:text-slate-400">Carregando...</p>
        </div>
    );
  }
  
  if (viewMode === 'PASSWORD_RESET') {
    return <PasswordReset onResetSuccess={handlePasswordResetSuccess} />;
  }
  
  if (viewMode === 'LOGIN' || !currentUser) {
    return <Login />;
  }

  const getCardStyle = (delay: number) => ({
    transition: `opacity 0.5s ease-in-out ${delay}ms, transform 0.5s ease-in-out ${delay}ms`,
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
  });

  const getSaveButtonClasses = () => {
    if (isSaving) {
      return "bg-yellow-500/80";
    }
    if (saveSuccess) {
      return "bg-green-500";
    }
    if (hasUnsavedChanges) {
      return "bg-blue-600 hover:bg-blue-700";
    }
    return "bg-slate-400/80 dark:bg-slate-500/80 cursor-default";
  };
  
  const getSaveButtonText = () => {
    if (isSaving) return "Salvando...";
    if (saveSuccess) return "Salvo!";
    if (hasUnsavedChanges) return "Salvar Alterações";
    return "Salvo";
  };

  const getSaveButtonIcon = () => {
    if (isSaving) return <SpinnerIcon />;
    if (saveSuccess) return <CheckIcon />;
    return <SaveIcon />;
  };

  return (
    <>
      <div className="min-h-screen text-slate-800 dark:text-slate-300 p-4 sm:p-6 lg:p-8" data-testid="app-container">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-10" style={getCardStyle(0)}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Organizador de Salário
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
              Bem-vindo, <span className="font-bold text-slate-700 dark:text-slate-200">{name || currentUser.email}</span>! Vamos organizar suas finanças.
            </p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-6 sm:p-8 rounded-2xl shadow-lg" style={getCardStyle(200)}>
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Seu Orçamento</h2>
                  <button
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges || isSaving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all duration-300 ${getSaveButtonClasses()}`}
                    >
                      {getSaveButtonIcon()}
                      {getSaveButtonText()}
                  </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    aria-label="Alternar tema"
                  >
                    {theme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    data-testid="logout-button"
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-500/20"
                    aria-label="Sair da conta"
                  >
                    <LogoutIcon />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-slate-100">Renda Mensal</h3>
                  <div className="mb-6">
                    <label htmlFor="salary" className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Salário Fixo (Bruto)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-slate-500 dark:text-slate-400">R$</span>
                      </div>
                      <input
                        type="number"
                        id="salary"
                        data-testid="salary-input"
                        value={salary}
                        onChange={handleSalaryChange}
                        onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                        onBlur={(e) => { if (e.target.value === '') setSalary(0); }}
                        className="w-full pl-12 pr-4 py-3 text-lg bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl transition text-black dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Ganhos Pontuais</label>
                    <form onSubmit={handleAddOneTimeGain} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
                        <input type="text" data-testid="one-time-gain-name-input" value={newOneTimeGainName} onChange={e => { setNewOneTimeGainName(e.target.value); if (oneTimeGainError) setOneTimeGainError(null); }} placeholder="Ex: Bônus, Venda, etc." className="flex-grow w-full sm:w-auto p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition text-black dark:text-white" />
                        <input type="number" data-testid="one-time-gain-value-input" value={newOneTimeGainValue} onChange={e => { setNewOneTimeGainValue(e.target.value); if (oneTimeGainError) setOneTimeGainError(null); }} placeholder="Valor (R$)" className="w-full sm:w-36 p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition text-black dark:text-white" />
                        <button type="submit" data-testid="add-one-time-gain-button" className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex-shrink-0">Adicionar</button>
                    </form>
                    {oneTimeGainError && <p className="text-sm text-red-600 dark:text-red-400 -mt-1 mb-4">{oneTimeGainError}</p>}
                    <div className="space-y-3">
                        {oneTimeGains.map(gain => (
                            <div key={gain.id} data-testid={`one-time-gain-${gain.id}`} className="flex justify-between items-center p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                                <span className="dark:text-slate-200">{gain.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold dark:text-slate-100">{formatCurrency(gain.value)}</span>
                                    <button onClick={() => handleDeleteOneTimeGain(gain.id)} data-testid={`delete-one-time-gain-${gain.id}`} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700"/>

                <div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-slate-100">Investimentos e Poupança</h3>
                  <form onSubmit={handleAddInvestment} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2 items-end">
                    <div className='sm:col-span-3'>
                      <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Nome</label>
                      <input type="text" data-testid="investment-name-input" value={newInvestmentName} onChange={e => { setNewInvestmentName(e.target.value); if(investmentError) setInvestmentError(null); }} placeholder="Ex: Tesouro Selic, CDB" className="w-full p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-lime-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-lime-500/50 transition text-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Valor Investido (R$)</label>
                      <input type="number" data-testid="investment-amount-input" value={newInvestmentAmount} onChange={e => { setNewInvestmentAmount(e.target.value); if(investmentError) setInvestmentError(null); }} placeholder="1000.00" className="w-full p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-lime-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-lime-500/50 transition text-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Rendimento (% do CDI)</label>
                      <input type="number" data-testid="investment-cdi-input" value={newInvestmentCdiPercentage} onChange={e => { setNewInvestmentCdiPercentage(e.target.value); if(investmentError) setInvestmentError(null); }} placeholder="100" className="w-full p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-lime-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-lime-500/50 transition text-black dark:text-white" />
                    </div>
                    <button type="submit" data-testid="add-investment-button" className="px-5 py-3 rounded-xl bg-lime-600 text-white font-semibold hover:bg-lime-700 transition-all duration-300 transform hover:scale-105 flex-shrink-0 h-fit">Adicionar</button>
                  </form>
                  {investmentError && <p className="text-sm text-red-600 dark:text-red-400 -mt-1 mb-4">{investmentError}</p>}
                  <div className="space-y-3">
                    {investments.map(inv => (
                      <div key={inv.id} data-testid={`investment-${inv.id}`} className="p-4 bg-lime-500/10 dark:bg-lime-500/20 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{inv.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{formatCurrency(inv.amount)} • {inv.cdiPercentage}% do CDI</p>
                          </div>
                           <div className="text-right">
                              <p className="font-semibold text-green-700 dark:text-green-500">{formatCurrency(calculateMonthlyYield(inv))}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Rendimento/mês</p>
                           </div>
                        </div>
                        <button onClick={() => handleDeleteInvestment(inv.id)} data-testid={`delete-investment-${inv.id}`} className="text-slate-400 hover:text-red-500 transition-colors mt-2"><TrashIcon/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700"/>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold dark:text-slate-100">Despesas Fixas</h3>
                        <button onClick={handleAddFixedExpense} data-testid="add-fixed-expense-button" className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            <PlusIcon /> Adicionar Categoria
                        </button>
                    </div>
                    <div className="space-y-4">
                    {fixedExpenses.map(expense => (
                        <div key={expense.id} data-testid={`fixed-expense-${expense.id}`} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl">
                        <div className="flex justify-between items-center gap-2 mb-3 flex-wrap">
                            <div className="flex items-center gap-3 flex-grow min-w-[150px]">
                                <button onClick={() => openIconModal(expense.id)} className="w-10 h-10 flex items-center justify-center text-slate-600 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex-shrink-0 shadow-sm">
                                    <span className="transform scale-125" dangerouslySetInnerHTML={{ __html: expense.icon }} />
                                </button>
                                {editingNameId === expense.id ? (
                                    <input type="text" value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)} onBlur={() => handleSaveName(expense.id)} onKeyDown={e => e.key === 'Enter' && handleSaveName(expense.id)} autoFocus className="font-semibold text-lg bg-transparent border-b-2 border-blue-500 outline-none w-full text-black dark:text-white" />
                                ) : (
                                    <label htmlFor={`expense-${expense.id}`} className="font-semibold text-lg flex-grow dark:text-slate-100">{expense.name}</label>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleStartEditingName(expense)} className="text-slate-400 hover:text-slate-600 transition-colors"><PencilIcon /></button>
                                <button onClick={() => handleDeleteFixedExpense(expense.id)} data-testid={`delete-fixed-expense-${expense.id}`} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
                                <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1">
                                <button
                                    onClick={() => handleAllocationTypeChange(expense.id, AllocationType.FIXED)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${expense.type === AllocationType.FIXED ? 'bg-white text-blue-600 dark:bg-slate-500 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    R$
                                </button>
                                <button
                                    onClick={() => handleAllocationTypeChange(expense.id, AllocationType.PERCENTAGE)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${expense.type === AllocationType.PERCENTAGE ? 'bg-white text-blue-600 dark:bg-slate-500 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    %
                                </button>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-slate-400">
                                {expense.type === AllocationType.FIXED ? 'R$' : '%'}
                            </span>
                            </div>
                            <input
                            type="number"
                            id={`expense-${expense.id}`}
                            data-testid={`fixed-expense-input-${expense.id}`}
                            value={expense.value}
                            onChange={(e) => handleExpenseChange(expense.id, parseFloat(e.target.value) || 0)}
                            onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                            onBlur={(e) => { if (e.target.value === '') handleExpenseChange(expense.id, 0); }}
                            className="w-full pl-12 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-black dark:text-white"
                            />
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold mb-4 dark:text-slate-100">Despesas Pontuais</h3>
                    <form onSubmit={handleAddOneTimeExpense} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
                        <input type="text" data-testid="one-time-expense-name-input" value={newOneTimeName} onChange={e => { setNewOneTimeName(e.target.value); if (oneTimeExpenseError) setOneTimeExpenseError(null); }} placeholder="Nome da despesa" className="flex-grow w-full sm:w-auto p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-black dark:text-white" />
                        <input type="number" data-testid="one-time-expense-value-input" value={newOneTimeValue} onChange={e => { setNewOneTimeValue(e.target.value); if (oneTimeExpenseError) setOneTimeExpenseError(null); }} placeholder="Valor (R$)" className="w-full sm:w-36 p-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-black dark:text-white" />
                        <button type="submit" data-testid="add-one-time-expense-button" className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex-shrink-0">Adicionar</button>
                    </form>
                    {oneTimeExpenseError && <p className="text-sm text-red-600 dark:text-red-400 -mt-1 mb-4">{oneTimeExpenseError}</p>}
                    <div className="space-y-3">
                        {oneTimeExpenses.map(expense => (
                            <div key={expense.id} data-testid={`one-time-expense-${expense.id}`} className="flex justify-between items-center p-3 bg-slate-500/10 dark:bg-slate-500/20 rounded-lg">
                                <span className="dark:text-slate-200">{expense.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold dark:text-slate-100">{formatCurrency(expense.value)}</span>
                                    <button onClick={() => handleDeleteOneTimeExpense(expense.id)} data-testid={`delete-one-time-expense-${expense.id}`} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg" style={getCardStyle(300)}>
                <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Resumo Financeiro</h2>
                <div className="space-y-4">
                  <SummaryCard data-testid="summary-total-income" title="Renda Total Mensal" value={formatCurrency(totalIncome)} icon={<WalletIcon />} color="text-blue-500 dark:text-blue-400" bgColor="bg-blue-100/70 dark:bg-blue-900/30" />
                  <SummaryCard data-testid="summary-total-invested" title="Total Investido" value={formatCurrency(totalInvested)} icon={<InvestmentIcon />} color="text-lime-500 dark:text-lime-400" bgColor="bg-lime-100/70 dark:bg-lime-900/30" />
                  <SummaryCard data-testid="summary-total-expenses" title="Total de Despesas" value={formatCurrency(totalExpenses)} icon={<MoneyBillIcon />} color="text-red-500 dark:text-red-400" bgColor="bg-red-100/70 dark:bg-red-900/30" />
                  <SummaryCard data-testid="summary-final-balance" title="Saldo Restante" value={formatCurrency(finalBalance)} icon={<BalanceIcon />} color={finalBalance >= 0 ? 'text-green-500 dark:text-green-400' : 'text-amber-500 dark:text-amber-400'} bgColor={finalBalance >= 0 ? 'bg-green-100/70 dark:bg-green-900/30' : 'bg-amber-100/70 dark:bg-amber-900/30'}/>
                  <SummaryCard data-testid="summary-previous-month-expenses" title="Gasto do Mês Anterior" value={formatCurrency(previousMonthExpenses)} icon={<CalendarIcon />} color="text-slate-500 dark:text-slate-400" bgColor="bg-slate-100/70 dark:bg-slate-700/30" />
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg" style={getCardStyle(400)}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold dark:text-slate-100">Metas</h2>
                    <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        <PlusIcon /> Adicionar
                    </button>
                </div>
                <div className="space-y-4">
                    {goals.length > 0 ? goals.map(goal => {
                        const progress = totalInvested > 0 ? (totalInvested / goal.targetAmount) * 100 : 0;
                        const isSoon = isDeadlineSoon(goal.deadline);
                        const isOverdue = isDeadlineOverdue(goal.deadline);

                        let containerClasses = "text-sm p-4 rounded-xl border-2 transition-colors";
                        let progressBarColor = "bg-blue-500";
                        let warningMessage = null;

                        if (isOverdue) {
                            containerClasses += " border-red-400 bg-red-500/10 dark:bg-red-500/20";
                            progressBarColor = "bg-red-500";
                            warningMessage = (
                                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2 flex items-center gap-1.5">
                                    <WarningIcon className="h-5 w-5" />
                                    Prazo vencido!
                                </p>
                            );
                        } else if (isSoon) {
                            containerClasses += " border-amber-400 bg-amber-500/10 dark:bg-amber-500/20";
                            progressBarColor = "bg-amber-500";
                            warningMessage = (
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 flex items-center gap-1.5">
                                    <WarningIcon className="h-5 w-5" />
                                    Prazo se aproximando!
                                </p>
                            );
                        } else {
                            containerClasses += " border-transparent bg-slate-500/5 dark:bg-slate-500/10";
                        }

                        return (
                            <div key={goal.id} className={containerClasses}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <p className="font-bold text-base dark:text-slate-100">{goal.name}</p>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{formatCurrency(goal.targetAmount)}</p>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                    <div 
                                      className={`h-3 rounded-full transition-all duration-500 ${progressBarColor}`} 
                                      style={{ width: `${Math.min(100, progress)}%` }}>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    Progresso: <span className="font-semibold text-slate-700 dark:text-slate-200">{progress.toFixed(1)}%</span>
                                </p>
                                {warningMessage}
                            </div>
                        );
                    }) : (
                        <p className="text-center text-slate-400 text-sm py-4">Crie metas para começar a poupar!</p>
                    )}
                </div>
              </div>

              <div style={getCardStyle(500)}>
                <SavingsTipsCard 
                  totalIncome={totalIncome}
                  fixedExpenses={fixedExpenses}
                  oneTimeExpenses={oneTimeExpenses}
                  remainingBalance={discretionaryIncome}
                />
              </div>

              <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg flex flex-col h-96" style={getCardStyle(600)}>
                  <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Distribuição</h2>
                  <div className="w-full flex-grow relative">
                    <BudgetChart data={chartData} theme={theme} />
                  </div>
              </div>
              
               <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg flex flex-col h-96" style={getCardStyle(700)}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold dark:text-slate-100">Projeção de Saldo</h2>
                    <select value={projectionPeriod} onChange={e => setProjectionPeriod(Number(e.target.value))} className="bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-sm py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white">
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                    </select>
                  </div>
                  <div className="w-full flex-grow relative">
                    <BalanceProjectionChart data={projectionData} theme={theme} />
                  </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative transition-all transform scale-95 opacity-0 animate-scale-in" style={{animation: 'scaleIn 0.3s ease-out forwards'}}>
            <button onClick={() => setIsGoalModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <CloseIcon />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Nova Meta de Poupança</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nome da Meta</label>
                <input type="text" id="goal-name" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Ex: Viagem de Férias" className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl transition text-black dark:text-white" />
              </div>
              <div>
                <label htmlFor="goal-amount" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Valor Total (R$)</label>
                <input 
                  type="number" 
                  id="goal-amount" 
                  value={newGoalAmount} 
                  onChange={e => setNewGoalAmount(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                  onBlur={(e) => { if (e.target.value === '') setNewGoalAmount(0); }}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl transition text-black dark:text-white" />
              </div>
              <div>
                <label htmlFor="goal-deadline" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Data Limite</label>
                <input type="date" id="goal-deadline" value={newGoalDeadline} onChange={e => setNewGoalDeadline(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl transition text-black dark:text-white" min={new Date().toISOString().split("T")[0]}/>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsGoalModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-300">
                Cancelar
              </button>
              <button onClick={handleAddGoal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105">
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
