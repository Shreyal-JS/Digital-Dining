import Link from "next/link";
import { ArrowRight, QrCode, LayoutDashboard, Sparkles, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          SilvyOS Architecture Skeleton & Platform Core
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          SilvyOS <span className="text-amber-500">Digital Dining</span>
        </h1>

        <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          High-performance digital menu platform designed for modern restaurants. Fast mobile menus,
          multi-tenant isolation, rich food presentation, AR-readiness, and actionable dining analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/r/olive-grove"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-900/30 transition active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            Launch Customer QR Menu
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-sm transition active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            Restaurant Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-stone-800/80 text-left">
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <h3 className="font-semibold text-stone-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Tenant Security
            </h3>
            <p className="text-stone-400 text-[11px] mt-1">
              Strict server-side isolation preventing any cross-tenant data leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <h3 className="font-semibold text-stone-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> 3D & AR Ready
            </h3>
            <p className="text-stone-400 text-[11px] mt-1">
              Optimized GLB/glTF pipelines with automatic fallback to standard photos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <h3 className="font-semibold text-stone-200 text-xs flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-sky-400" /> Stable QR Codes
            </h3>
            <p className="text-stone-400 text-[11px] mt-1">
              Menus update instantly without requiring restaurants to reprint physical QRs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
