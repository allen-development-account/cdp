import React from 'react';

interface BrandIconProps {
  name: string;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ name, className = 'w-8 h-8' }) => {
  switch (name) {
    case 'xpr':
    case 'xpr_analytics':
    case 'xpr_audience':
    case 'xpr_campaign':
    case 'xpr_data':
    case 'xpr_web_sdk':
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-[#1473E6] to-[#084A9E] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="white" />
            <circle cx="12" cy="4" r="1.5" fill="#90CAF9" />
            <circle cx="4.8" cy="16.5" r="1.5" fill="#90CAF9" />
            <circle cx="19.2" cy="16.5" r="1.5" fill="#90CAF9" />
            <path d="M12 7V9M6.8 15L9.6 13.4M17.2 15L14.4 13.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'advertising_cloud':
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-[#E1251B] to-[#B0140D] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 5l6.5 13H5.5L12 7z" />
          </svg>
        </div>
      );

    case 'awin':
    case 'awin_mastertag':
    case 'awin_conversion':
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-[#FF5A00] to-[#E03A00] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2c-4 5-8 9-8 14a8 8 0 0016 0c0-5-4-9-8-14zm0 18a4 4 0 01-4-4c0-2.5 2-4.5 4-7 2 2.5 4 4.5 4 7a4 4 0 01-4 4z" />
          </svg>
        </div>
      );

    case 'bing':
    case 'bing_ads':
      return (
        <div className={`${className} rounded-lg bg-[#008272] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M5 3v18l5.5-2.5 4 3.5 4.5-2.5V8.5L14.5 6 10.5 7.5V3H5zm5.5 8l3-1.2v4.8l-3 1.2V11z" />
          </svg>
        </div>
      );

    case 'branch':
      return (
        <div className={`${className} rounded-lg bg-[#0075C9] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="12" r="3" fill="white" />
            <circle cx="18" cy="6" r="2.5" fill="white" />
            <circle cx="18" cy="18" r="2.5" fill="white" />
            <path d="M9 12h3m0 0l3.5-5M12 12l3.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'doubleclick':
      return (
        <div className={`${className} rounded-lg bg-[#34A853] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1AA260] border border-white" />
          </div>
        </div>
      );

    case 'flashtalking':
      return (
        <div className={`${className} rounded-lg bg-[#222222] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <span className="font-serif font-black text-lg tracking-tighter leading-none">“ ”</span>
        </div>
      );

    case 'facebook':
    case 'facebook_pixel':
    case 'facebook_insights':
      return (
        <div className={`${className} rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      );

    case 'meta':
    case 'meta_ads':
      return (
        <div className={`${className} rounded-lg bg-[#0668E1] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 15.5c-2.4 0-4.1-1.6-4.9-3.4 1-2.2 3.1-3.6 5.4-3.6 2.3 0 4.4 1.4 5.4 3.6-.8 1.8-2.5 3.4-4.9 3.4h-1zm-6.8-3.4C6 9.8 8.8 8 12 8s6 1.8 6.8 4.1c-.8 2.3-3.6 4.1-6.8 4.1s-6-1.8-6.8-4.1z" />
          </svg>
        </div>
      );

    case 'google':
    case 'google_ads':
      return (
        <div className={`${className} rounded-lg bg-white border border-[#E1E5EA] flex items-center justify-center shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>
      );

    case 'linkedin':
    case 'linkedin_ads':
      return (
        <div className={`${className} rounded-lg bg-[#0077B5] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        </div>
      );

    case 'pinterest':
    case 'pinterest_ads':
      return (
        <div className={`${className} rounded-lg bg-[#BD081C] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 0a12 12 0 0 0-4.37 23.18c-.03-.98-.05-2.5.05-3.58l.78-3.32s-.2-.4-.2-.98c0-.92.53-1.6 1.2-1.6.57 0 .84.43.84.94 0 .57-.36 1.42-.55 2.21-.16.66.33 1.2.98 1.2 1.18 0 2.08-1.25 2.08-3.05 0-1.6-1.15-2.72-2.79-2.72-1.9 0-3.02 1.43-3.02 2.9 0 .57.22 1.19.5 1.52.05.07.06.13.04.2l-.19.78c-.03.12-.1.15-.23.09-.85-.4-1.39-1.64-1.39-2.64 0-2.15 1.56-4.13 4.5-4.13 2.37 0 4.2 1.69 4.2 3.95 0 2.35-1.48 4.24-3.53 4.24-.69 0-1.34-.36-1.56-.78l-.43 1.63c-.15.6-.57 1.34-.85 1.8A12 12 0 1 0 12 0z" />
          </svg>
        </div>
      );

    case 'marketo':
      return (
        <div className={`${className} rounded-lg bg-[#5C4C9F] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M3 3h4v18H3V3zm7 6h4v12h-4V9zm7-4h4v16h-4V5z" />
          </svg>
        </div>
      );

    case 'customer_attributes':
      return (
        <div className={`${className} rounded-lg bg-[#2D3B45] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );

    case 'aws':
    case 'amazon_s3':
    case 'amazon_dsp':
      return (
        <div className={`${className} rounded-lg bg-[#FF9900] flex items-center justify-center text-[#232F3E] shadow-2xs shrink-0 font-black text-xs`}>
          <span>AWS</span>
        </div>
      );

    case 'snowflake':
      return (
        <div className={`${className} rounded-lg bg-[#29B5E8] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'salesforce':
      return (
        <div className={`${className} rounded-lg bg-[#00A1E0] flex items-center justify-center text-white shadow-2xs shrink-0 font-bold text-xs`}>
          <span>SF</span>
        </div>
      );

    case 'shopify':
      return (
        <div className={`${className} rounded-lg bg-[#95BF47] flex items-center justify-center text-white shadow-2xs shrink-0 font-bold text-xs`}>
          <span>SHOP</span>
        </div>
      );

    case 'stripe':
      return (
        <div className={`${className} rounded-lg bg-[#635BFF] flex items-center justify-center text-white shadow-2xs shrink-0 font-bold text-xs`}>
          <span>S</span>
        </div>
      );

    case 'tiktok':
      return (
        <div className={`${className} rounded-lg bg-[#000000] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.74 4.54V11.8a8.28 8.28 0 0 0 5.71 2.2V10.6a4.83 4.83 0 0 1-2.48-.68 4.8 4.8 0 0 1-1.52-1.98v-1.25z" />
          </svg>
        </div>
      );

    case 'braze':
      return (
        <div className={`${className} rounded-lg bg-[#FF5A00] flex items-center justify-center text-white shadow-2xs shrink-0 font-bold text-xs`}>
          <span>BRZ</span>
        </div>
      );

    case 'klaviyo':
      return (
        <div className={`${className} rounded-lg bg-[#241F21] flex items-center justify-center text-white shadow-2xs shrink-0 font-serif font-black text-sm`}>
          <span>K</span>
        </div>
      );

    default:
      return (
        <div className={`${className} rounded-lg bg-[#1473E6] flex items-center justify-center text-white shadow-2xs shrink-0`}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
      );
  }
};
