"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  Store,
  ExternalLink,
  Copy,
  Check,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Camera,
  Layers,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Bell,
  Utensils,
  Smartphone,
  Eye,
  Settings2,
  Palette,
  Sun,
  Moon,
  Laptop,
  Compass,
  QrCode,
  Sliders,
  DollarSign,
  Coffee,
  X,
  UserPlus,
} from "lucide-react";

const RESTAURANT_ID = "rest_01_pilot_bistro";

interface OperatingHourDay {
  day: string;
  isOpen: boolean;
  lunchOpen: string;
  lunchClose: string;
  dinnerOpen: string;
  dinnerClose: string;
}

interface DiningZone {
  id: string;
  name: string;
  tableStart: number;
  tableEnd: number;
  totalTables: number;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "KITCHEN_STAFF" | "SERVICE_STAFF";
  avatarUrl?: string;
  lastActive: string;
}

export default function RestaurantProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "digital" | "zones" | "team">("general");

  // Master Restaurant State
  const [name, setName] = useState("The Olive Grove Bistro");
  const [slug, setSlug] = useState("olive-grove");
  const [description, setDescription] = useState(
    "Artisanal Mediterranean dining with fresh, seasonal ingredients and rustic wood-fired flavors."
  );
  const [address, setAddress] = useState("104 Heritage Lane, Downtown Arts District");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [email, setEmail] = useState("contact@olivegrovebistro.com");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://maps.google.com/?q=The+Olive+Grove+Bistro");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);

  // Cuisine Tags
  const [cuisineTags, setCuisineTags] = useState<string[]>([
    "Mediterranean",
    "Farm-to-Table",
    "Wood-Fired",
    "Organic Wine",
  ]);
  const [newTagInput, setNewTagInput] = useState("");

  // Operating Hours
  const [operatingHours, setOperatingHours] = useState<OperatingHourDay[]>([
    { day: "Monday", isOpen: true, lunchOpen: "11:30 AM", lunchClose: "03:30 PM", dinnerOpen: "05:30 PM", dinnerClose: "10:00 PM" },
    { day: "Tuesday", isOpen: true, lunchOpen: "11:30 AM", lunchClose: "03:30 PM", dinnerOpen: "05:30 PM", dinnerClose: "10:00 PM" },
    { day: "Wednesday", isOpen: true, lunchOpen: "11:30 AM", lunchClose: "03:30 PM", dinnerOpen: "05:30 PM", dinnerClose: "10:00 PM" },
    { day: "Thursday", isOpen: true, lunchOpen: "11:30 AM", lunchClose: "03:30 PM", dinnerOpen: "05:30 PM", dinnerClose: "10:30 PM" },
    { day: "Friday", isOpen: true, lunchOpen: "11:30 AM", lunchClose: "03:30 PM", dinnerOpen: "05:00 PM", dinnerClose: "11:30 PM" },
    { day: "Saturday", isOpen: true, lunchOpen: "11:00 AM", lunchClose: "04:00 PM", dinnerOpen: "05:00 PM", dinnerClose: "11:30 PM" },
    { day: "Sunday", isOpen: true, lunchOpen: "11:00 AM", lunchClose: "04:00 PM", dinnerOpen: "05:00 PM", dinnerClose: "10:00 PM" },
  ]);
  const [specialHoursNote, setSpecialHoursNote] = useState("Thanksgiving Weekend (Nov 27–29): Continuous Service 1:00 PM – 11:00 PM");

  // Branding & Visual Customization
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80"
  );
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
  );
  const [primaryColor, setPrimaryColor] = useState("#EA580C"); // Warm Amber
  const [accentColor, setAccentColor] = useState("#8B5CF6"); // Soft Purple
  const [themeMode, setThemeMode] = useState<"LIGHT" | "DARK" | "SYSTEM">("LIGHT");

  // Social Links
  const [instagram, setInstagram] = useState("https://instagram.com/olivegrovebistro");
  const [facebook, setFacebook] = useState("https://facebook.com/olivegrovebistro");
  const [website, setWebsite] = useState("https://olivegrovebistro.com");
  const [googleReviews, setGoogleReviews] = useState("https://g.page/r/olivegrove/review");

  // 3D & Digital Dining Config
  const [arLightingPreset, setArLightingPreset] = useState<"warm" | "studio" | "daylight">("warm");
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Halal",
    "Nut-Free",
  ]);
  const [digitalOrderingMode, setDigitalOrderingMode] = useState<"BROWSE_ONLY" | "CALL_WAITER" | "ORDER_AND_PAY">(
    "CALL_WAITER"
  );

  // Dining Zones & Table Count
  const [zones, setZones] = useState<DiningZone[]>([
    {
      id: "zone-1",
      name: "Main Dining Room",
      tableStart: 1,
      tableEnd: 16,
      totalTables: 16,
      description: "Center dining hall, rustic wood tables & booths",
    },
    {
      id: "zone-2",
      name: "Patio & Garden Bar",
      tableStart: 17,
      tableEnd: 28,
      totalTables: 12,
      description: "Outdoor terrace with heated pergola & cocktail high-tops",
    },
    {
      id: "zone-3",
      name: "Private Wine Cellar",
      tableStart: 29,
      tableEnd: 36,
      totalTables: 8,
      description: "Sub-level tasting tables & private sommelier banquets",
    },
    {
      id: "zone-4",
      name: "Mezzanine Lounge",
      tableStart: 37,
      tableEnd: 44,
      totalTables: 8,
      description: "Overlook lounge for aperitifs & dessert cocktails",
    },
  ]);

  // Team & Access Controls
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "usr-1",
      name: "Elena Rostova",
      email: "manager@olivegrovebistro.com",
      role: "OWNER",
      lastActive: "Active now",
    },
    {
      id: "usr-2",
      name: "Chef Marco Bellini",
      email: "marco@olivegrovebistro.com",
      role: "KITCHEN_STAFF",
      lastActive: "22 mins ago",
    },
    {
      id: "usr-3",
      name: "Sarah Jenkins",
      email: "sarah.j@olivegrovebistro.com",
      role: "MANAGER",
      lastActive: "1 hour ago",
    },
    {
      id: "usr-4",
      name: "Carlos Mendez",
      email: "carlos@olivegrovebistro.com",
      role: "KITCHEN_STAFF",
      lastActive: "Yesterday",
    },
  ]);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"OWNER" | "MANAGER" | "KITCHEN_STAFF" | "SERVICE_STAFF">("KITCHEN_STAFF");

  // Zone creation modal state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneStart, setNewZoneStart] = useState(45);
  const [newZoneEnd, setNewZoneEnd] = useState(52);
  const [newZoneDesc, setNewZoneDesc] = useState("");

  // Load existing restaurant profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/${RESTAURANT_ID}`);
        const json = await res.json();
        if (json.success && json.data) {
          const r = json.data;
          setName(r.name || "The Olive Grove Bistro");
          setSlug(r.slug || "olive-grove");
          if (r.description) setDescription(r.description);
          if (r.address) setAddress(r.address);
          if (r.phone) setPhone(r.phone);
          if (r.email) setEmail(r.email);
          if (r.defaultLanguage) setDefaultLanguage(r.defaultLanguage);
          if (r.currency) setCurrency(r.currency);
          if (r.logoUrl) setLogoUrl(r.logoUrl);
          if (r.bannerUrl) setBannerUrl(r.bannerUrl);
          if (r.status) setIsOpenForOrders(r.status === "ACTIVE");
          if (r.primaryColor) setPrimaryColor(r.primaryColor);
          if (r.accentColor) setAccentColor(r.accentColor);
          if (r.themeMode) setThemeMode(r.themeMode);
          if (r.digitalOrderingMode) setDigitalOrderingMode(r.digitalOrderingMode);
          if (r.arLightingPreset) setArLightingPreset(r.arLightingPreset);
          if (r.cuisineTags) setCuisineTags(r.cuisineTags);
          if (r.dietaryFilters) setDietaryFilters(r.dietaryFilters);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch restaurant profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Save changes to backend
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const payload = {
        name,
        description,
        address,
        phone,
        email,
        logoUrl,
        bannerUrl,
        defaultLanguage,
        currency,
        status: isOpenForOrders ? "ACTIVE" : "INACTIVE",
        primaryColor,
        accentColor,
        themeMode,
        digitalOrderingMode,
        arLightingPreset,
        cuisineTags,
        dietaryFilters,
        socialLinks: {
          instagram,
          facebook,
          website,
          googleReviews,
        },
        operatingHours,
        zones,
      };

      const res = await fetch(`/api/restaurants/${RESTAURANT_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(json.error?.message || "Failed to save restaurant profile");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error saving restaurant profile", err);
      alert("Error saving restaurant profile");
    } finally {
      setSaving(false);
    }
  };

  // Copy public menu link
  const copyPublicUrl = () => {
    const fullUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Add cuisine tag
  const handleAddTag = () => {
    if (newTagInput.trim() && !cuisineTags.includes(newTagInput.trim())) {
      setCuisineTags([...cuisineTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  // Remove cuisine tag
  const handleRemoveTag = (tagToRemove: string) => {
    setCuisineTags(cuisineTags.filter((t) => t !== tagToRemove));
  };

  // Toggle dietary filter
  const toggleDietaryFilter = (filter: string) => {
    if (dietaryFilters.includes(filter)) {
      setDietaryFilters(dietaryFilters.filter((f) => f !== filter));
    } else {
      setDietaryFilters([...dietaryFilters, filter]);
    }
  };

  // Add new zone
  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    const count = Math.max(1, newZoneEnd - newZoneStart + 1);
    const newZone: DiningZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      tableStart: Number(newZoneStart),
      tableEnd: Number(newZoneEnd),
      totalTables: count,
      description: newZoneDesc.trim() || `Tables ${newZoneStart}–${newZoneEnd}`,
    };
    setZones([...zones, newZone]);
    setNewZoneName("");
    setNewZoneDesc("");
    setIsZoneModalOpen(false);
  };

  // Remove zone
  const handleRemoveZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  // Add new team member
  const handleInviteStaff = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      lastActive: "Invited (Pending login)",
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteName("");
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  // Update staff role
  const handleUpdateRole = (id: string, newRole: TeamMember["role"]) => {
    setTeamMembers(teamMembers.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
  };

  const totalActiveTables = zones.reduce((sum, z) => sum + z.totalTables, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-wider font-semibold">
          <span>WORKSPACE</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-700">The Olive Grove Bistro</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-amber-600 font-bold">Restaurant Profile & Config</span>
        </nav>

        {/* 1. Top Identity Header & Live Status Banner */}
        <Card className="p-6 bg-white border-stone-200 shadow-xs relative overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 transition-colors"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Identity & Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Profile Avatar / Logo Uploader */}
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border-2 border-stone-200 shadow-xs flex-shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 text-stone-400 m-auto mt-5" />
                )}
                <button
                  type="button"
                  title="Upload / Change Logo"
                  onClick={() => {
                    const newUrl = prompt("Enter new Logo Image URL:", logoUrl);
                    if (newUrl) setLogoUrl(newUrl);
                  }}
                  className="absolute inset-0 bg-stone-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Change</span>
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black text-stone-900 tracking-tight">{name}</h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    rest_01_pilot_bistro
                  </span>
                </div>

                {/* Cuisine Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {cuisineTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-amber-600 hover:text-amber-900 ml-0.5"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="+ Add cuisine"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      className="w-24 text-xs px-2 py-0.5 rounded-md border border-dashed border-stone-300 bg-stone-50 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <p className="text-xs text-stone-500 mt-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SilvyOS 2.0 Digital Dining • Multi-Tenant Active • Production Ready
                </p>
              </div>
            </div>

            {/* Public Link Pill & Master Open/Close Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Direct Link Pill */}
              <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1 shadow-2xs">
                <div className="px-3 py-1 flex items-center gap-1.5 text-xs font-mono font-medium text-stone-700">
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                  <span>/r/{slug}</span>
                </div>
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  title="Copy customer menu URL"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={`/r/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-all"
                  title="Open live customer view in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Master Restaurant Status Toggle */}
              <div className="flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2 rounded-xl border border-stone-200 bg-white shadow-2xs">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Live Restaurant Status
                  </p>
                  <span
                    className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${
                      isOpenForOrders ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOpenForOrders ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {isOpenForOrders ? "Accepting Diners" : "Kitchen Paused"}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={isOpenForOrders}
                    onChange={(e) => setIsOpenForOrders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Save All Changes CTA */}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs text-xs font-bold px-4 py-2.5 flex items-center gap-2 whitespace-nowrap"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Success:</strong> Restaurant profile and digital dining configurations were updated and synchronized with <code>/r/{slug}</code>.
                </span>
              </span>
              <span className="text-[11px] font-mono text-emerald-600">Just now</span>
            </div>
          )}
        </Card>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-1 overflow-x-auto text-xs font-semibold text-stone-600">
          {[
            { id: "general", label: "Core Business & Hours", icon: Store },
            { id: "branding", label: "Branding & Mobile Theme", icon: Palette },
            { id: "digital", label: "3D & Digital Dining Mode", icon: Sparkles },
            { id: "zones", label: "Table Zones & Layout", icon: Layers },
            { id: "team", label: "Team & Access Roles", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-stone-900 text-white shadow-2xs font-bold"
                    : "hover:bg-stone-100 text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CORE BUSINESS INFORMATION & SCHEDULE */}
        {/* ========================================================================= */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Basic Details & Location (8 cols) */}
              <Card className="p-5 bg-white border-stone-200 shadow-xs lg:col-span-7 space-y-4">
                <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-600" />
                      Core Establishment Details
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Public restaurant identity shown at the top of customer menu sessions.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Primary Profile
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Establishment Name */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Official Establishment Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                    />
                  </div>

                  {/* Public Slug URL */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Public Menu Slug URL (Permanent QR Destination)
                    </label>
                    <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 overflow-hidden">
                      <span className="px-3 py-2 text-stone-500 font-mono text-xs border-r border-stone-300 bg-stone-100">
                        silvyos.com/r/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full px-3 py-2 bg-transparent text-stone-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Warning: Changing this slug redirects existing printed QR code links. Keep stable in production.
                    </p>
                  </div>

                  {/* Short Bio / Tagline */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Hero Bio / Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short story, culinary ethos, or seasonal announcement..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs leading-relaxed"
                    />
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Displayed immediately below restaurant branding on diner mobile screens.
                    </p>
                  </div>

                  {/* Language & Currency Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Primary Default Language
                      </label>
                      <select
                        value={defaultLanguage}
                        onChange={(e) => setDefaultLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                      >
                        <option value="en">English (US / UK)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="fr">French (Français)</option>
                        <option value="it">Italian (Italiano)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="mr">Marathi (मराठी)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Display Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                      >
                        <option value="USD">USD ($) — United States Dollar</option>
                        <option value="EUR">EUR (€) — Euro</option>
                        <option value="GBP">GBP (£) — British Pound</option>
                        <option value="INR">INR (₹) — Indian Rupee</option>
                        <option value="AED">AED (AED) — UAE Dirham</option>
                        <option value="CAD">CAD ($) — Canadian Dollar</option>
                        <option value="AUD">AUD ($) — Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact & Location Coordinates (5 cols) */}
              <Card className="p-5 bg-white border-stone-200 shadow-xs lg:col-span-5 space-y-4">
                <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Contact & Location
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Front-desk coordinates so diners can get directions or call table host.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live on Mobile
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Street Address */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Physical Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Phone & Manager Email */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      Front Desk Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      Manager & Reservation Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Google Maps Link / Coordinates */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-stone-400" />
                      Google Maps Link or Pin Coordinates
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/?q=..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                      />
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Test
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Diners browsing the menu can tap <strong>&ldquo;Get Directions&rdquo;</strong> to launch native Apple Maps or Google Maps on iOS/Android.
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Operating Hours Grid */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Operating Service Hours & Shifts
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure weekly dining shifts. Diners scanning QR codes outside these hours see a courteous &ldquo;Kitchen Closed&rdquo; notice.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  7-Day Schedule
                </span>
              </div>

              {/* Operating Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 uppercase font-semibold tracking-wider border-b border-stone-200">
                      <th className="py-2.5 px-3">Day of Week</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Lunch Service Shift</th>
                      <th className="py-2.5 px-3">Dinner Service Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {operatingHours.map((item, idx) => (
                      <tr key={item.day} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-stone-800 w-32">{item.day}</td>
                        <td className="py-2.5 px-3 w-36">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isOpen}
                              onChange={(e) => {
                                const next = [...operatingHours];
                                next[idx].isOpen = e.target.checked;
                                setOperatingHours(next);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-600"></div>
                            <span className="ml-2 text-xs font-semibold text-stone-700">
                              {item.isOpen ? "Open" : "Closed"}
                            </span>
                          </label>
                        </td>
                        <td className="py-2.5 px-3">
                          {item.isOpen ? (
                            <div className="flex items-center gap-1.5 font-mono text-stone-700">
                              <input
                                type="text"
                                value={item.lunchOpen}
                                onChange={(e) => {
                                  const next = [...operatingHours];
                                  next[idx].lunchOpen = e.target.value;
                                  setOperatingHours(next);
                                }}
                                className="w-24 px-2 py-1 rounded border border-stone-300 text-xs bg-white"
                              />
                              <span className="text-stone-400">to</span>
                              <input
                                type="text"
                                value={item.lunchClose}
                                onChange={(e) => {
                                  const next = [...operatingHours];
                                  next[idx].lunchClose = e.target.value;
                                  setOperatingHours(next);
                                }}
                                className="w-24 px-2 py-1 rounded border border-stone-300 text-xs bg-white"
                              />
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">No lunch shift</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.isOpen ? (
                            <div className="flex items-center gap-1.5 font-mono text-stone-700">
                              <input
                                type="text"
                                value={item.dinnerOpen}
                                onChange={(e) => {
                                  const next = [...operatingHours];
                                  next[idx].dinnerOpen = e.target.value;
                                  setOperatingHours(next);
                                }}
                                className="w-24 px-2 py-1 rounded border border-stone-300 text-xs bg-white"
                              />
                              <span className="text-stone-400">to</span>
                              <input
                                type="text"
                                value={item.dinnerClose}
                                onChange={(e) => {
                                  const next = [...operatingHours];
                                  next[idx].dinnerClose = e.target.value;
                                  setOperatingHours(next);
                                }}
                                className="w-24 px-2 py-1 rounded border border-stone-300 text-xs bg-white"
                              />
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">Kitchen closed all day</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Holiday / Special Hours Note */}
              <div className="pt-2">
                <label className="block font-bold text-stone-800 text-xs mb-1">
                  Holiday / Special Event Hours Notice
                </label>
                <input
                  type="text"
                  value={specialHoursNote}
                  onChange={(e) => setSpecialHoursNote(e.target.value)}
                  placeholder="e.g. New Year's Eve: Special 5-Course Dinner Seatings from 6:00 PM"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                />
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BRANDING & MOBILE INTERFACE CUSTOMIZATION */}
        {/* ========================================================================= */}
        {activeTab === "branding" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Brand Assets Card */}
              <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" />
                      Visual Brand Assets
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Logos and hero cover images shown when guests scan table QR codes.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    High Resolution
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Square Logo */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Square Restaurant Logo URL (Used on QR stamps and header)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const url = prompt("Enter Square Logo image URL:", logoUrl);
                          if (url) setLogoUrl(url);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 flex-shrink-0"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {/* Hero Cover Banner Image */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Hero Cover Banner Image URL (Top banner on customer mobile menu)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const url = prompt("Enter Cover Banner image URL:", bannerUrl);
                          if (url) setBannerUrl(url);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 flex-shrink-0"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Theme & Accent Colors Card */}
              <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-600" />
                      Theme & Accent Color Palette
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tailor the digital dining experience to match physical restaurant interior styling.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Live Palette
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Primary Brand Color */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">
                      Primary Brand Color (Category highlights, active states)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-28 px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-mono text-xs font-bold"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {[
                          { label: "Bistro Amber", hex: "#EA580C" },
                          { label: "Olive Green", hex: "#4D7C0F" },
                          { label: "Wine Red", hex: "#991B1B" },
                          { label: "Charcoal Slate", hex: "#1E293B" },
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setPrimaryColor(preset.hex)}
                            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-2xs"
                            style={{
                              backgroundColor: preset.hex,
                              borderColor: primaryColor === preset.hex ? "#1C1917" : "transparent",
                            }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Accent / CTA Color */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">
                      Button & 3D Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-28 px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-mono text-xs font-bold"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {[
                          { label: "Purple AR", hex: "#8B5CF6" },
                          { label: "Emerald Mint", hex: "#10B981" },
                          { label: "Golden Honey", hex: "#F59E0B" },
                          { label: "Rose Ruby", hex: "#F43F5E" },
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setAccentColor(preset.hex)}
                            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-2xs"
                            style={{
                              backgroundColor: preset.hex,
                              borderColor: accentColor === preset.hex ? "#1C1917" : "transparent",
                            }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Viewer Theme Mode */}
                  <div>
                    <label className="block font-bold text-stone-800 mb-1.5">
                      Diner Mobile Theme Preference
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "LIGHT", label: "Light Theme", icon: Sun, desc: "Crisp white canvas" },
                        { id: "DARK", label: "Dark Theme", icon: Moon, desc: "Sleek evening ambiance" },
                        { id: "SYSTEM", label: "Match Phone", icon: Laptop, desc: "Follows diner device" },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = themeMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setThemeMode(mode.id as any)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-amber-600 bg-amber-50/50 shadow-2xs"
                                : "border-stone-200 bg-white hover:bg-stone-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-amber-600" : "text-stone-500"}`} />
                              <span className="font-bold text-stone-900 text-xs">{mode.label}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1">{mode.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Social & Web Links */}
              <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      Social Media & Review Links
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Subtle footer icons displayed at the bottom of the diner mobile view.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                    Footer Icons
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Official Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Google Review Page URL</label>
                    <input
                      type="text"
                      value={googleReviews}
                      onChange={(e) => setGoogleReviews(e.target.value)}
                      placeholder="https://g.page/r/..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Real-time Live Phone Mockup Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-6">
              <Card className="p-4 bg-stone-900 border-stone-800 text-white shadow-xl rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-stone-200">Live Diner Phone Preview</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                    /r/{slug}
                  </span>
                </div>

                {/* Simulated Smartphone Frame */}
                <div className="w-full max-w-[320px] mx-auto bg-white text-stone-900 rounded-3xl overflow-hidden border-4 border-stone-800 shadow-2xl relative font-sans text-left">
                  {/* Phone Notch / Speaker */}
                  <div className="w-full bg-stone-950 py-1.5 flex justify-center">
                    <div className="w-16 h-3 bg-stone-800 rounded-full" />
                  </div>

                  {/* Hero Cover Banner */}
                  <div className="relative h-28 w-full bg-stone-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Open Status Chip on Mobile */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-emerald-600/90 shadow">
                      {isOpenForOrders ? "Open for Orders" : "Kitchen Paused"}
                    </div>
                  </div>

                  {/* Restaurant Avatar Overlay */}
                  <div className="px-4 -mt-7 relative flex items-end justify-between">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      3D Menu Active
                    </span>
                  </div>

                  {/* Restaurant Bio in Mobile Preview */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-black text-sm text-stone-900 leading-tight">{name}</h3>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                      {description}
                    </p>

                    {/* Cuisine Chips */}
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {cuisineTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Simulated Sample Dish Card */}
                    <div className="mt-3 p-2 rounded-xl bg-stone-50 border border-stone-200 flex gap-2.5 items-center">
                      <div className="w-12 h-12 rounded-lg bg-stone-200 flex-shrink-0 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80"
                          alt="Dish"
                          className="w-full h-full object-cover"
                        />
                        <span
                          className="absolute bottom-0.5 right-0.5 p-0.5 rounded text-[8px] text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[11px] text-stone-900 truncate">Wood-Fired Salmon</p>
                        <p className="text-[9px] text-stone-400 font-mono">$28.00 • 3D Ready</p>
                      </div>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Inspect
                      </button>
                    </div>

                    {/* Ordering Mode Pill Indicator */}
                    <div className="mt-2 py-1 px-2 rounded-lg bg-stone-100 text-[10px] text-stone-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-stone-500" />
                        <span>Mode:</span>
                      </span>
                      <span className="font-bold text-stone-800">
                        {digitalOrderingMode === "BROWSE_ONLY"
                          ? "Browse & 3D Only"
                          : digitalOrderingMode === "CALL_WAITER"
                          ? "Call Waiter Service"
                          : "Full Order & Pay"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-stone-400">
                  Real-time preview dynamically updates as you alter colors and hero assets.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 3D & DIGITAL DINING CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === "digital" && (
          <div className="space-y-6">
            {/* AR Grounding & Lighting Presets */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AR Grounding & Lighting Environment Presets
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Controls default ambient light reflection and plane detection for virtual dish projections on tables.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  WebXR & USDZ Engine
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {[
                  {
                    id: "warm",
                    title: "Warm Dining Ambience",
                    kelvin: "2700K Warm Glow",
                    desc: "Simulates soft candlelit dining halls and rustic wood-fired bistro lighting. Accentuates grilled textures and warm colors.",
                    recommended: true,
                  },
                  {
                    id: "studio",
                    title: "Neutral Culinary Studio",
                    kelvin: "5000K Neutral Balance",
                    desc: "Laboratory-calibrated crisp daylight. Ideal for exact portion estimation, fine ingredient clarity, and high-fidelity colors.",
                    recommended: false,
                  },
                  {
                    id: "daylight",
                    title: "Terrace & Patio Sun",
                    kelvin: "6500K High Skylight",
                    desc: "High intensity sunlit environment. Best suited for outdoor garden tables, daytime brunch, and cocktail reflections.",
                    recommended: false,
                  },
                ].map((preset) => {
                  const isSelected = arLightingPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setArLightingPreset(preset.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-600"
                          : "border-stone-200 bg-white hover:bg-stone-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                            {preset.kelvin}
                          </span>
                          {preset.recommended && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm">{preset.title}</h3>
                        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{preset.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isSelected ? "text-purple-700" : "text-stone-500"}`}>
                          {isSelected ? "Active Lighting Preset" : "Click to Select"}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Digital Ordering Mode Card */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    Digital Dining & Ordering Mode
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select how guests interact with staff from their smartphones.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  Kitchen Flow Control
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {[
                  {
                    id: "BROWSE_ONLY",
                    title: "Browse & 3D Only",
                    badge: "Visual Inspection",
                    desc: "Guests explore dishes, ingredients, and 3D virtual models. Physical floor servers take all food and drink orders manually.",
                  },
                  {
                    id: "CALL_WAITER",
                    title: "Call Waiter / Service Requests",
                    badge: "Hybrid Dining (Active)",
                    desc: "Guests can summon their assigned waiter, request water/ice refills, or ask for the check directly from their phone.",
                  },
                  {
                    id: "ORDER_AND_PAY",
                    title: "Full Digital Order & Pay",
                    badge: "Autonomous Ordering",
                    desc: "Guests build full orders, customize options, and submit directly to POS/kitchen display with instant mobile payment.",
                  },
                ].map((mode) => {
                  const isSelected = digitalOrderingMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setDigitalOrderingMode(mode.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600"
                          : "border-stone-200 bg-white hover:bg-stone-50"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {mode.badge}
                        </span>
                        <h3 className="font-bold text-stone-900 text-sm mt-2">{mode.title}</h3>
                        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{mode.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isSelected ? "text-amber-700" : "text-stone-500"}`}>
                          {isSelected ? "Selected Mode" : "Activate Mode"}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Global Dietary Filters Toggle */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    Customer Dietary Filter Pills
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Choose which dietary filter pills appear as quick-toggles in the customer mobile menu toolbar.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Allergen Safe
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  "Vegetarian",
                  "Vegan",
                  "Gluten-Free",
                  "Halal",
                  "Nut-Free",
                  "Dairy-Free",
                ].map((filter) => {
                  const isChecked = dietaryFilters.includes(filter);
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => toggleDietaryFilter(filter)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs font-bold"
                          : "border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 font-medium"
                      }`}
                    >
                      <span className="text-xs block">{filter}</span>
                      <span className="text-[10px] mt-1 block opacity-75">
                        {isChecked ? "Visible" : "Hidden"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TABLE & ZONE SETUP */}
        {/* ========================================================================= */}
        {activeTab === "zones" && (
          <div className="space-y-6">
            {/* Header Strip with Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-white border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Zones</p>
                  <p className="text-2xl font-black text-stone-900 mt-1">{zones.length}</p>
                </div>
                <Layers className="w-7 h-7 text-amber-600" />
              </Card>

              <Card className="p-4 bg-white border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Tables Mapped</p>
                  <p className="text-2xl font-black text-stone-900 mt-1">{totalActiveTables}</p>
                </div>
                <QrCode className="w-7 h-7 text-purple-600" />
              </Card>

              <Card className="p-4 bg-white border-stone-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Telemetric Zones</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </Card>
            </div>

            {/* Zones Management List */}
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    Dining Room Zones & Table Allocations
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Match dining areas with Analytics &amp; QR routing (Main Dining Room, Patio, Cellar, Mezzanine).
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsZoneModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Zone
                </Button>
              </div>

              <div className="space-y-3">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-stone-900 text-sm">{zone.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Tables {zone.tableStart}–{zone.tableEnd}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          ({zone.totalTables} physical tables)
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{zone.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`/dashboard/qr-codes?zone=${encodeURIComponent(zone.name)}`}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-stone-500" />
                        Generate Batch QRs
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(zone.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TEAM & ACCESS ROLES */}
        {/* ========================================================================= */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border-stone-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    Authorized Staff &amp; Role-Based Access Controls
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Control who can edit menu pricing, mark items 86&apos;d out-of-stock, or reply to diner feedback.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite Staff Member
                </Button>
              </div>

              {/* Staff Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 uppercase font-semibold tracking-wider border-b border-stone-200">
                      <th className="py-2.5 px-3">Team Member</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Permissions Scope</th>
                      <th className="py-2.5 px-3">Activity Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block">{member.name}</span>
                              <span className="text-[11px] text-stone-400 font-mono">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                            disabled={member.role === "OWNER"}
                            className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-semibold bg-white text-stone-800 disabled:bg-stone-100"
                          >
                            <option value="OWNER">Owner (Full Admin)</option>
                            <option value="MANAGER">Restaurant Manager</option>
                            <option value="KITCHEN_STAFF">Kitchen Staff / Chef</option>
                            <option value="SERVICE_STAFF">Floor Service Host</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          {member.role === "OWNER" && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Full Root Access &amp; Billing
                            </span>
                          )}
                          {member.role === "MANAGER" && (
                            <span className="text-purple-700 font-medium flex items-center gap-1">
                              Menu Pricing, Analytics &amp; Replies
                            </span>
                          )}
                          {member.role === "KITCHEN_STAFF" && (
                            <span className="text-amber-800 font-medium flex items-center gap-1">
                              Live Stock / 86&apos;d Availability Only
                            </span>
                          )}
                          {member.role === "SERVICE_STAFF" && (
                            <span className="text-stone-600 font-medium flex items-center gap-1">
                              View Orders &amp; Service Calls
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-stone-500 font-medium text-xs">{member.lastActive}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {member.role !== "OWNER" && (
                            <button
                              type="button"
                              onClick={() => setTeamMembers(teamMembers.filter((m) => m.id !== member.id))}
                              className="text-stone-400 hover:text-rose-600 p-1"
                              title="Revoke access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modal: Invite Team Member */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  Invite New Staff Member
                </h3>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam O'Connor"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="liam@olivegrovebistro.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Role &amp; Permissions Scope</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                  >
                    <option value="KITCHEN_STAFF">Kitchen Staff (Instant 86/Stock Toggles)</option>
                    <option value="MANAGER">Restaurant Manager (Menu Edits &amp; Analytics)</option>
                    <option value="SERVICE_STAFF">Floor Service Host (Table Requests)</option>
                    <option value="OWNER">Co-Owner (Full Admin Access)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleInviteStaff} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Dining Zone */}
        {isZoneModalOpen && (
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Define New Dining Zone
                </h3>
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Zone Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rooftop Skylight Deck"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Start Table #</label>
                    <input
                      type="number"
                      value={newZoneStart}
                      onChange={(e) => setNewZoneStart(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">End Table #</label>
                    <input
                      type="number"
                      value={newZoneEnd}
                      onChange={(e) => setNewZoneEnd(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Description / Location Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd floor open-air deck, high-top bar tables"
                    value={newZoneDesc}
                    onChange={(e) => setNewZoneDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                <Button variant="outline" onClick={() => setIsZoneModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddZone} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Save Zone
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

