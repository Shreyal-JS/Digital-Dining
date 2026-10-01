"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardMetrics } from "@/types";
import { Card } from "@/components/common/Card";
import { Eye, Users, Sparkles, MessageSquare, TrendingUp, Utensils } from "lucide-react";

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/restaurants/rest_01_pilot_bistro/analytics");
        const json = await res.json();
        if (json.success) {
          setMetrics(json.data);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard Overview</h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time digital menu engagement and customer dining telemetry.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Menu Views</span>
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-2">
              {loading ? "..." : metrics?.totalMenuViews || 0}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Total QR scans & opens</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Unique Sessions</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-2">
              {loading ? "..." : metrics?.uniqueSessions || 0}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Unique diners</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">3D / AR Launches</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-2">
              {loading ? "..." : metrics?.arLaunches || 0}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Virtual dish inspections</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Avg Rating</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-stone-900 mt-2">
              {loading ? "..." : `${metrics?.averageFeedbackRating || 0} / 5.0`}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              From {metrics?.totalFeedbackCount || 0} customer reviews
            </p>
          </Card>
        </div>

        {/* Section: Top Viewed Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Most Viewed Dishes
            </h2>

            <div className="space-y-3">
              {metrics?.topDishes.map((item, idx) => (
                <div key={item.dishId} className="flex items-center justify-between text-sm py-2 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-stone-800">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">{item.views} views</span>
                </div>
              ))}

              {(!metrics?.topDishes || metrics.topDishes.length === 0) && (
                <p className="text-xs text-stone-400 py-4 text-center">No dish telemetry recorded yet.</p>
              )}
            </div>
          </Card>

          {/* Quick Menu Actions Guide */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-4">
              <Utensils className="w-4 h-4 text-amber-600" />
              Pilot Restaurant Quick Links
            </h2>
            <div className="space-y-2 text-xs">
              <p className="text-stone-600">
                To test the live customer experience on mobile or tablet, visit the public URL or scan your QR code:
              </p>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800 break-all select-all">
                http://localhost:3000/r/olive-grove
              </div>
              <p className="text-stone-400 text-[11px] mt-2">
                Tip: Changes to dish prices or availability take effect instantly on customer phones without changing the QR code.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
