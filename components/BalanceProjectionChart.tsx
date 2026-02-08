
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProjectionData {
  name: string;
  saldo: number;
}

interface BalanceProjectionChartProps {
  data: ProjectionData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(payload[0].value);
    
    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{`${label}: ${value}`}</p>
      </div>
    );
  }

  return null;
};

const BalanceProjectionChart: React.FC<BalanceProjectionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-center text-sm">Seu saldo está negativo ou zerado. Ajuste o orçamento para ver a projeção.</p>
      </div>
    );
  }

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
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          stroke="#6b7280"
          tickFormatter={(value: number) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />
        <Tooltip cursor={{ fill: 'rgba(113, 113, 122, 0.1)' }} content={<CustomTooltip />} />
        <Bar dataKey="saldo" fill="url(#colorSaldo)" radius={[4, 4, 0, 0]} animationDuration={800} />
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.4}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BalanceProjectionChart;
