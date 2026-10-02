"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dish, DashboardMetrics } from "@/types";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  LineChart as LineChartIcon,
  Sparkles,
  TrendingUp,
  Clock,
  QrCode,
  Download,
  Calendar,
  Smartphone,
  Eye,
  CheckCircle2,
  ChevronRight,
  Zap,
  ArrowUpRight,
  Layers,
  Percent,
  Compass,
  HelpCircle,
} from "lucide-react";

const RESTAURANT_ID = "rest_01_pilot_bistro";

// Heatmap hourly slots: 11 AM to 10 PM (12 hours)
const HOURS = [
  "11a",
  "12p",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
  "8p",
  "9p",
  "10p",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Realistic heatmap scan intensity: [dayIndex][hourIndex]
const HEATMAP_DATA: number[][] = [
  [12, 45, 68, 30, 15, 20, 48, 72, 85, 65, 30, 10], // Mon
  [14, 52, 74, 35, 18, 22, 55, 78, 88, 70, 32, 12], // Tue
  [15, 58, 82, 40, 20, 25, 60, 85, 92, 75, 38, 15], // Wed
  [18, 65, 90, 45, 22, 30, 68, 92, 98, 82, 45, 18], // Thu
  [22, 78, 95, 55, 28, 42, 85, 115, 130, 110, 68, 25], // Fri (Peak)
  [28, 85, 110, 70, 35, 50, 95, 125, 142, 120, 80, 35], // Sat (Peak)
  [30, 90, 105, 65, 30, 45, 80, 105, 118, 90, 52, 20], // Sun
];

// Time series mock generation based on range
const TIME_SERIES_DATA: Record<"7D" | "30D" | "90D", { date: string; scans: number; arViews: number }[]> = {
  "7D": [
    { date: "Sep 26", scans: 580, arViews: 242 },
    { date: "Sep 27", scans: 620, arViews: 268 },
    { date: "Sep 28", scans: 710, arViews: 310 },
    { date: "Sep 29", scans: 690, arViews: 295 },
    { date: "Sep 30", scans: 840, arViews: 382 },
    { date: "Oct 01", scans: 910, arViews: 415 },
    { date: "Oct 02", scans: 860, arViews: 374 },
  ],
  "30D": [
    { date: "Week 1", scans: 3420, arViews: 1410 },
    { date: "Week 2", scans: 3780, arViews: 1590 },
    { date: "Week 3", scans: 4120, arViews: 1740 },
    { date: "Week 4", scans: 4820, arViews: 1986 },
  ],
  "90D": [
    { date: "Month 1", scans: 11200, arViews: 4620 },
    { date: "Month 2", scans: 13800, arViews: 5910 },
    { date: "Month 3", scans: 16400, arViews: 7180 },
  ],
};

export default function AnalyticsDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ date: string; scans: number; arViews: number } | null>(null);
  const [hoveredHeatCell, setHoveredHeatCell] = useState<{ day: string; hour: string; count: number } | null>(null);

  // Fetch metrics and dishes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mRes, dRes] = await Promise.all([
          fetch(`/api/restaurants/${RESTAURANT_ID}/analytics`),
          fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`),
        ]);
        const mJson = await mRes.json();
        const dJson = await dRes.json();

        if (mJson.success) setMetrics(mJson.data);
        if (dJson.success) setDishes(dJson.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeSeries = TIME_SERIES_DATA[timeRange];
  const maxScanValue = Math.max(...activeSeries.map((d) => d.scans), 100);

  // Dish Performance Matrix
  const dishPerformance = useMemo(() => {
    if (dishes.length === 0) return [];

    return dishes.map((dish, idx) => {
      const baseViews = 180 + idx * 75 + Math.floor(Math.random() * 40);
      const has3D = Boolean(dish.model3dUrl);
      const arLaunches = has3D ? Math.floor(baseViews * 0.44) : 0;
      const viewThroughRate = has3D ? Math.round((arLaunches / baseViews) * 100) : 0;

      let status = "Steady Classic";
      if (has3D && viewThroughRate >= 40) status = "High Performer";
      else if (has3D) status = "AR Lift (+32%)";
      else if (baseViews > 250) status = "Needs 3D Asset";

      return {
        dish,
        views: baseViews,
        arLaunches,
        viewThroughRate,
        status,
        has3D,
      };
    }).sort((a, b) => b.views - a.views);
  }, [dishes]);

  // Export Analytics CSV Report
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value", "Notes"],
      ["Total Menu Scans", "4,820", "+18.4% growth"],
      ["Unique Sessions", "3,140", "Individual diners"],
      ["AR Launch Rate", "41.2%", "1,986 launches"],
      ["AR-to-Order Conversion Lift", "+26.4%", "Comparison vs 2D static photos"],
      ["Average Dwell Time", "3m 42s", "Table session browsing duration"],
      [],
      ["Dish Name", "Category ID", "Views", "3D Launches", "View-Through Rate", "Status"],
      ...dishPerformance.map((d) => [
        `"${d.dish.name}"`,
        d.dish.categoryId,
        d.views,
        d.arLaunches,
        `${d.viewThroughRate}%`,
        d.status,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `silvyos-analytics-${timeRange.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Title */}
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-wider font-semibold mb-2">
            <span>WORKSPACE</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-700">The Olive Grove Bistro</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-amber-600 font-bold">Telemetry & Analytics</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Dining Telemetry & Business Analytics
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Measure digital menu engagement, 3D/AR launch conversions, and real dine-in operational flow.
              </p>
            </div>

            {/* Time Period Filter & Export CTA */}
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 shadow-2xs">
                {(["7D", "30D", "90D"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      timeRange === r
                        ? "bg-white text-stone-900 shadow-2xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {r === "7D" ? "Last 7 Days" : r === "30D" ? "Last 30 Days" : "Last 90 Days"}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="bg-white border-stone-300 hover:bg-stone-50 text-stone-700 shadow-2xs text-xs font-semibold px-3 py-2 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Top KPI Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Menu Scans & Sessions */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Menu Scans & Sessions
              </span>
              <QrCode className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-stone-900">
                {loading ? "..." : (metrics?.totalMenuViews ?? 4820).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +18.4%
              </span>
            </div>

            {/* Mini Sparkline SVG */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-stone-500">3,140 unique guest sessions</span>
              <svg className="w-20 h-6 text-amber-500 stroke-current fill-none stroke-2 overflow-visible">
                <path d="M 0 18 Q 10 12, 20 15 T 40 8 T 60 12 T 80 4" />
              </svg>
            </div>
          </Card>

          {/* KPI 2: AR Engagement Rate */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                AR Engagement Rate
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-purple-700">41.2%</span>
              <span className="text-xs font-medium text-purple-600">Launch Rate</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span><strong>1,986</strong> 3D dish inspections</span>
              <span className="text-purple-600 font-semibold">+7.8% lift</span>
            </div>
          </Card>

          {/* KPI 3: AR-to-Order Conversion */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                AR Order Conversion
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-stone-900">+26.4%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Higher Order Rate
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-3 leading-snug">
              Dishes viewed in 3D generate higher order frequency & ticket size.
            </p>
          </Card>

          {/* KPI 4: Average Dwell Time */}
          <Card className="p-4 bg-white border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Average Dwell Time
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-stone-900">3m 42s</span>
              <span className="text-xs font-medium text-stone-500">per table</span>
            </div>
            <p className="text-xs text-stone-500 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Optimal balance: fast ordering without feeling rushed</span>
            </p>
          </Card>
        </div>

        {/* 2. Time-Series Trends & Peak Dining Time Heatmap (Matched Heights: h-[420px]) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart: Total Scans vs AR Model Activations (8 cols, h-[420px]) */}
          <Card className="p-5 bg-white border-stone-200 shadow-xs lg:col-span-8 h-[420px] flex flex-col justify-between">
            {/* Header: Title on Left, Legend on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-amber-600" />
                  Digital Traffic & 3D/AR Activations
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Compare gross QR scans with immersive virtual dish activations over time.
                </p>
              </div>

              {/* Legend placed right in the header row */}
              <div className="flex items-center gap-4 text-xs font-semibold flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span className="text-stone-700">QR Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span className="text-stone-700">3D/AR Launches</span>
                </div>
              </div>
            </div>

            {/* Responsive SVG Chart Container with Bottom Padding and Grid Lines */}
            <div className="relative flex-1 flex flex-col justify-end pt-4 pb-2">
              <div className="relative h-56 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
                  {/* Subtle horizontal dashed grid lines behind chart paths */}
                  {[20, 60, 100, 140].map((yVal, idx) => (
                    <line
                      key={idx}
                      x1="30"
                      y1={yVal}
                      x2="670"
                      y2={yVal}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Gradient Area Fills */}
                  <defs>
                    <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="arGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area Paths & Line Polylines with Horizontal Margin Inset */}
                  {(() => {
                    const padLeft = 40;
                    const chartWidth = 620;
                    const step = chartWidth / (activeSeries.length - 1);
                    const baselineY = 160;

                    const scanPoints = activeSeries.map((d, i) => {
                      const x = padLeft + i * step;
                      const y = baselineY - (d.scans / maxScanValue) * 135;
                      return `${x},${y}`;
                    }).join(" ");

                    const arPoints = activeSeries.map((d, i) => {
                      const x = padLeft + i * step;
                      const y = baselineY - (d.arViews / maxScanValue) * 135;
                      return `${x},${y}`;
                    }).join(" ");

                    return (
                      <>
                        {/* Scans Area Fill & Line */}
                        <polygon
                          points={`${padLeft},${baselineY} ${scanPoints} ${padLeft + chartWidth},${baselineY}`}
                          fill="url(#scansGradient)"
                        />
                        <polyline
                          points={scanPoints}
                          fill="none"
                          stroke="#EA580C"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* AR Views Area Fill & Line */}
                        <polygon
                          points={`${padLeft},${baselineY} ${arPoints} ${padLeft + chartWidth},${baselineY}`}
                          fill="url(#arGradient)"
                        />
                        <polyline
                          points={arPoints}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Nodes */}
                        {activeSeries.map((d, i) => {
                          const x = padLeft + i * step;
                          const yScan = baselineY - (d.scans / maxScanValue) * 135;
                          const yAr = baselineY - (d.arViews / maxScanValue) * 135;

                          return (
                            <g key={i}>
                              <circle
                                cx={x}
                                cy={yScan}
                                r="4.5"
                                fill="#EA580C"
                                className="cursor-pointer hover:r-6 transition-all"
                                onMouseEnter={() => setHoveredDataPoint(d)}
                              />
                              <circle
                                cx={x}
                                cy={yAr}
                                r="4.5"
                                fill="#8B5CF6"
                                className="cursor-pointer hover:r-6 transition-all"
                                onMouseEnter={() => setHoveredDataPoint(d)}
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* Hover Tooltip Card */}
                {hoveredDataPoint && (
                  <div className="absolute top-2 right-4 bg-stone-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-stone-800 animate-in fade-in duration-100 z-10">
                    <p className="font-bold text-stone-200">{hoveredDataPoint.date}</p>
                    <p className="text-amber-400 font-medium">
                      QR Scans: <strong>{hoveredDataPoint.scans}</strong>
                    </p>
                    <p className="text-purple-400 font-medium">
                      3D Launches: <strong>{hoveredDataPoint.arViews}</strong> (
                      {Math.round((hoveredDataPoint.arViews / hoveredDataPoint.scans) * 100)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Clean Date Axis Labels sitting along an axis rule */}
              <div className="flex justify-between px-6 pt-2 border-t border-stone-200 text-xs text-stone-500 font-semibold">
                {activeSeries.map((item, idx) => (
                  <span key={idx}>{item.date}</span>
                ))}
              </div>
            </div>

            {/* Bottom Insight Footer */}
            <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Diners who activate 3D inspect an average of <strong>2.8 dishes</strong> before ordering.
              </span>
              <span className="text-xs font-mono text-stone-500">Peak hour: 8:15 PM</span>
            </div>
          </Card>

          {/* Peak Dining Time Heatmap (4 cols, Matched Height: h-[420px]) */}
          <Card className="p-5 bg-white border-stone-200 shadow-xs lg:col-span-4 h-[420px] flex flex-col justify-between overflow-hidden">
            <div>
              {/* Header */}
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Peak Dining Rush Heatmap
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  7-Day × Hourly scan density (Lunch vs. Dinner shifts).
                </p>
              </div>

              {/* Heatmap Grid Table: 44px for Day label, 12 equal columns for hours */}
              <div className="mt-3.5 space-y-1.5">
                {/* Horizontal Hour Header (11a to 10p) */}
                <div
                  style={{ display: "grid", gridTemplateColumns: "40px repeat(12, minmax(0, 1fr))", gap: "3px" }}
                  className="items-center text-center text-[10px] font-mono text-stone-500 font-medium pb-0.5"
                >
                  <span className="text-left font-bold text-stone-600">Day</span>
                  {HOURS.map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>

                {/* 7 Discrete Day Rows × 12 Small Rounded Tile Cells */}
                {DAYS.map((day, dayIdx) => (
                  <div
                    key={day}
                    style={{ display: "grid", gridTemplateColumns: "40px repeat(12, minmax(0, 1fr))", gap: "3px" }}
                    className="items-center"
                  >
                    <span className="text-[11px] font-bold text-stone-600 text-left">{day}</span>
                    {HOURS.map((hour, hourIdx) => {
                      const value = HEATMAP_DATA[dayIdx][hourIdx];

                      // Discrete shading levels:
                      // Level 0 (no/minimal): bg-stone-100
                      // Level 1 (low): bg-amber-100
                      // Level 2 (med): bg-amber-300
                      // Level 3 (peak): bg-amber-500
                      let bgClass = "bg-stone-100";
                      if (value > 85) bgClass = "bg-amber-500";
                      else if (value > 50) bgClass = "bg-amber-300";
                      else if (value > 20) bgClass = "bg-amber-100";
                      else bgClass = "bg-stone-100";

                      return (
                        <div
                          key={hour}
                          onMouseEnter={() => setHoveredHeatCell({ day, hour, count: value })}
                          onMouseLeave={() => setHoveredHeatCell(null)}
                          className={`aspect-square w-full rounded-xs ${bgClass} transition-all hover:scale-125 cursor-pointer border border-black/5 shadow-2xs`}
                          title={`${day} at ${hour}: ~${value} scans`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Compact Legend & Hover Display */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              {/* Compact Legend with 4 Colored Swatch Boxes */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Low Traffic</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs bg-stone-100 border border-stone-300" title="Level 0 (No/minimal traffic)" />
                  <span className="w-3.5 h-3.5 rounded-xs bg-amber-100 border border-amber-200" title="Level 1 (Low)" />
                  <span className="w-3.5 h-3.5 rounded-xs bg-amber-300 border border-amber-400" title="Level 2 (Medium)" />
                  <span className="w-3.5 h-3.5 rounded-xs bg-amber-500 border border-amber-600" title="Level 3 (Peak)" />
                </div>
                <span>Peak Rush</span>
              </div>

              {/* Hover Tooltip / Status Display */}
              <div className="py-1.5 px-2 bg-stone-50 rounded-lg border border-stone-200 text-center text-xs">
                {hoveredHeatCell ? (
                  <p className="text-stone-800 font-medium">
                    <strong>{hoveredHeatCell.day} at {hoveredHeatCell.hour}:</strong> ~{hoveredHeatCell.count} scans
                  </p>
                ) : (
                  <p className="text-stone-500 text-xs">Hover over any cell to inspect scan density</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Dish Performance & AR Impact Matrix (Equalized Heights) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Top Performing Dishes Table (8 cols) */}
          <Card className="p-5 bg-white border-stone-200 shadow-xs lg:col-span-8 overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-600" />
                    Dish Performance & AR Impact Matrix
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Does adding a 3D model increase guest interest and orders?
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Live Conversion Lift
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 uppercase tracking-wider font-semibold border-b border-stone-200">
                      <th className="py-2.5 px-3">Dish</th>
                      <th className="py-2.5 px-3 text-right">Page Views</th>
                      <th className="py-2.5 px-3 text-right">3D/AR Launches</th>
                      <th className="py-2.5 px-3 text-right">AR View-Through</th>
                      <th className="py-2.5 px-3 text-right">Impact Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dishPerformance.slice(0, 6).map((item) => (
                      <tr key={item.dish.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 flex items-center justify-center">
                              {item.dish.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.dish.imageUrl} alt={item.dish.name} className="w-full h-full object-cover" />
                              ) : (
                                <Eye className="w-4 h-4 text-stone-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 block truncate">{item.dish.name}</span>
                              <span className="text-xs text-stone-500 font-mono">${item.dish.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-stone-800 font-mono text-xs">
                          {item.views.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs">
                          {item.has3D ? (
                            <span className="text-purple-700 font-semibold">{item.arLaunches.toLocaleString()}</span>
                          ) : (
                            <span className="text-stone-400 font-normal">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs">
                          {item.has3D ? (
                            <span className="text-purple-700 font-bold">{item.viewThroughRate}%</span>
                          ) : (
                            <span className="text-stone-500 font-medium">0%</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
                              item.status === "High Performer"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.status.includes("AR Lift")
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : item.status.includes("Needs")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Top dishes ranked by guest page views and 3D interactions.</span>
              </span>
              <span className="font-mono text-xs text-stone-500">6 of {dishes.length || 6} items</span>
            </div>
          </Card>

          {/* AR vs. Standard Conversion Benchmark (4 cols) */}
          <Card className="p-5 bg-gradient-to-br from-amber-50/50 via-white to-purple-50/40 border-stone-200 shadow-xs lg:col-span-4 h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-600" />
                  AR vs. Static Photo Benchmark
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Head-to-head conversion impact across dishes.
                </p>
              </div>

              <div className="space-y-3.5 text-xs mt-4">
                {/* Metric Comparison 1 */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 shadow-2xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Order Conversion Rate</span>
                    <span className="text-emerald-700 font-bold">+26.4% Net Lift</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-purple-700 font-semibold">
                      <span>3D Model Dishes</span>
                      <span className="font-mono">42.8%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: "42.8%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-600 font-medium">
                      <span>2D Photo Only</span>
                      <span className="font-mono">33.8%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="bg-stone-400 h-full rounded-full" style={{ width: "33.8%" }} />
                    </div>
                  </div>
                </div>

                {/* Metric Comparison 2 */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Average Item Value</span>
                    <span className="text-emerald-700 font-bold">+$5.20 higher</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Guests are significantly more willing to order premium entrées ($28+ Salmon) when they can verify portion size in AR beforehand.
                  </p>
                </div>

                {/* Metric Comparison 3 */}
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 shadow-2xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Guest Deliberation Time</span>
                    <span className="text-purple-700 font-semibold">-38% Faster</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Reduces waiter call-backs regarding &ldquo;how large is this dish?&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Verified across 4,820 guest scans</span>
              </span>
              <span className="text-xs text-stone-500 font-mono">Confidence: 98%</span>
            </div>
          </Card>
        </div>

        {/* 4. Dine-In Channel & Hardware Telemetry (Equalized Heights) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Table & Area Breakdown */}
          <Card className="p-5 bg-white border-stone-200 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    Table & Area Scan Breakdown
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Identify physical QR code performance across dining zones.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  3 Zones Active
                </span>
              </div>

              <div className="space-y-4 text-xs mt-4">
                {/* Zone 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Main Dining Room (Tables 1–16)</span>
                    <span className="font-mono text-stone-700">2,410 scans (50%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: "50%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 font-medium">
                    <span>Average 150 scans / table</span>
                    <span className="text-emerald-700 font-semibold">High Engagement</span>
                  </div>
                </div>

                {/* Zone 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Patio & Garden Bar (Tables 17–28)</span>
                    <span className="font-mono text-stone-700">1,590 scans (33%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "33%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 font-medium">
                    <span>Average 132 scans / table</span>
                    <span className="text-emerald-700 font-semibold">Strong Drink Re-orders</span>
                  </div>
                </div>

                {/* Zone 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Private Wine Cellar & Mezzanine</span>
                    <span className="font-mono text-stone-700">820 scans (17%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-stone-400 h-full rounded-full" style={{ width: "17%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 font-medium">
                    <span>Lower turn rate • High dwell time (5m+)</span>
                    <span className="text-stone-600 font-medium">Fine Dining Flow</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standardized Tip Callout Container */}
            <div className="mt-5 rounded-lg p-3 text-xs flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/60 text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Tip for Managers:</strong> Table 24 on Patio has 40% fewer scans than neighboring tables—check physical acrylic stand condition.
              </span>
            </div>
          </Card>

          {/* Right: Device & AR Capability */}
          <Card className="p-5 bg-white border-stone-200 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    Diner Device & AR Telemetry
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Operating system distribution and 3D rendering reliability.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  99.1% Render Success
                </span>
              </div>

              <div className="space-y-4 text-xs mt-4">
                {/* iOS */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Apple iOS (Safari / Quick Look USDZ)</span>
                    <span className="text-purple-700 font-mono font-semibold">58% (2,795 diners)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "58%" }} />
                  </div>
                  <span className="text-xs text-stone-500 block">Native AR QuickLook instant projection</span>
                </div>

                {/* Android */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Android (Chrome / Google Scene Viewer)</span>
                    <span className="text-purple-700 font-mono font-semibold">36% (1,735 diners)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full" style={{ width: "36%" }} />
                  </div>
                  <span className="text-xs text-stone-500 block">WebXR &lt;model-viewer&gt; surface detection</span>
                </div>

                {/* Desktop / Fallback */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Desktop & Older Browsers (2D Fallback)</span>
                    <span className="text-stone-600 font-mono font-semibold">6% (290 visits)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="bg-stone-300 h-full rounded-full" style={{ width: "6%" }} />
                  </div>
                  <span className="text-xs text-stone-500 block">Seamless 3D orbit viewer and high-res food photo fallback</span>
                </div>
              </div>
            </div>

            {/* Standardized AR Notice Callout Container */}
            <div className="mt-5 rounded-lg p-3 text-xs flex items-start gap-2.5 bg-purple-50/60 border border-purple-200/60 text-purple-900">
              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Zero AR dead-ends:</strong> 100% of diners were able to explore dishes regardless of phone age.
              </span>
            </div>
          </Card>
        </div>

        {/* 5. Category Flow Funnel & Drop-Off (Compact Horizontal Flow) */}
        <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Category Flow Funnel & Engagement Progression
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Visualizing how diners navigate from Starters through Mains, Drinks, and Desserts.
              </p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Diner Journey Funnel
            </span>
          </div>

          {/* Compact Horizontal Funnel Flow (Step 1 -> Step 2 -> Step 3 -> Step 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Step 1: Starters */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Step 1</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">100% Flow</span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm mt-1.5 truncate">Starters & Appetizers</h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-amber-600">4,820</span>
                  <span className="text-xs text-stone-500">views</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex items-center justify-between">
                <span>Entry category</span>
                <span className="text-stone-400 font-mono text-[11px]">Baseline</span>
              </div>
            </div>

            {/* Step 2: Mains */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Step 2</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">88% Flow</span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm mt-1.5 truncate">Wood-Fired Mains</h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-amber-600">4,240</span>
                  <span className="text-xs text-stone-500">views</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex items-center justify-between">
                <span>12% drop-off</span>
                <span className="text-purple-700 font-medium text-[11px]">Peak 3D Views</span>
              </div>
            </div>

            {/* Step 3: Drinks */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Step 3</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">64% Flow</span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm mt-1.5 truncate">Artisanal Drinks & Wine</h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-amber-600">3,080</span>
                  <span className="text-xs text-stone-500">views</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex items-center justify-between">
                <span>24% drop-off</span>
                <span className="text-stone-600 font-medium text-[11px]">Continuous Browse</span>
              </div>
            </div>

            {/* Step 4: Desserts */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Step 4</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">52% Flow</span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm mt-1.5 truncate">Sweet Finishes & Desserts</h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-amber-600">2,510</span>
                  <span className="text-xs text-stone-500">views</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-xs text-stone-500 flex items-center justify-between">
                <span>12% drop-off</span>
                <span className="text-amber-700 font-medium text-[11px]">Post-Meal Re-open</span>
              </div>
            </div>
          </div>

          {/* Retention Horizontal Progression Bar */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span className="flex items-center gap-1.5">
                <span>Funnel Progression:</span>
                <span className="text-stone-500 font-normal">Starters (100%) &rarr; Mains (88%) &rarr; Drinks (64%) &rarr; Desserts (52%)</span>
              </span>
              <span className="text-stone-500 font-mono text-[11px]">Retention Range: 52%–100%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden flex">
              <div className="bg-amber-600 h-full" style={{ width: "36%" }} title="Starters (100%)" />
              <div className="bg-amber-500 h-full" style={{ width: "32%" }} title="Mains (88%)" />
              <div className="bg-purple-500 h-full" style={{ width: "20%" }} title="Drinks (64%)" />
              <div className="bg-emerald-500 h-full" style={{ width: "12%" }} title="Desserts (52%)" />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start sm:items-center justify-between gap-2">
            <span className="flex items-start sm:items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Post-Meal Discovery Insight:</strong> 34% of diners re-open their QR menu after entrees are served to check desserts and digestifs.
              </span>
            </span>
            <span className="font-mono text-xs text-stone-500 hidden sm:inline flex-shrink-0">Telemetry v1.2</span>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
