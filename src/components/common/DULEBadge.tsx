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
          bg: 'bg-[#FFEBEB] border-[#FFCCD0] text-[#D7373F]',
          icon: <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'PII / Sensitive'
        };
      case 'Health':
        return {
          bg: 'bg-[#FFF1D9] border-[#FFE2B0] text-[#B25900]',
          icon: <Activity className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Health Data (DULE)'
        };
      case 'Financial':
        return {
          bg: 'bg-[#DEFBE6] border-[#B4F0C3] text-[#0E7A36]',
          icon: <DollarSign className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Financial Data'
        };
      case 'Behavioral':
        return {
          bg: 'bg-[#EBF3FC] border-[#D0E2F9] text-[#0D66D0]',
          icon: <Eye className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
          label: 'Behavioral Event'
        };
      default:
        return {
          bg: 'bg-[#F2F4F7] border-[#E1E5EA] text-[#1A1D23]',
          icon: <Shield className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
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

