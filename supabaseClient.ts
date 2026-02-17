
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Obtém a instância singleton do cliente Supabase.
 */
export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Configuração do Supabase com as chaves fornecidas.
  // A chave 'anon' é segura para ser usada no frontend.
  const supabaseUrl = "https://uqlakunxscahlyyocwhj.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGFrdW54c2NhaGx5eW9jd2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTUwOTMsImV4cCI6MjA4NjkzMTA5M30.MWnVj0t0mdjjRHn7a5BSrsybwo0ojlK2E_MpG87AOqo";


  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("As credenciais do Supabase não foram configuradas corretamente no arquivo supabaseClient.ts.");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};
