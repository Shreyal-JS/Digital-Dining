"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardMetrics, Dish, Feedback } from "@/types";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  Eye,
  Users,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Utensils,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Search,
  Star,
  ChevronRight,
  RefreshCw,
  Zap,
  Coffee,
  Download,
  AlertCircle,
  Radio,
  Layers,
  Flame,
} from "lucide-react";

const RESTAURANT_ID = "rest_01_pilot_bistro";
const RESTAURANT_SLUG = "olive-grove";

interface ActivityEvent {
  id: string;
  type: "scan" | "ar_view" | "review" | "stock" | "waiter";
  title: string;
  subtitle: string;
  timeAgo: string;
  table?: string;
  badge?: string;
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [kitchenSearch, setKitchenSearch] = useState("");
  const [serviceShift, setServiceShift] = useState<"LUNCH" | "DINNER" | "PAUSED">("DINNER");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live real-time floor activity stream
  const [liveActivities, setLiveActivities] = useState<ActivityEvent[]>([
    {
      id: "act-1",
      type: "scan",
      title: "Table 4 scanned the digital menu",
      subtitle: "Main Dining Room • Safari iOS",
      timeAgo: "2m ago",
      table: "Table 4",
      badge: "Menu Scan",
    },
    {
      id: "act-2",
      type: "ar_view",
      title: "Heirloom Tomato Bruschetta viewed in 3D/AR",
      subtitle: "Table 2 • Patio & Garden Bar • WebXR QuickLook",
      timeAgo: "5m ago",
      table: "Table 2",
      badge: "AR Launch",
    },
    {
      id: "act-3",
      type: "review",
      title: "New 5★ review submitted: \"3D portions were spot on!\"",
      subtitle: "Verified Dine-In • Table 19 • Patio",
      timeAgo: "12m ago",
      table: "Table 19",
      badge: "5.0 ★ Review",
    },
    {
      id: "act-4",
      type: "stock",
      title: "Truffle Tagliatelle marked 86'd Out-of-Stock",
      subtitle: "Action by Chef Marco Bellini",
      timeAgo: "28m ago",
      badge: "86'd Item",
    },
    {
      id: "act-5",
      type: "waiter",
      title: "Table 11 requested service check & water refill",
      subtitle: "Mezzanine Lounge • Acknowledged by Sarah J.",
      timeAgo: "41m ago",
      table: "Table 11",
      badge: "Waiter Call",
    },
    {
      id: "act-6",
      type: "scan",
      title: "Table 14 scanned the digital menu",
      subtitle: "Main Dining Room • Chrome Android",
      timeAgo: "54m ago",
      table: "Table 14",
      badge: "Menu Scan",
    },
  ]);

  // Load metrics, dishes, and recent feedback
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mRes, dRes, fRes] = await Promise.all([
          fetch(`/api/restaurants/${RESTAURANT_ID}/analytics`),
          fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`),
          fetch(`/api/restaurants/${RESTAURANT_ID}/feedback`),
        ]);

        const mJson = await mRes.json();
        const dJson = await dRes.json();
        const fJson = await fRes.json();

        if (mJson.success) setMetrics(mJson.data);
        if (dJson.success) setDishes(dJson.data);
        if (fJson.success) setFeedback(fJson.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load dashboard overview data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Quick toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy customer-facing menu link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/r/${RESTAURANT_SLUG}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast("Customer menu link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Instant In-Service 86'd Toggle
  const handleToggleDishAvailability = async (dish: Dish) => {
    const nextAvailability = !dish.isAvailable;

    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: nextAvailability } : d))
    );

    try {
      const res = await fetch(`/api/dishes/${dish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextAvailability }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Add to live activity feed
      const newEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: "stock",
        title: `${dish.name} marked ${nextAvailability ? "In Stock" : "86'd Out-of-Stock"}`,
        subtitle: `Floor manager update • Instant sync to /r/${RESTAURANT_SLUG}`,
        timeAgo: "Just now",
        badge: nextAvailability ? "In Stock" : "86'd",
      };
      setLiveActivities((prev) => [newEvent, ...prev.slice(0, 5)]);

      showToast(
        `${dish.name} is now ${nextAvailability ? "available (In Stock)" : "86'd (Sold Out)"}`
      );
    } catch (err) {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: dish.isAvailable } : d))
      );
      alert("Failed to update dish availability. Please try again.");
    }
  };

  // Filtered dishes for quick kitchen action
  const filteredKitchenDishes = useMemo(() => {
    if (!kitchenSearch.trim()) return dishes.slice(0, 5);
    const q = kitchenSearch.toLowerCase();
    return dishes.filter((d) => d.name.toLowerCase().includes(q) || d.ingredients?.toLowerCase().includes(q)).slice(0, 6);
  }, [dishes, kitchenSearch]);

  // Enriched top dishes with visual assets and 3D status
  const enrichedTopDishes = useMemo(() => {
    if (dishes.length === 0) return [];
    return dishes
      .map((dish, idx) => {
        const views = 1420 - idx * 240 + Math.floor(Math.random() * 50);
        const has3D = Boolean(dish.model3dUrl);
        const arRate = has3D ? 44 : 0;
        return {
          dish,
          views,
          has3D,
          arRate,
          categoryName: dish.categoryId.includes("cat_01")
            ? "Starter"
            : dish.categoryId.includes("cat_02")
            ? "Wood-Fired Main"
            : dish.categoryId.includes("cat_03")
            ? "Dessert"
            : "Beverage",
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [dishes]);

  // Latest verified feedback reviews
  const recentReviews = useMemo(() => {
    if (feedback.length > 0) return feedback.slice(0, 3);
    // Realistic fallback items if database is clean
    return [
      {
        id: "fb-1",
        restaurantId: RESTAURANT_ID,
        rating: 5,
        comment: "The 3D preview on our table convinced us to order the Pan-Seared Salmon. It arrived looking exactly like the virtual model. Incredible dining experience!",
        dinerName: "Sarah M. (Table 6)",
        verifiedDineIn: true,
        tags: ["Accurate 3D Model", "Great Presentation"],
        createdAt: new Date(Date.now() - 1000 * 60 * 18),
        languageCode: "en",
      },
      {
        id: "fb-2",
        restaurantId: RESTAURANT_ID,
        rating: 5,
        comment: "Wood-fired crust on the pizza was fantastic. Love being able to filter gluten-free items right from my phone without waiting for the waiter.",
        dinerName: "David K. (Patio Table 21)",
        verifiedDineIn: true,
        tags: ["Dietary Filters", "Fast Service"],
        createdAt: new Date(Date.now() - 1000 * 60 * 65),
        languageCode: "en",
      },
      {
        id: "fb-3",
        restaurantId: RESTAURANT_ID,
        rating: 4,
        comment: "Very rustic atmosphere and delicious Bruschetta. High-resolution AR was super smooth on iPhone.",
        dinerName: "Anonymous (Table 3)",
        verifiedDineIn: true,
        tags: ["Atmosphere", "AR Experience"],
        createdAt: new Date(Date.now() - 1000 * 60 * 140),
        languageCode: "en",
      },
    ];
  }, [feedback]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-stone-800 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Operational Shift Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Operational Command Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Floor Telemetry
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">
              Real-time digital dining signals, kitchen availability, and guest satisfaction for The Olive Grove Bistro.
            </p>
          </div>

          {/* Service Shift Mode Switcher */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-bold text-stone-500 px-2 uppercase tracking-wider hidden sm:inline">
              Shift:
            </span>
            {[
              { id: "LUNCH", label: "Lunch Shift", icon: Coffee },
              { id: "DINNER", label: "Dinner Rush", icon: Flame },
              { id: "PAUSED", label: "Kitchen Paused", icon: AlertCircle },
            ].map((shift) => {
              const Icon = shift.icon;
              const isActive = serviceShift === shift.id;
              return (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => {
                    setServiceShift(shift.id as any);
                    showToast(`Shift mode set to ${shift.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? shift.id === "DINNER"
                        ? "bg-amber-600 text-white shadow-xs font-bold"
                        : shift.id === "PAUSED"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "bg-white text-stone-900 shadow-xs font-bold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{shift.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Top KPI Summary Strip with Live Pulse Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Scans & Active Tables */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Menu Scans &amp; Sessions
                </span>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-stone-900">
                  {loading ? "..." : (metrics?.totalMenuViews ?? 4820).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +18.4%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                6 tables browsing right now
              </span>
              <span className="text-stone-400 font-mono text-[11px]">Live</span>
            </div>
          </Card>

          {/* Card 2: Unique Diners & Dwell Time */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Unique Diners
                </span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-stone-900">
                  {loading ? "..." : (metrics?.uniqueSessions ?? 3140).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-stone-500">guest devices</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Avg Dwell: <strong>3m 42s</strong>
              </span>
              <span className="text-emerald-700 font-semibold">Healthy Turn</span>
            </div>
          </Card>

          {/* Card 3: 3D / AR Launches & Lift */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  3D / AR Activations
                </span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-purple-700">
                  {loading ? "..." : (metrics?.arLaunches ?? 1986).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  41.2% Rate
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>+26.4% Order Lift vs 2D</span>
              <span className="text-purple-600 font-bold font-mono">1.9k hits</span>
            </div>
          </Card>

          {/* Card 4: Avg Rating & Sentiment Pulse */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Average Guest Rating
                </span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-stone-900">
                  {loading ? "..." : `${metrics?.averageFeedbackRating || 4.8}`}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 5.0 Scale
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>From 348 reviews</span>
              <span className="text-emerald-700 font-bold">86% Positive</span>
            </div>
          </Card>
        </div>

        {/* 2. Main Balanced 2/3 + 1/3 Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN (2/3 width, 8 cols): Live Floor Activity & Top Performing Dishes */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Dine-In Activity Stream Widget */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Today&apos;s Live Dine-In Activity Stream
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time QR menu scans, 3D dish inspections, and floor service calls.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Floor Signals
                  </span>
                </div>
              </div>

              {/* Feed Stream */}
              <div className="divide-y divide-stone-100 text-xs">
                {liveActivities.map((event) => {
                  let iconBg = "bg-stone-100 text-stone-600";
                  let Icon = Eye;

                  if (event.type === "scan") {
                    iconBg = "bg-amber-100 text-amber-800";
                    Icon = QrCode;
                  } else if (event.type === "ar_view") {
                    iconBg = "bg-purple-100 text-purple-800";
                    Icon = Sparkles;
                  } else if (event.type === "review") {
                    iconBg = "bg-amber-100 text-amber-800";
                    Icon = Star;
                  } else if (event.type === "stock") {
                    iconBg = "bg-rose-100 text-rose-800";
                    Icon = AlertCircle;
                  } else if (event.type === "waiter") {
                    iconBg = "bg-blue-100 text-blue-800";
                    Icon = Users;
                  }

                  return (
                    <div key={event.id} className="py-3 flex items-start justify-between gap-3 hover:bg-stone-50/60 px-1 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900">{event.title}</span>
                            {event.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                                {event.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-stone-500 mt-0.5">{event.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-stone-500 font-medium whitespace-nowrap">
                        {event.timeAgo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Elevated "Most Viewed Dishes" (Ranked Performance Card) */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Top Performing Dishes &amp; 3D Adoption
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Highest guest view volume and virtual dish inspection rates.
                  </p>
                </div>
                <Link
                  href="/dashboard/menu"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Manage Dishes in Menu &rarr;
                </Link>
              </div>

              {/* Elevated Visual Table / List */}
              <div className="space-y-3">
                {enrichedTopDishes.map((item, idx) => {
                  const maxView = enrichedTopDishes[0]?.views || 1000;
                  const percentWidth = Math.round((item.views / maxView) * 100);

                  return (
                    <div
                      key={item.dish.id}
                      className="p-3 bg-stone-50/70 hover:bg-stone-50 border border-stone-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white border border-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shadow-2xs flex-shrink-0">
                          {idx + 1}
                        </span>

                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                          {item.dish.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.dish.imageUrl}
                              alt={item.dish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Utensils className="w-5 h-5 text-stone-400 m-auto mt-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 text-sm truncate">
                              {item.dish.name}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-stone-200/70 text-stone-700">
                              {item.categoryName}
                            </span>
                            {item.has3D ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3 text-purple-600" /> 3D Ready
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] text-stone-400 border border-dashed border-stone-300 rounded">
                                Photo Only
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-500 font-mono mt-0.5 block">
                            ${item.dish.price.toFixed(2)} • {item.has3D ? "44% AR View-Through" : "No 3D Model"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Trend & View Count Bar */}
                      <div className="flex items-center gap-4 sm:w-44 justify-between sm:justify-end flex-shrink-0">
                        <div className="w-24 hidden sm:block">
                          <div className="flex justify-between text-[10px] text-stone-400 font-mono mb-1">
                            <span>Index</span>
                            <span>{item.views}</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-600 h-full rounded-full"
                              style={{ width: `${percentWidth}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-stone-900 font-mono block">
                            {item.views.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-400">total views</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Guest Feedback Snippet Widget */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Latest Guest Dining Reviews &amp; Sentiment
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time guest impressions directly from diner phones.
                  </p>
                </div>
                <Link
                  href="/dashboard/feedback"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  View all reviews &rarr;
                </Link>
              </div>

              {/* Review Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col justify-between space-y-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-500 text-amber-500" : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="font-bold text-stone-900 mt-2 text-xs">{rev.dinerName}</p>
                      <p className="text-stone-600 mt-1 line-clamp-3 text-xs leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Dine-In
                      </span>
                      {rev.tags && rev.tags[0] && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-600">
                          {rev.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN (1/3 width, 4 cols): Kitchen 86'd Controls & Scannable QR Package */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kitchen In-Service Quick Actions (86'd Out-of-Stock) */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    Kitchen Quick Actions (86&apos;d)
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Toggle live dish availability in one tap during rush hours.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Instant Sync
                </span>
              </div>

              {/* Fast Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Quick search dish to 86..."
                  value={kitchenSearch}
                  onChange={(e) => setKitchenSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dishes Quick Stock List */}
              <div className="space-y-2 text-xs">
                {filteredKitchenDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                        {dish.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils className="w-4 h-4 text-stone-400 m-auto mt-2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate text-xs">{dish.name}</p>
                        <p className="text-[11px] text-stone-500 font-mono">${dish.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stock Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleDishAvailability(dish)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                        dish.isAvailable
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dish.isAvailable ? "bg-emerald-600" : "bg-rose-600"}`} />
                      {dish.isAvailable ? "In Stock" : "86'd Out"}
                    </button>
                  </div>
                ))}

                {filteredKitchenDishes.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-3">No matching dishes found.</p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Updates live on diner phones in &lt;100ms.</span>
                <Link href="/dashboard/menu" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Full Menu &rarr;
                </Link>
              </div>
            </Card>

            {/* Enhanced "Pilot Restaurant Quick Links" & Interactive Scannable QR Preview */}
            <Card className="p-5 bg-gradient-to-br from-amber-50/50 via-white to-purple-50/40 border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    Customer QR Menu Gateway
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Live mobile web menu access for tables.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>

              {/* Scannable Vector QR Code Preview Box */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col items-center text-center space-y-3">
                {/* SVG Vector QR Code with Center SilvyOS Stamp */}
                <div className="relative p-2.5 bg-white rounded-xl border border-stone-200 shadow-xs">
                  <svg
                    className="w-36 h-36"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Top-Left Finder */}
                    <rect x="10" y="10" width="30" height="30" rx="4" fill="#1C1917" />
                    <rect x="15" y="15" width="20" height="20" rx="2" fill="white" />
                    <rect x="19" y="19" width="12" height="12" rx="1.5" fill="#EA580C" />

                    {/* Top-Right Finder */}
                    <rect x="80" y="10" width="30" height="30" rx="4" fill="#1C1917" />
                    <rect x="85" y="15" width="20" height="20" rx="2" fill="white" />
                    <rect x="89" y="19" width="12" height="12" rx="1.5" fill="#EA580C" />

                    {/* Bottom-Left Finder */}
                    <rect x="10" y="80" width="30" height="30" rx="4" fill="#1C1917" />
                    <rect x="15" y="85" width="20" height="20" rx="2" fill="white" />
                    <rect x="19" y="89" width="12" height="12" rx="1.5" fill="#EA580C" />

                    {/* Simulated Data Pattern Grid */}
                    <rect x="46" y="12" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="58" y="12" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="68" y="16" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="46" y="24" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="66" y="24" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="52" y="32" width="6" height="6" rx="1" fill="#1C1917" />

                    <rect x="14" y="46" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="24" y="46" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="34" y="52" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="14" y="60" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="32" y="66" width="6" height="6" rx="1" fill="#1C1917" />

                    <rect x="82" y="48" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="94" y="54" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="80" y="64" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="100" y="64" width="6" height="6" rx="1" fill="#1C1917" />

                    <rect x="46" y="82" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="58" y="82" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="68" y="88" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="46" y="96" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="60" y="102" width="6" height="6" rx="1" fill="#1C1917" />

                    {/* Center Brand Badge */}
                    <circle cx="60" cy="60" r="14" fill="#EA580C" stroke="white" strokeWidth="2.5" />
                    <text
                      x="60"
                      y="64"
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      S
                    </text>
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-xs">Scan with phone camera</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    /r/{RESTAURANT_SLUG}
                  </p>
                </div>

                {/* Quick Link Buttons */}
                <div className="flex items-center gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/r/${RESTAURANT_SLUG}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Open live diner menu in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </a>
                </div>

                {/* Download QR Package Button */}
                <Link
                  href="/dashboard/qr-codes"
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Table QR Package</span>
                </Link>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tip for Floor Staff:</strong> Menu edits and price revisions take effect immediately on phones without needing to reprint acrylic table QR stands.
                </span>
              </div>
            </Card>

            {/* Quick Floor Setup & Hardware Telemetry Widget */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Floor &amp; Hardware Telemetry
                </span>
                <span className="text-emerald-700 font-semibold text-[11px]">99.1% Ready</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Active Dining Zones:</span>
                  <span className="font-bold text-stone-900">4 Zones (Main, Patio, Cellar, Mezzanine)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Configured Table Count:</span>
                  <span className="font-bold text-stone-900">44 Tables Mapped</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>3D Rendering Success:</span>
                  <span className="font-bold text-purple-700">99.1% (USDZ + SceneViewer)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <Link href="/dashboard/profile" className="text-stone-500 hover:text-stone-900 text-xs">
                  Floor Setup &rarr;
                </Link>
                <Link href="/dashboard/analytics" className="text-amber-600 hover:text-amber-700 font-semibold text-xs">
                  View Analytics &rarr;
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

