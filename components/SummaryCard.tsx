
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, bgColor }) => {
  return (
    <div className={`flex items-center p-4 rounded-2xl ${bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
      <div className={`p-3 rounded-xl mr-4 ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8" })}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
