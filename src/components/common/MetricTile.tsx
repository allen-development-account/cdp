import React, { ReactNode } from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'accent';
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  badge
}) => {
  const getChangeBadge = () => {
    if (!change) return null;
    if (changeType === 'positive') {
      return (
        <span className="text-[11px] text-[#0E7A36] font-semibold bg-[#DEFBE6] px-1.5 py-0.5 rounded border border-[#B4F0C3]">
          {change}
        </span>
      );
    }
    if (changeType === 'negative') {
      return (
        <span className="text-[11px] text-[#D7373F] font-semibold bg-[#FFEBEB] px-1.5 py-0.5 rounded border border-[#FFCCD0]">
          {change}
        </span>
      );
    }
    if (changeType === 'accent') {
      return (
        <span className="text-[11px] text-[#0D66D0] font-semibold bg-[#EBF3FC] px-1.5 py-0.5 rounded border border-[#D0E2F9]">
          {change}
        </span>
      );
    }
    return <span className="text-[11px] text-[#1E2229] font-normal">{change}</span>;
  };

  return (
    <div className="bg-[#FFFFFF] p-4 rounded-md border border-[#E1E5EA] shadow-2xs flex flex-col justify-between hover:border-[#CBD2DA] transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-[#1E2229] uppercase tracking-wider">{label}</p>
        {icon && <div className="text-[#262A33]">{icon}</div>}
        {badge && <span className="text-[10px] bg-[#F0F2F5] text-[#1A1D23] font-medium px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <div className="mt-2.5 flex items-baseline space-x-2">
        <span className="text-2xl lg:text-3xl font-bold text-[#2C2C2C] tracking-tight">{value}</span>
        {getChangeBadge()}
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-[#262A33] font-normal">{subtitle}</p>}
    </div>
  );
};

