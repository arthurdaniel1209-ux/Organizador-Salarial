
import { Expense, AllocationType } from './types';

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: '1',
    name: 'Moradia',
    icon: '<i class="fa-solid fa-house-chimney"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#3b82f6', // blue-500
  },
  {
    id: '2',
    name: 'Alimentação',
    icon: '<i class="fa-solid fa-utensils"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#10b981', // emerald-500
  },
  {
    id: '3',
    name: 'Transporte',
    icon: '<i class="fa-solid fa-bus-simple"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#f97316', // orange-500
  },
  {
    id: '4',
    name: 'Saúde',
    icon: '<i class="fa-solid fa-briefcase-medical"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#ef4444', // red-500
  },
  {
    id: '5',
    name: 'Lazer',
    icon: '<i class="fa-solid fa-martini-glass-citrus"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#a855f7', // purple-500
  },
  {
    id: '6',
    name: 'Educação',
    icon: '<i class="fa-solid fa-graduation-cap"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#f59e0b', // amber-500
  },
];

export const CDI_ANNUAL_RATE = 0.104; // 10.40%

export const AVAILABLE_ICONS: string[] = [
  '<i class="fa-solid fa-house-chimney"></i>',
  '<i class="fa-solid fa-utensils"></i>',
  '<i class="fa-solid fa-bus-simple"></i>',
  '<i class="fa-solid fa-briefcase-medical"></i>',
  '<i class="fa-solid fa-martini-glass-citrus"></i>',
  '<i class="fa-solid fa-graduation-cap"></i>',
  '<i class="fa-solid fa-piggy-bank"></i>',
  '<i class="fa-solid fa-shopping-cart"></i>',
  '<i class="fa-solid fa-car"></i>',
  '<i class="fa-solid fa-plane"></i>',
  '<i class="fa-solid fa-gas-pump"></i>',
  '<i class="fa-solid fa-file-invoice-dollar"></i>',
  '<i class="fa-solid fa-gift"></i>',
  '<i class="fa-solid fa-pills"></i>',
  '<i class="fa-solid fa-tshirt"></i>',
  '<i class="fa-solid fa-film"></i>',
  '<i class="fa-solid fa-paw"></i>',
  '<i class="fa-solid fa-heart"></i>',
  '<i class="fa-solid fa-wrench"></i>',
  '<i class="fa-solid fa-credit-card"></i>',
  '<i class="fa-solid fa-mobile-screen-button"></i>',
  '<i class="fa-solid fa-wifi"></i>',
  '<i class="fa-solid fa-book"></i>',
  '<i class="fa-solid fa-gamepad"></i>',
  '<i class="fa-solid fa-chart-line"></i>',
];

export const SAVINGS_TIPS = [
  {
    title: 'Regra dos 30 Dias',
    description: 'Antes de fazer uma compra por impulso, espere 30 dias. Se ainda quiser o item após esse período, considere comprá-lo. Muitas vezes, o desejo desaparece.',
  },
  {
    title: 'Planeje suas Refeições',
    description: 'Dedique um tempo para planejar as refeições da semana. Isso ajuda a comprar apenas o necessário no supermercado, evitando desperdícios e gastos com delivery.',
  },
  {
    title: 'Cancele Assinaturas Não Utilizadas',
    description: 'Revise suas assinaturas mensais (streaming, apps, revistas). Cancele aquelas que você não usa com frequência. Pequenos valores somados fazem uma grande diferença.',
  },
  {
    title: 'Automatize sua Poupança',
    description: 'Configure uma transferência automática para sua conta de investimentos ou poupança assim que receber o salário. "Pague-se primeiro" e você se adaptará a viver com o restante.',
  },
  {
    title: 'Use o Transporte Público',
    description: 'Deixar o carro em casa uma ou duas vezes por semana pode economizar uma quantia significativa em combustível e manutenção ao longo do ano.',
  },
  {
    title: 'Faça Você Mesmo (DIY)',
    description: 'Aprenda a fazer pequenos reparos em casa ou a cozinhar aquele prato caro do restaurante. Além de economizar, você pode descobrir um novo hobby.',
  },
  {
    title: 'Compare Preços Sempre',
    description: 'Antes de qualquer compra, use comparadores de preço online ou pesquise em diferentes lojas. A diferença de valor pode ser surpreendente.',
  },
  {
    title: 'Desconecte Aparelhos da Tomada',
    description: 'Aparelhos em modo stand-by continuam consumindo energia. Desconectá-los quando não estão em uso pode reduzir sua conta de luz.',
  },
  {
    title: 'Aproveite Programas de Fidelidade',
    description: 'Cadastre-se nos programas de pontos e cashback. Com o tempo, eles podem gerar descontos significativos ou até produtos gratuitos.',
  },
];
