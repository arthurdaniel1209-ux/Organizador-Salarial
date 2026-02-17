
import React, { useState } from 'react';
import { INITIAL_EXPENSES } from '../constants';
import { UserData } from '../types';
import { EyeIcon, EyeOffIcon } from './icons';

interface LoginProps {
  onLogin: (email: string, data: UserData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setRecoveryLink(null);
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim() || !password.trim() || !name.trim()) {
        setError("Por favor, preencha todos os campos.");
        return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUserData = localStorage.getItem(`budget_data_${trimmedEmail}`);

    if (existingUserData) {
        setError("Este e-mail já está em uso. Por favor, faça login.");
        setMode('login'); // Muda para a tela de login
        setPassword('');
        setConfirmPassword('');
        return;
    }
    if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
    }
    
    const newUser: UserData = {
        name: name.trim(),
        salary: 0,
        password: password,
        fixedExpenses: INITIAL_EXPENSES,
        oneTimeExpenses: [],
        oneTimeGains: [],
        goals: [],
        investments: [],
        lastSavedMonth: new Date().getMonth(),
        previousMonthExpenses: 0,
    };
    localStorage.setItem(`budget_data_${trimmedEmail}`, JSON.stringify(newUser));
    onLogin(trimmedEmail, newUser);
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);
     setSuccess(null);
      if (!email.trim() || !password.trim()) {
        setError("Por favor, preencha e-mail e senha.");
        return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    const existingUserData = localStorage.getItem(`budget_data_${trimmedEmail}`);
    
    if (existingUserData) {
        const userData: UserData = JSON.parse(existingUserData);
        if (userData.password === password) {
            onLogin(trimmedEmail, userData);
        } else {
            setError("E-mail ou senha incorretos.");
        }
    } else {
        setError("E-mail ou senha incorretos.");
    }
  };
  
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRecoveryLink(null);
     if (!email.trim()) {
        setError("Por favor, informe seu e-mail.");
        return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    const existingUserData = localStorage.getItem(`budget_data_${trimmedEmail}`);
    
    if (existingUserData) {
      const userData: UserData = JSON.parse(existingUserData);
      const token = crypto.randomUUID();
      const expires = Date.now() + 3600000; // 1 hora
      
      userData.recoveryToken = token;
      userData.recoveryTokenExpires = expires;
      
      localStorage.setItem(`budget_data_${trimmedEmail}`, JSON.stringify(userData));
      
      const link = `${window.location.origin}/?reset-token=${token}`;
      setRecoveryLink(link);
      setSuccess("Link de recuperação gerado com sucesso.");

    } else {
        setError("Nenhuma conta encontrada com este e-mail.");
    }
  };

  const renderForm = () => {
    if (mode === 'forgot-password') {
      return (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="seu@email.com"
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
              Enviar Link de Recuperação
            </button>
          </div>
        </form>
      );
    }

    if (mode === 'register') {
      return (
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="********"
              />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}>
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirmar Senha</label>
            <div className="relative">
              <input id="confirm-password" name="confirm-password" type={isConfirmPasswordVisible ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="********"
              />
              <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={isConfirmPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}>
                {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
              Cadastrar e Entrar
            </button>
          </div>
        </form>
      );
    }
    
    // Login form as default
    return (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                  placeholder="********"
                />
                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}>
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" onClick={() => { setMode('forgot-password'); clearForm(); }} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Esqueceu a senha?
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105">
                Entrar
              </button>
            </div>
        </form>
    );
  }

  const getTitle = () => {
    if (mode === 'register') return "Crie sua conta para começar.";
    if (mode === 'forgot-password') return "Recupere seu acesso.";
    return "Bem-vindo de volta!";
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Organizador de Salário
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
            {getTitle()}
          </p>
        </header>
        <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg">
            {renderForm()}
            
            {error && <p className="mt-4 text-sm text-center font-medium text-red-600 bg-red-100/50 dark:bg-red-500/20 dark:text-red-400 p-2 rounded-lg">{error}</p>}
            {success && <p className="mt-4 text-sm text-center font-medium text-green-600 bg-green-100/50 dark:bg-green-500/20 dark:text-green-400 p-2 rounded-lg">{success}</p>}
            
            {recoveryLink && (
                <div className="mt-4 text-sm text-center p-3 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg space-y-2">
                    <p className="text-slate-600 dark:text-slate-300">Em uma aplicação real, um e-mail seria enviado. Para continuar, clique no link abaixo:</p>
                    <a href={recoveryLink} className="font-bold text-blue-600 dark:text-blue-400 break-all hover:underline">Redefinir Senha</a>
                </div>
            )}

           <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
                <button onClick={() => { setMode('register'); clearForm(); }} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Não tem uma conta? Cadastre-se
                </button>
            )}
            {mode === 'register' && (
                 <button onClick={() => { setMode('login'); clearForm(); }} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Já tem uma conta? Faça login
                </button>
            )}
             {mode === 'forgot-password' && (
                 <button onClick={() => { setMode('login'); clearForm(); }} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Voltar para o Login
                </button>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Seus dados são salvos localmente no seu navegador.
        </p>
      </div>
    </div>
  );
};

export default Login;
