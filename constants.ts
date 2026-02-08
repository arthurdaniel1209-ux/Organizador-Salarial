
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
  {
    id: '7',
    name: 'Investimentos/Poupança',
    icon: '<i class="fa-solid fa-piggy-bank"></i>',
    value: 0,
    type: AllocationType.FIXED,
    color: '#84cc16', // lime-500
  },
];

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
];
