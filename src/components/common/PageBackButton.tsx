import React from 'react';
import { useCDP } from '../../context/CDPContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface PageBackButtonProps {
  fallbackTab?: string;
  fallbackLabel?: string;
  customLabel?: string;
  onCustomBack?: () => void;
  showForward?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const PageBackButton: React.FC<PageBackButtonProps> = ({
  fallbackTab,
  fallbackLabel,
  customLabel,
  onCustomBack,
  showForward = true,
  className = '',
  size = 'md'
}) => {
  const {
    activeTab,
    history,
    historyIndex,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    getPreviousTabTitle,
    getNextTabTitle,
    setActiveTab,
    guidedReturnStep,
    returnToGuidedStep
  } = useCDP();

  const hasHistoryBack = historyIndex > 0;
  const prevTab = hasHistoryBack ? history[historyIndex - 1] : null;
  const isGuidedNavigation = guidedReturnStep !== null && activeTab !== 'get_started';
  const isPrevGetStarted = prevTab === 'get_started' || isGuidedNavigation;
  const prevTitle = getPreviousTabTitle() || fallbackLabel || 'Previous';
  const nextTitle = getNextTabTitle() || 'Forward';

  const handleBack = () => {
    if (onCustomBack) {
      onCustomBack();
    } else if (isGuidedNavigation) {
      returnToGuidedStep();
    } else if (canGoBack) {
      goBack();
    } else if (fallbackTab) {
      setActiveTab(fallbackTab);
    }
  };

  const isEnabled = canGoBack || !!onCustomBack || !!fallbackTab || isGuidedNavigation;

  const displayLabel =
    customLabel ||
    (isGuidedNavigation
      ? `Back to Get Started (Step ${guidedReturnStep})`
      : isPrevGetStarted
      ? `Back to ${prevTitle}`
      : `Back to ${fallbackLabel || prevTitle}`);

  const isSm = size === 'sm';

  return (
    <div className={`inline-flex items-center space-x-1.5 ${className}`}>
      <button
        onClick={handleBack}
        disabled={!isEnabled}
        title={isEnabled ? `Navigate back to ${displayLabel} (Alt + ←)` : 'No previous page'}
        aria-label={displayLabel}
        className={`inline-flex items-center space-x-1.5 rounded-lg font-semibold transition-all border shadow-2xs select-none whitespace-nowrap shrink-0 ${
          isSm ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
        } ${
          isEnabled
            ? 'bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] border-[#D5D5D5] hover:border-[#1473E6] hover:text-[#1473E6] active:scale-98 cursor-pointer'
            : 'bg-[#F8F9FA] text-[#262A33] border-[#E8ECEF] cursor-not-allowed opacity-50'
        }`}
      >
        <ArrowLeft className={isSm ? 'w-3 h-3 text-[#1473E6] shrink-0' : 'w-3.5 h-3.5 text-[#1473E6] shrink-0'} />
        <span className="truncate max-w-[240px]">{displayLabel}</span>
      </button>

      {showForward && canGoForward && (
        <button
          onClick={goForward}
          title={`Navigate forward to ${nextTitle} (Alt + →)`}
          aria-label={`Forward to ${nextTitle}`}
          className={`inline-flex items-center space-x-1 rounded-lg font-semibold bg-white hover:bg-[#F2F4F7] text-[#1A1D23] hover:text-[#1473E6] border border-[#D5D5D5] hover:border-[#1473E6] transition-all shadow-2xs select-none active:scale-98 cursor-pointer ${
            isSm ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-xs'
          }`}
        >
          <span className="hidden sm:inline text-[11px] truncate max-w-[120px]">{nextTitle}</span>
          <ArrowRight className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      )}
    </div>
  );
};
