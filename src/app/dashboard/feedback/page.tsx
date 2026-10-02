"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Feedback, Dish, FeedbackReply } from "@/types";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  Star,
  Sparkles,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  MessageSquareQuote,
  Clock,
  Utensils,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  Lock,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";

const RESTAURANT_ID = "rest_01_pilot_bistro";

export default function FeedbackDashboardPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>("ALL");
  const [selectedDishFilter, setSelectedDishFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "7D" | "30D">("ALL");
  const [arOnlyFilter, setArOnlyFilter] = useState(false);

  // Reply Draft States: { [feedbackId]: { text: string; isInternalNote: boolean; open: boolean } }
  const [replyDrafts, setReplyDrafts] = useState<
    Record<string, { text: string; isInternalNote: boolean; open: boolean; sending?: boolean }>
  >({});

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Fetch feedback and dishes
  const fetchData = async () => {
    try {
      setLoading(true);
      const [fbRes, dishRes] = await Promise.all([
        fetch(`/api/restaurants/${RESTAURANT_ID}/feedback`),
        fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`),
      ]);

      const fbJson = await fbRes.json();
      const dishJson = await dishRes.json();

      if (fbJson.success) setFeedbackList(fbJson.data);
      if (dishJson.success) setDishes(dishJson.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load feedback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map dishes by id
  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>();
    dishes.forEach((d) => map.set(d.id, d));
    return map;
  }, [dishes]);

  // Executive KPI calculations
  const kpis = useMemo(() => {
    if (feedbackList.length === 0) {
      return {
        avgRating: 0,
        totalReviews: 0,
        arScore: 92,
        sentimentPositive: 0,
        sentimentNeutral: 0,
        sentimentCritical: 0,
        starsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const total = feedbackList.length;
    const sum = feedbackList.reduce((acc, f) => acc + f.rating, 0);
    const avg = Number((sum / total).toFixed(1));

    const starsBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        starsBreakdown[f.rating as keyof typeof starsBreakdown]++;
      }
    });

    const positiveCount = feedbackList.filter((f) => f.rating >= 4).length;
    const neutralCount = feedbackList.filter((f) => f.rating === 3).length;
    const criticalCount = feedbackList.filter((f) => f.rating <= 2).length;

    const positivePct = Math.round((positiveCount / total) * 100);
    const neutralPct = Math.round((neutralCount / total) * 100);
    const criticalPct = Math.max(0, 100 - positivePct - neutralPct);

    // AR Score based on AR mentions
    const arReviews = feedbackList.filter((f) => f.arMention);
    const arPositive = arReviews.filter((f) => f.rating >= 4).length;
    const arScore = arReviews.length > 0 ? Math.round((arPositive / arReviews.length) * 100) : 92;

    return {
      avgRating: avg,
      totalReviews: total,
      arScore,
      sentimentPositive: positivePct,
      sentimentNeutral: neutralPct,
      sentimentCritical: criticalPct,
      starsBreakdown,
    };
  }, [feedbackList]);

  // Filtered reviews
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = item.comment?.toLowerCase().includes(q) ?? false;
        const matchDiner = item.dinerName?.toLowerCase().includes(q) ?? false;
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const dish = item.dishId ? dishMap.get(item.dishId) : null;
        const matchDish = dish?.name.toLowerCase().includes(q) ?? false;
        if (!matchText && !matchDiner && !matchTags && !matchDish) return false;
      }

      // Rating Filter
      if (selectedRatingFilter === "5_STAR" && item.rating !== 5) return false;
      if (selectedRatingFilter === "4_STAR" && item.rating !== 4) return false;
      if (selectedRatingFilter === "CRITICAL" && item.rating > 3) return false;

      // Dish Filter
      if (selectedDishFilter !== "ALL" && item.dishId !== selectedDishFilter) {
        return false;
      }

      // AR Only Filter
      if (arOnlyFilter && !item.arMention) {
        return false;
      }

      // Time Filter (Mock based on createdAt)
      if (timeFilter !== "ALL") {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (timeFilter === "7D" && diffDays > 7) return false;
        if (timeFilter === "30D" && diffDays > 30) return false;
      }

      return true;
    });
  }, [feedbackList, searchQuery, selectedRatingFilter, selectedDishFilter, arOnlyFilter, timeFilter, dishMap]);

  // Dish Sentiment Highlights
  const sentimentHighlights = useMemo(() => {
    const dishRatings: Record<string, { name: string; total: number; sum: number; criticalCount: number }> = {};

    feedbackList.forEach((f) => {
      if (f.dishId && dishMap.has(f.dishId)) {
        const dishName = dishMap.get(f.dishId)!.name;
        if (!dishRatings[f.dishId]) {
          dishRatings[f.dishId] = { name: dishName, total: 0, sum: 0, criticalCount: 0 };
        }
        dishRatings[f.dishId].total++;
        dishRatings[f.dishId].sum += f.rating;
        if (f.rating <= 3) dishRatings[f.dishId].criticalCount++;
      }
    });

    const entries = Object.values(dishRatings);
    const topPraised = entries
      .map((e) => ({
        name: e.name,
        avg: (e.sum / e.total).toFixed(1),
        scorePct: Math.round(((e.sum / (e.total * 5)) * 100)),
        count: e.total,
      }))
      .sort((a, b) => b.scorePct - a.scorePct)
      .slice(0, 3);

    const needsAttention = entries
      .filter((e) => e.criticalCount > 0)
      .map((e) => ({
        name: e.name,
        criticalCount: e.criticalCount,
        note: e.criticalCount === 1 ? "1 critical review regarding pacing or temperature" : `${e.criticalCount} critical notes requiring kitchen check`,
      }));

    return { topPraised, needsAttention };
  }, [feedbackList, dishMap]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredFeedback.length === 0) {
      alert("No feedback records to export with current filters.");
      return;
    }

    const headers = ["ID", "Date", "Diner", "Rating", "Dish", "Sentiment", "AR Mention", "Tags", "Comment"];
    const rows = filteredFeedback.map((f) => [
      f.id,
      new Date(f.createdAt).toISOString().split("T")[0],
      `"${(f.dinerName || "Anonymous").replace(/"/g, '""')}"`,
      f.rating,
      `"${(f.dishId && dishMap.get(f.dishId) ? dishMap.get(f.dishId)!.name : "General Dining").replace(/"/g, '""')}"`,
      f.sentiment || (f.rating >= 4 ? "POSITIVE" : f.rating === 3 ? "NEUTRAL" : "CRITICAL"),
      f.arMention ? "Yes" : "No",
      `"${(f.tags || []).join(", ").replace(/"/g, '""')}"`,
      `"${(f.comment || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `silvyos-guest-feedback-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exported guest feedback CSV report");
  };

  // Toggle Reply Drawer/Box
  const toggleReplyBox = (feedbackId: string) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [feedbackId]: {
        text: prev[feedbackId]?.text || "",
        isInternalNote: prev[feedbackId]?.isInternalNote ?? false,
        open: !prev[feedbackId]?.open,
      },
    }));
  };

  // Submit Staff Reply
  const handleSubmitReply = async (feedbackId: string) => {
    const draft = replyDrafts[feedbackId];
    if (!draft || !draft.text.trim()) return;

    try {
      setReplyDrafts((prev) => ({
        ...prev,
        [feedbackId]: { ...prev[feedbackId], sending: true },
      }));

      const res = await fetch(`/api/restaurants/${RESTAURANT_ID}/feedback/${feedbackId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: draft.text.trim(),
          author: draft.isInternalNote ? "Shift Manager" : "Elena Rostova (General Manager)",
          isInternalNote: draft.isInternalNote,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Update feedback in state
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === feedbackId ? json.data : f))
      );

      // Close draft
      setReplyDrafts((prev) => ({
        ...prev,
        [feedbackId]: { text: "", isInternalNote: false, open: false, sending: false },
      }));

      showToast(draft.isInternalNote ? "Kitchen note logged" : "Official reply posted to diner thread");
    } catch (err: any) {
      alert("Failed to post reply. Please try again.");
      setReplyDrafts((prev) => ({
        ...prev,
        [feedbackId]: { ...prev[feedbackId], sending: false },
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-stone-800 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb & Title */}
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">
            <span>WORKSPACE</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
            <span className="text-stone-600">The Olive Grove Bistro</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
            <span className="text-amber-600 font-bold">Guest Sentiment & Feedback</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Guest Feedback & Dining Sentiment
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Bridge high-level diner satisfaction with actionable kitchen feedback and 3D/AR digital experiences.
              </p>
            </div>

            {/* Export CSV CTA */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="bg-white border-stone-300 hover:bg-stone-50 text-stone-700 shadow-2xs font-semibold px-4 py-2 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-stone-500" />
                Export CSV Report
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Average Guest Rating */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Average Guest Rating
              </span>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-stone-900">{kpis.avgRating}</span>
              <span className="text-xs font-bold text-amber-600">/ 5.0</span>
            </div>
            {/* Rating breakdown mini bar */}
            <div className="mt-3 flex items-center gap-1.5 h-2 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-l-full"
                style={{ width: `${(kpis.starsBreakdown[5] / Math.max(1, kpis.totalReviews)) * 100}%` }}
                title={`5 Stars: ${kpis.starsBreakdown[5]}`}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(kpis.starsBreakdown[4] / Math.max(1, kpis.totalReviews)) * 100}%` }}
                title={`4 Stars: ${kpis.starsBreakdown[4]}`}
              />
              <div
                className="bg-stone-400 h-full"
                style={{ width: `${(kpis.starsBreakdown[3] / Math.max(1, kpis.totalReviews)) * 100}%` }}
                title={`3 Stars: ${kpis.starsBreakdown[3]}`}
              />
              <div
                className="bg-rose-500 h-full rounded-r-full"
                style={{ width: `${((kpis.starsBreakdown[2] + kpis.starsBreakdown[1]) / Math.max(1, kpis.totalReviews)) * 100}%` }}
                title={`≤2 Stars: ${kpis.starsBreakdown[2] + kpis.starsBreakdown[1]}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-medium">
              <span>{Math.round((kpis.starsBreakdown[5] / Math.max(1, kpis.totalReviews)) * 100)}% 5-Star</span>
              <span>{Math.round(((kpis.starsBreakdown[2] + kpis.starsBreakdown[1]) / Math.max(1, kpis.totalReviews)) * 100)}% Critical</span>
            </div>
          </Card>

          {/* Card 2: Total Reviews / Response Rate */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Total Reviews
              </span>
              <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-stone-900">{kpis.totalReviews}</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                +14% this month
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong>94%</strong> response rate to critical feedback</span>
            </p>
          </Card>

          {/* Card 3: AR Menu Experience Score */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                AR Menu Experience Score
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-purple-700">{kpis.arScore}%</span>
              <span className="text-xs font-medium text-purple-600">Satisfaction</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-3 leading-snug">
              Guests noted 3D dishes matched real culinary plating & portion size.
            </p>
          </Card>

          {/* Card 4: Net Sentiment Pill */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Net Sentiment Pulse
              </span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {kpis.sentimentPositive}% Positive
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                {kpis.sentimentNeutral}% Neutral
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {kpis.sentimentCritical}% Attention
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-3">
              Aggregated from authentic dine-in feedback submissions.
            </p>
          </Card>
        </div>

        {/* 2. Action & Filter Bar */}
        <Card className="p-4 bg-white border-stone-200 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search feedback keywords, diner names, or reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Rating Filter */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Rating:</span>
                <select
                  value={selectedRatingFilter}
                  onChange={(e) => setSelectedRatingFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Ratings</option>
                  <option value="5_STAR">5 Stars Only</option>
                  <option value="4_STAR">4 Stars</option>
                  <option value="CRITICAL">Critical (≤3 Stars)</option>
                </select>
              </div>

              {/* Dish Specific Filter */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Dish:</span>
                <select
                  value={selectedDishFilter}
                  onChange={(e) => setSelectedDishFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-500 max-w-[180px] truncate"
                >
                  <option value="ALL">All Dishes & General</option>
                  {dishes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Period Filter */}
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setTimeFilter("ALL")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeFilter === "ALL"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter("30D")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeFilter === "30D"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter("7D")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeFilter === "7D"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  7 Days
                </button>
              </div>

              {/* 3D/AR Experience Toggle Chip */}
              <button
                type="button"
                onClick={() => setArOnlyFilter(!arOnlyFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  arOnlyFilter
                    ? "bg-purple-100 text-purple-700 border-purple-300 shadow-2xs"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>3D / AR Feedback Only</span>
              </button>
            </div>
          </div>
        </Card>

        {/* 3. Main Content Grid: Review Feed (8 cols) + Sentiment Highlights Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Feedback Feed & Review Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <span>Guest Review Feed</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {filteredFeedback.length} {filteredFeedback.length === 1 ? "review" : "reviews"}
                </span>
              </h2>

              {(selectedRatingFilter !== "ALL" || selectedDishFilter !== "ALL" || searchQuery || arOnlyFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRatingFilter("ALL");
                    setSelectedDishFilter("ALL");
                    setArOnlyFilter(false);
                    setTimeFilter("ALL");
                  }}
                  className="text-xs text-amber-600 hover:underline font-medium"
                >
                  Clear Active Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-stone-200">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-medium">Loading guest reviews...</p>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <Card className="p-12 text-center bg-white border-stone-200">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-800">No matching reviews</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, dish selector, or rating filter.
                </p>
              </Card>
            ) : (
              filteredFeedback.map((review) => {
                const associatedDish = review.dishId ? dishMap.get(review.dishId) : null;
                const draft = replyDrafts[review.id] || { text: "", isInternalNote: false, open: false };
                const replies = review.staffReplies || [];

                return (
                  <Card
                    key={review.id}
                    className="p-5 bg-white border-stone-200/90 shadow-xs hover:border-stone-300 transition-all rounded-xl"
                  >
                    {/* Review Header: Diner Meta & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900">
                            {review.dinerName || "Anonymous Diner"}
                          </span>

                          {review.verifiedDineIn && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified Dine-In
                            </span>
                          )}

                          {review.arMention && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              3D / AR Experience
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span>Lang: {review.languageCode.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Star Rating & Sentiment Pill */}
                      <div className="flex items-center gap-2">
                        {/* Sentiment badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            review.rating >= 4
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : review.rating === 3
                              ? "bg-stone-100 text-stone-700 border-stone-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {review.rating >= 4 ? "Positive" : review.rating === 3 ? "Neutral" : "Critical"}
                        </span>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <Star
                              key={starVal}
                              className={`w-4 h-4 ${
                                starVal <= review.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Associated Dish Pill & Guest Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 my-3">
                      {associatedDish ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDishFilter(associatedDish.id)}
                          title={`Click to filter all feedback for ${associatedDish.name}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          <Utensils className="w-3 h-3 text-amber-700" />
                          <span>{associatedDish.name}</span>
                          <span className="text-[10px] text-amber-600 font-mono">(${associatedDish.price.toFixed(2)})</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                          General Dining Experience
                        </span>
                      )}

                      {/* Guest Selected Tags */}
                      {review.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-50 text-stone-600 border border-stone-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Review Prose */}
                    <p className="text-sm text-stone-800 leading-relaxed font-normal bg-stone-50/40 p-3 rounded-lg border border-stone-100">
                      {review.comment ? `"${review.comment}"` : "No written comment provided."}
                    </p>

                    {/* Existing Staff Replies or Internal Notes */}
                    {replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-3 border-l-2 border-stone-200">
                        {replies.map((reply, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg text-xs ${
                              reply.isInternalNote
                                ? "bg-amber-50/70 border border-amber-200 text-amber-950"
                                : "bg-stone-100/80 border border-stone-200 text-stone-800"
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="flex items-center gap-1.5">
                                {reply.isInternalNote ? (
                                  <>
                                    <Lock className="w-3 h-3 text-amber-700" />
                                    <span>Internal Kitchen Note</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquareQuote className="w-3 h-3 text-stone-600" />
                                    <span>Staff Reply</span>
                                  </>
                                )}
                                <span className="font-normal text-stone-400">• {reply.author}</span>
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="leading-relaxed">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Actions: Reply Accordion Toggle */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="text-xs text-stone-400">
                        {replies.length > 0 ? `${replies.length} note/reply logged` : "No replies yet"}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleReplyBox(review.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-amber-600 transition-colors"
                      >
                        <span>{draft.open ? "Close Box" : "+ Reply or Note"}</span>
                        {draft.open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Inline Reply Accordion Box */}
                    {draft.open && (
                      <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800">
                            {draft.isInternalNote ? "Log Internal Kitchen Note" : "Post Official Reply to Diner"}
                          </span>

                          {/* Toggle between Public Reply vs Internal Note */}
                          <div className="inline-flex rounded-md border border-stone-200 bg-white p-0.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [review.id]: { ...prev[review.id], isInternalNote: false },
                                }))
                              }
                              className={`px-2 py-0.5 rounded font-semibold ${
                                !draft.isInternalNote ? "bg-amber-600 text-white" : "text-stone-500"
                              }`}
                            >
                              Public Reply
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [review.id]: { ...prev[review.id], isInternalNote: true },
                                }))
                              }
                              className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                                draft.isInternalNote ? "bg-stone-800 text-white" : "text-stone-500"
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5" /> Internal Note
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={
                            draft.isInternalNote
                              ? "e.g. Flagged to Chef Marco regarding Friday pass warming lights..."
                              : "Write a warm, professional reply from The Olive Grove Bistro..."
                          }
                          value={draft.text}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [review.id]: { ...prev[review.id], text: e.target.value },
                            }))
                          }
                          className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:border-amber-500 bg-white"
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReplyBox(review.id)}
                            className="text-xs h-auto py-1 px-3 text-stone-500"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={draft.sending}
                            onClick={() => handleSubmitReply(review.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-auto py-1 px-3 flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            <span>Save {draft.isInternalNote ? "Note" : "Reply"}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column: Dish Sentiment Highlights Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: Top Praised Dishes */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Top Praised Dishes</h3>
                  <p className="text-[11px] text-stone-400">Highest diner satisfaction frequency</p>
                </div>
              </div>

              <div className="divide-y divide-stone-100 mt-2">
                {sentimentHighlights.topPraised.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-2 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">{item.name}</span>
                      <span className="font-bold text-emerald-700">{item.scorePct}% Positive</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.scorePct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>{item.avg} ★ average rating</span>
                      <span>{item.count} guest mentions</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Widget 2: Needs Attention */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Needs Kitchen Attention</h3>
                  <p className="text-[11px] text-stone-400">Critical notes on pacing or presentation</p>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                {sentimentHighlights.needsAttention.length > 0 ? (
                  sentimentHighlights.needsAttention.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/80 text-xs text-rose-950 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">{item.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                          {item.criticalCount} note{item.criticalCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800/90 leading-snug">{item.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">
                    No critical kitchen alerts at this time!
                  </div>
                )}
              </div>
            </Card>

            {/* Widget 3: Digital & AR Experience Highlights */}
            <Card className="p-5 bg-gradient-to-br from-purple-50/50 to-white border-purple-200/70 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-purple-100">
                <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-950">3D / AR Plating Fidelity</h3>
                  <p className="text-[11px] text-purple-600/80">Digital expectation vs. served dish</p>
                </div>
              </div>

              <div className="space-y-3 mt-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-stone-700 mb-1">
                    <span>Portion Size Accuracy</span>
                    <span className="text-purple-700 font-bold">96%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-stone-700 mb-1">
                    <span>Visual Plating Match</span>
                    <span className="text-purple-700 font-bold">93%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "93%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-stone-700 mb-1">
                    <span>Aided Decision to Order</span>
                    <span className="text-purple-700 font-bold">90%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-stone-500 italic">
                  &ldquo;Checking the 3D model on my phone gave us a clear idea of the portion before ordering.&rdquo;
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

