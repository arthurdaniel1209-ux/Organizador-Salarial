// FIX: Import 'test' and 'expect' from playwright to resolve test runner errors.
import { test, expect } from '@playwright/test';

/**
 * Script de teste de ponta a ponta (E2E) para o Organizador de Salário.
 * Este script é projetado para ser executado com uma ferramenta como o TestSprite.
 * 
 * O teste cobre o seguinte fluxo de usuário:
 * 1.  Acessa a página e navega para o formulário de cadastro.
 * 2.  Registra um novo usuário com um e-mail único.
 * 3.  Após o login automático, interage com o aplicativo principal:
 *     a. Define um salário.
 *     b. Verifica se o card "Renda Total" é atualizado.
 *     c. Adiciona uma despesa pontual.
 *     d. Verifica se o "Saldo Restante" é recalculado corretamente.
 *     e. Adiciona um investimento.
 *     f. Verifica se os cards "Total Investido" e "Saldo Restante" são atualizados.
 * 4.  Testa a funcionalidade de "Dicas com IA".
 * 5.  Faz logout da aplicação.
 * 6.  Faz login com as credenciais do usuário recém-criado.
 * 7.  Verifica se os dados inseridos (como o salário) foram salvos e carregados corretamente.
 */
test('Fluxo completo: cadastro, uso do app, logout e login', async (page) => {
  // Gera um e-mail único para cada execução do teste para evitar conflitos de cadastro
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'StrongPassword123!';
  const testName = 'Usuário de Teste';

  // --- 1. Fluxo de Cadastro ---
  await page.goto('/');
  
  // Aguarda o botão de cadastro aparecer e clica nele
  await page.waitForSelector('[data-testid="switch-to-register"]');
  await page.click('[data-testid="switch-to-register"]');
  
  // Preenche o formulário de cadastro
  await page.fill('[data-testid="name-input"]', testName);
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  await page.fill('[data-testid="confirm-password-input"]', testPassword);
  
  // Envia o formulário
  await page.click('[data-testid="register-button"]');

  // --- 2. Interação com o App Principal ---
  // Aguarda o carregamento do painel principal do aplicativo
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  
  // Verifica a mensagem de boas-vindas
  await expect(page.locator(`text=Bem-vindo, ${testName}!`)).toBeVisible();
  
  // Define o salário
  await page.fill('[data-testid="salary-input"]', '5000');
  
  // Verifica se o resumo de renda total foi atualizado
  await expect(page.locator('[data-testid="summary-total-income"]')).toContainText('R$ 5.000,00');

  // Adiciona uma despesa pontual
  await page.fill('[data-testid="one-time-expense-name-input"]', 'Café Especial');
  await page.fill('[data-testid="one-time-expense-value-input"]', '50');
  await page.click('[data-testid="add-one-time-expense-button"]');
  
  // Verifica se o saldo restante foi atualizado (R$ 5000 - R$ 50 = R$ 4950)
  // Nota: Isso assume que as despesas fixas iniciais são 0.
  await expect(page.locator('[data-testid="summary-final-balance"]')).toContainText('R$ 4.950,00');

  // Adiciona um investimento
  await page.fill('[data-testid="investment-name-input"]', 'Poupança Meta');
  await page.fill('[data-testid="investment-amount-input"]', '200');
  await page.click('[data-testid="add-investment-button"]');

  // Verifica se o total investido e o saldo foram atualizados
  await expect(page.locator('[data-testid="summary-total-invested"]')).toContainText('R$ 200,00');
  await expect(page.locator('[data-testid="summary-final-balance"]')).toContainText('R$ 4.750,00'); // 4950 - 200
  
  // --- 3. Dicas com IA ---
  await page.click('[data-testid="generate-ai-tips-button"]');
  
  // Aguarda o conteúdo da dica gerada pela IA aparecer
  await page.waitForSelector('[data-testid="ai-tip-content"]', { timeout: 15000 });
  await expect(page.locator('[data-testid="ai-tip-content"]')).toBeVisible();

  // --- 4. Logout ---
  await page.click('[data-testid="logout-button"]');
  
  // Aguarda o retorno para a tela de login
  await page.waitForSelector('[data-testid="login-button"]');

  // --- 5. Fluxo de Login ---
  // Preenche o formulário de login com o usuário criado
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', testPassword);
  await page.click('[data-testid="login-button"]');

  // Aguarda o carregamento do painel e verifica a persistência dos dados
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  
  // Confirma que o valor do salário foi salvo corretamente
  const salaryValue = await page.inputValue('[data-testid="salary-input"]');
  expect(salaryValue).toBe('5000');
});