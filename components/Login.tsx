
import React, { useState } from 'react';
import { INITIAL_EXPENSES } from '../constants';
import { UserData } from '../types';
import { EyeIcon, EyeOffIcon } from './icons';

interface LoginProps {
  onLogin: (email: string, data: UserData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
        setError("Por favor, preencha todos os campos.");
        return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUserData = localStorage.getItem(`budget_data_${trimmedEmail}`);

    if (isRegistering) {
        // Modo Cadastro
        if (existingUserData) {
            setError("Este e-mail já está em uso. Tente outro ou faça login.");
            return;
        }
        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
        
        const newUser: UserData = {
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

    } else {
        // Modo Login
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
    }
  };
  
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Organizador de Salário
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
            {isRegistering ? "Crie sua conta para começar." : "Bem-vindo de volta!"}
          </p>
        </header>
        <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {isRegistering && (
                <div>
                    <label
                        htmlFor="confirm-password"
                        className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >
                        Confirmar Senha
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                        placeholder="********"
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label={isConfirmPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                </div>
            )}
            
            {error && <p className="text-sm text-center font-medium text-red-600 bg-red-100/50 dark:bg-red-500/20 dark:text-red-400 p-2 rounded-lg">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                {isRegistering ? 'Cadastrar e Entrar' : 'Entrar'}
              </button>
            </div>
          </form>
           <div className="mt-6 text-center text-sm">
            <button onClick={toggleMode} className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                {isRegistering ? "Já tem uma conta? Faça login" : "Não tem uma conta? Cadastre-se"}
            </button>
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
