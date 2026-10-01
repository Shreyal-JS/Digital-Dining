import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  QrCode,
  LineChart,
  MessageSquareQuote,
  Store,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Menu Dishes", href: "/dashboard/menu", icon: UtensilsCrossed },
  { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { label: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
  { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquareQuote },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  { label: "Restaurant Profile", href: "/dashboard/profile", icon: Store },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 flex flex-col min-h-screen border-r border-stone-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800">
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-xs text-stone-950 font-black">
            S
          </span>
          SilvyOS
        </h1>
        <p className="text-xs text-stone-400 mt-1">Restaurant Management</p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout / User Info */}
      <div className="p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div>
          <p className="font-semibold text-stone-200">Pilot Bistro Admin</p>
          <p className="text-[11px] truncate max-w-[140px]">manager@olivegrove.com</p>
        </div>
        <button
          title="Sign out"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/dashboard/login";
          }}
          className="text-stone-400 hover:text-white p-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
