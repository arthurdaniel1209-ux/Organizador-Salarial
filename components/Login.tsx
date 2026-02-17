
import React, { useState } from 'react';
import { getSupabase } from '../supabaseClient';
import { INITIAL_EXPENSES } from '../constants';
import { EyeIcon, EyeOffIcon } from './icons';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email.trim() || !password.trim() || !name.trim()) {
        setError("Por favor, preencha todos os campos.");
        setLoading(false);
        return;
    }
    if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        setLoading(false);
        return;
    }
    
    const supabase = getSupabase();
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
            data: {
                full_name: name.trim(),
            }
        }
    });

    if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
    }

    if (user) {
        const { error: insertError } = await supabase.from('user_data').insert({
            id: user.id,
            name: name.trim(),
            salary: 0,
            fixed_expenses: INITIAL_EXPENSES,
            onetime_expenses: [],
            onetime_gains: [],
            goals: [],
            investments: [],
            last_saved_month: new Date().getMonth(),
            previous_month_expenses: 0,
        });

        if (insertError) {
            setError("Erro ao criar perfil de usuário. Tente novamente.");
            console.error("Profile insert error:", insertError);
        }
        // Login will be handled by onAuthStateChange in App.tsx
    }
    setLoading(false);
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);
     setSuccess(null);
     setLoading(true);

      if (!email.trim() || !password.trim()) {
        setError("Por favor, preencha e-mail e senha.");
        setLoading(false);
        return;
    }

    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
    });

    if (error) {
        setError("E-mail ou senha incorretos.");
    }
    // onAuthStateChange in App.tsx will handle successful login
    setLoading(false);
  };
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
     if (!email.trim()) {
        setError("Por favor, informe seu e-mail.");
        setLoading(false);
        return;
    }
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
    });

    if (error) {
        setError(error.message);
    } else {
        setSuccess("Link de recuperação enviado para seu e-mail! Verifique sua caixa de entrada.");
    }
    setLoading(false);
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
              data-testid="email-input"
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="seu@email.com"
            />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} data-testid="send-recovery-link-button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
              data-testid="name-input"
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              data-testid="email-input"
              className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
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
                data-testid="confirm-password-input"
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="********"
              />
              <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={isConfirmPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}>
                {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} data-testid="register-button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Cadastrando...' : 'Cadastrar e Entrar'}
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
                data-testid="email-input"
                className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                  className="appearance-none block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-black dark:text-white"
                  placeholder="********"
                />
                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}>
                  {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" onClick={() => { setMode('forgot-password'); clearForm(); }} data-testid="forgot-password-link" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Esqueceu a senha?
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit" disabled={loading} data-testid="login-button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Entrando...' : 'Entrar'}
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
            
           <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
                <button onClick={() => { setMode('register'); clearForm(); }} data-testid="switch-to-register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Não tem uma conta? Cadastre-se
                </button>
            )}
            {mode === 'register' && (
                 <button onClick={() => { setMode('login'); clearForm(); }} data-testid="switch-to-login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Já tem uma conta? Faça login
                </button>
            )}
             {mode === 'forgot-password' && (
                 <button onClick={() => { setMode('login'); clearForm(); }} data-testid="back-to-login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                    Voltar para o Login
                </button>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Seus dados agora são salvos na nuvem de forma segura.
        </p>
      </div>
    </div>
  );
};

export default Login;
