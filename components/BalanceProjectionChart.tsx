
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
        <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-slate-600 dark:text-slate-300">{value}</p>
      </div>
    );
  }

  return null;
};

const BalanceProjectionChart: React.FC<BalanceProjectionChartProps> = ({ data, theme }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p className="text-center text-sm">Seu saldo está negativo ou zerado. Ajuste o orçamento para ver a projeção.</p>
      </div>
    );
  }

  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b'; // slate-400 : slate-500

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 30,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={axisColor} strokeOpacity={0.2} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          stroke={axisColor}
          tickFormatter={(value: number) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />
        <Tooltip cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }} content={<CustomTooltip />} />
        <Bar dataKey="saldo" fill="url(#colorSaldo)" radius={[4, 4, 0, 0]} animationDuration={800} />
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.5}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BalanceProjectionChart;
