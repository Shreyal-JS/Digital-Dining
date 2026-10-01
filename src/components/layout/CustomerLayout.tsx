import React, { ReactNode } from "react";

interface CustomerLayoutProps {
  restaurantName: string;
  logoUrl?: string | null;
  currency: string;
  selectedLanguage: string;
  supportedLanguages: string[];
  onLanguageChange: (lang: string) => void;
  onOpenFeedback: () => void;
  children: ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  restaurantName,
  logoUrl,
  selectedLanguage,
  supportedLanguages,
  onLanguageChange,
  onOpenFeedback,
  children,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20 max-w-md mx-auto shadow-2xl relative">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={restaurantName} className="w-8 h-8 rounded-full object-cover border border-stone-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
              {restaurantName.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-stone-800 text-sm tracking-tight truncate max-w-[170px]">
            {restaurantName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs bg-stone-100 border border-stone-300 rounded px-2 py-1 font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            aria-label="Select Menu Language"
          >
            {supportedLanguages.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Feedback Trigger */}
          <button
            onClick={onOpenFeedback}
            className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded font-medium transition"
          >
            Feedback
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-3">{children}</main>

      {/* Persistent Bottom Minimal Info */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur border-t border-stone-200 py-2 text-center text-[10px] text-stone-500 z-20">
        Powered by <strong className="text-stone-700">SilvyOS</strong> Digital Dining
      </footer>
    </div>
  );
};
