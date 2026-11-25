import React from 'react';
import { PrivacyClassification } from '../../types/cdp';
import { Shield, ShieldAlert, DollarSign, Activity, Eye } from 'lucide-react';

interface DULEBadgeProps {
  classification: PrivacyClassification;
  isSensitive?: boolean;
  size?: 'sm' | 'md';
}

export const DULEBadge: React.FC<DULEBadgeProps> = ({
  classification,
  isSensitive = false,
  size = 'sm'
}) => {
  const getBadgeStyle = () => {
    switch (classification) {
      case 'Sensitive':
        return {
          bg: 'bg-[#DBEAFE] border-[#93C5FD] text-[#0A3D82]',
          icon: <ShieldAlert className={size === 'sm' ? 'w-3 h-3 text-[#0A3D82]' : 'w-3.5 h-3.5 text-[#0A3D82]'} />,
          label: 'PII / Sensitive'
        };
      case 'Health':
        return {
          bg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
          icon: <Activity className={size === 'sm' ? 'w-3 h-3 text-[#1D4ED8]' : 'w-3.5 h-3.5 text-[#1D4ED8]'} />,
          label: 'Health Data (DULE)'
        };
      case 'Financial':
        return {
          bg: 'bg-[#E0F2FE] border-[#7DD3FC] text-[#0369A1]',
          icon: <DollarSign className={size === 'sm' ? 'w-3 h-3 text-[#0284C7]' : 'w-3.5 h-3.5 text-[#0284C7]'} />,
          label: 'Financial Data'
        };
      case 'Behavioral':
        return {
          bg: 'bg-[#EBF3FC] border-[#BFDBFE] text-[#0D66D0]',
          icon: <Eye className={size === 'sm' ? 'w-3 h-3 text-[#1473E6]' : 'w-3.5 h-3.5 text-[#1473E6]'} />,
          label: 'Behavioral Event'
        };
      default:
        return {
          bg: 'bg-[#F0F7FF] border-[#C5DCFA] text-[#0F58B8]',
          icon: <Shield className={size === 'sm' ? 'w-3 h-3 text-[#0F58B8]' : 'w-3.5 h-3.5 text-[#0F58B8]'} />,
          label: 'Standard DULE'
        };
    }
  };

  const style = getBadgeStyle();
  const textSize = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center space-x-1 font-medium rounded border ${style.bg} ${textSize} tracking-tight select-none`}>
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};

