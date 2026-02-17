
import React, { useState } from 'react';
import { getSupabase } from '../supabaseClient';
import { EyeIcon, EyeOffIcon } from './icons';

interface PasswordResetProps {
  onResetSuccess: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onResetSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!password || !confirmPassword) {
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
    const { error: updateError } = await supabase.auth.updateUser({ password: password });

    if (updateError) {
      setError("Ocorreu um erro ao redefinir a senha. O link pode ter expirado.");
      console.error("Password update error:", updateError);
    } else {
      onResetSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Redefinir Senha
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
            Crie uma nova senha para sua conta.
          </p>
        </header>
        <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password"className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
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
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Nova Senha
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
            {error && <p className="text-sm text-center font-medium text-red-600 bg-red-100/50 dark:bg-red-500/20 dark:text-red-400 p-2 rounded-lg">{error}</p>}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
