
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { BarChartIcon } from './icons';

interface ProjectionData {
  name: string;
  saldo: number;
}

interface BalanceProjectionChartProps {
  data: ProjectionData[];
  theme: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(payload[0].value);
    
    return (
      <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 p-3 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <p className="font-bold text-slate-800 dark:text-slate-100">{label.replace('Mês', 'Mês ')}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">Saldo projetado:</p>
        <p className="text-lg font-semibold text-green-600 dark:text-green-400">{value}</p>
      </div>
    );
  }

  return null;
};

const BalanceProjectionChart: React.FC<BalanceProjectionChartProps> = ({ data, theme }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <BarChartIcon className="h-16 w-16 mb-4" />
        <p className="text-center text-sm font-medium">Seu saldo está zerado ou negativo.</p>
        <p className="text-center text-xs mt-1">Ajuste o orçamento para ver sua projeção.</p>
      </div>
    );
  }

  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: 10,
          bottom: 0,
        }}
        barCategoryGap="20%"
      >
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="4 4" />
        <XAxis 
            dataKey="name" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            stroke={axisColor}
            tickFormatter={(value: string) => value.replace('Mês ', 'M')}
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          stroke={axisColor}
          width={70}
          tickFormatter={(value: number) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />
        <Tooltip 
          cursor={{ fill: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.05)' }} 
          content={<CustomTooltip />} 
        />
        <ReferenceLine y={0} stroke={axisColor} strokeDasharray="2 2" />
        <Bar 
          dataKey="saldo" 
          fill="url(#colorSaldo)" 
          radius={[6, 6, 0, 0]} 
          animationDuration={1000}
          background={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', radius: [6, 6, 0, 0] }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BalanceProjectionChart;
