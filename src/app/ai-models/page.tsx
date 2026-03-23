"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CountUp from "react-countup";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Model {
  id: string; slug: string; name: string; provider: string;
  description: string; context: string; contextRaw: number;
  modality: string; inputModalities: string[];
  promptPricePer1M: number; completionPricePer1M: number;
  isFree: boolean; createdAt: string | null;
  tags: string[]; popularityRank: number | null;
  isTrending: boolean; badge: string | null; isPopular: boolean;
}

interface ChartData { label?: string; name?: string; count: number }

interface ApiResponse {
  total: number;
  popular: Model[];
  trending: Model[];
  all: Model[];
  charts: {
    providerDistribution: ChartData[];
    priceDistribution: ChartData[];
    contextDistribution: ChartData[];
  };
}

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "All",                  icon: "◈", label: "All" },
  { key: "Coding",               icon: "⌥", label: "Coding" },
  { key: "Writing",              icon: "✎", label: "Writing" },
  { key: "Research",             icon: "⊕", label: "Research" },
  { key: "Chat",                 icon: "◎", label: "Chat" },
  { key: "Agents / Automation",  icon: "⚡", label: "Agents" },
  { key: "Image / Multimodal",   icon: "◉", label: "Multimodal" },
  { key: "Reasoning",            icon: "∞", label: "Reasoning" },
];

const CONTEXT_FILTERS = [
  { label: "≤ 8K",   max: 8_000 },
  { label: "16K",    max: 16_000 },
  { label: "32K",    max: 32_000 },
  { label: "128K",   max: 128_000 },
  { label: "200K+",  max: Infinity },
];

const SORT_OPTIONS = [
  { key: "popular",  label: "Most Popular" },
  { key: "trending", label: "Trending" },
  { key: "newest",   label: "Newest" },
  { key: "cheapest", label: "Cheapest" },
  { key: "ctx",      label: "Largest Context" },
];

const PIE_COLORS = [
  "#6366F1","#06B6D4","#10B981","#F59E0B",
  "#EF4444","#8B5CF6","#EC4899","#14B8A6",
];

const PROVIDER_COLORS: Record<string, string> = {
  Anthropic: "#E97D3A",
  OpenAI:    "#10A37F",
  Google:    "#4285F4",
  Meta:      "#0082FB",
  DeepSeek:  "#06B6D4",
  Mistral:   "#F59E0B",
  Cohere:    "#DE3163",
  Amazon:    "#FF9900",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtPrice(v: number): string {
  if (v === 0) return "Free";
  if (v < 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

function getProviderColor(provider: string): string {
  return PROVIDER_COLORS[provider] ?? "#6366F1";
}

function getInitials(provider: string): string {
  return provider.split(/[ /]/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Provider Avatar ─────────────────────────────────────────────────────────────
function ProviderAvatar({ provider, size = 36 }: { provider: string; size?: number }) {
  const color = getProviderColor(provider);
  return (
    <div
      className="flex items-center justify-center rounded-xl font-extrabold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
        fontSize: size * 0.33,
        letterSpacing: "-0.5px",
      }}
    >
      {getInitials(provider)}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────────
function StatCard({
  icon, value, label, colorClass, delay = 0,
}: {
  icon: string; value: number; label: string; colorClass: string; delay?: number;
}) {
  return (
    <div
      className="animate-fade-up card p-5 flex flex-col gap-3 cursor-default group"
      style={{
        animationDelay: `${delay}ms`,
        background: "var(--bg-surface)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
      >
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-black tabular-nums ${colorClass}`}>
          <CountUp end={value} duration={1.5} separator="," />
        </div>
        <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 flex gap-4"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="w-7 h-5 rounded animate-shimmer" />
      <div className="w-9 h-9 rounded-xl animate-shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 rounded animate-shimmer w-2/5" />
        <div className="h-3 rounded animate-shimmer w-3/4" />
        <div className="h-3 rounded animate-shimmer w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-14 rounded-full animate-shimmer" />
          <div className="h-5 w-16 rounded-full animate-shimmer" />
        </div>
      </div>
      <div className="w-28 space-y-3 hidden sm:flex flex-col justify-center">
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-full rounded animate-shimmer" />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

// ── Custom Chart Tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-medium"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
        {label ?? payload[0].name}
      </p>
      <p style={{ color: "var(--accent-primary)" }}>{payload[0].value} models</p>
    </div>
  );
}

// ── Model Card ───────────────────────────────────────────────────────────────────
function ModelCard({ model, rank, animDelay = 0 }: { model: Model; rank: number; animDelay?: number }) {
  const [expanded, setExpanded] = useState(false);
  const providerColor = getProviderColor(model.provider);

  return (
    <div
      className="animate-fade-up rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${expanded ? "rgba(99,102,241,0.35)" : "var(--border-subtle)"}`,
        transition: "all 0.2s ease",
        animationDelay: `${animDelay}ms`,
        boxShadow: expanded ? "0 4px 20px rgba(99,102,241,0.1)" : undefined,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-4 items-start group hover:bg-white/[0.02] transition-colors">
        {/* Rank */}
        <span
          className="text-xl font-black w-6 shrink-0 pt-1 tabular-nums"
          style={{ color: rank <= 3 ? "var(--accent-primary)" : "var(--border-subtle)" }}
        >
          {rank}
        </span>

        {/* Avatar */}
        <ProviderAvatar provider={model.provider} />

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {model.name}
            </h3>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{
                background: `${providerColor}18`,
                color: providerColor,
                border: `1px solid ${providerColor}30`,
              }}
            >
              {model.provider}
            </span>
            {model.badge && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  color: "#F59E0B",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                {model.badge}
              </span>
            )}
            {model.isFree && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10B981",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                FREE
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {model.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {model.tags.map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        {/* Pricing Grid */}
        <div
          className="hidden sm:grid grid-cols-3 gap-x-4 shrink-0 border-l pl-4 my-auto"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {[
            { lbl: "CONTEXT",    val: model.context },
            { lbl: "INPUT/1M",   val: fmtPrice(model.promptPricePer1M) },
            { lbl: "OUTPUT/1M",  val: fmtPrice(model.completionPricePer1M) },
          ].map(({ lbl, val }) => (
            <div key={lbl} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                {lbl}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                {val}
              </span>
            </div>
          ))}
          <div className="col-span-3 mt-3">
            <a
              href={`https://openrouter.ai/${model.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-all"
              style={{
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#A5B4FC",
                background: "rgba(99,102,241,0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)";
              }}
            >
              Details →
            </a>
          </div>
        </div>

        {/* Expand chevron */}
        <div
          className="shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          className="px-5 pb-5 animate-fade-in"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Full Description
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {model.description || "No description available."}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Model Details
              </p>
              {[
                { k: "Modality",      v: model.modality || "Text" },
                { k: "Context Window", v: model.context },
                { k: "Input Price",   v: fmtPrice(model.promptPricePer1M) + " / 1M tokens" },
                { k: "Output Price",  v: fmtPrice(model.completionPricePer1M) + " / 1M tokens" },
                { k: "Added",         v: model.createdAt ? new Date(model.createdAt).toLocaleDateString() : "N/A" },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{v}</span>
                </div>
              ))}
              <a
                href={`https://openrouter.ai/${model.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: "var(--accent-primary)",
                  color: "white",
                }}
              >
                View on OpenRouter ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AIModelsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "popular" | "trending">("popular");
  const [maxPrice, setMaxPrice] = useState(100);
  const [contextFilters, setContextFilters] = useState<string[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async (showRefreshToast = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-models");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
      if (showRefreshToast) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadData]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Back to top
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const sourceModels = !data ? [] :
    activeTab === "popular"  ? data.popular :
    activeTab === "trending" ? data.trending : data.all;

  const displayed = sourceModels
    .filter(m => {
      const q = search.toLowerCase();
      if (q && !m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) return false;
      if (activeCategory !== "All" && !m.tags.includes(activeCategory)) return false;
      if (m.promptPricePer1M > maxPrice) return false;
      if (contextFilters.length > 0) {
        const matchesCtx = contextFilters.some(lbl => {
          const f = CONTEXT_FILTERS.find(c => c.label === lbl)!;
          const min = CONTEXT_FILTERS[CONTEXT_FILTERS.indexOf(f) - 1]?.max ?? 0;
          return f.max === Infinity
            ? m.contextRaw > 128_000
            : m.contextRaw > min && m.contextRaw <= f.max;
        });
        if (!matchesCtx) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular")  return (a.popularityRank ?? 999) - (b.popularityRank ?? 999);
      if (sortBy === "trending") return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      if (sortBy === "newest")   return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      if (sortBy === "cheapest") return a.promptPricePer1M - b.promptPricePer1M;
      if (sortBy === "ctx")      return b.contextRaw - a.contextRaw;
      return 0;
    });

  const freeCount     = data?.all.filter(m => m.isFree).length ?? 0;
  const multiCount    = data?.all.filter(m => m.inputModalities.length > 1).length ?? 0;
  const providerCount = data?.charts.providerDistribution.length ?? 0;
  const avgPrice      = data
    ? data.all.reduce((s, m) => s + m.promptPricePer1M, 0) / data.all.length
    : 0;

  const toggleContextFilter = (lbl: string) => {
    setContextFilters(prev =>
      prev.includes(lbl) ? prev.filter(x => x !== lbl) : [...prev, lbl]
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>

      {/* ── HERO ── */}
      <section
        className="hero-gradient relative overflow-hidden pb-16 pt-12 px-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {/* grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative container mx-auto max-w-6xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "#10B981" }} />
            <span className="text-xs font-semibold" style={{ color: "#10B981" }}>
              Live data from OpenRouter · Updated every 5 minutes
            </span>
          </div>

          <h1
            className="font-black tracking-tight leading-none"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text-primary)" }}
          >
            AI Model{" "}
            <span className="gradient-text">Intelligence Hub</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Discover, compare, and choose from {data?.total ?? "hundreds of"} AI models
            based on real-world usage, pricing, and capabilities.
          </p>

          {/* ── Stat Cards ── */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8 text-left">
              <StatCard icon="🧠" value={data.total}    label="Total Models"  colorClass="gradient-text" delay={0}   />
              <StatCard icon="🏢" value={providerCount}  label="Providers"     colorClass="gradient-text" delay={100} />
              <StatCard icon="🆓" value={freeCount}      label="Free Models"   colorClass="gradient-text" delay={200} />
              <StatCard icon="🎨" value={multiCount}     label="Multimodal"    colorClass="gradient-text" delay={300} />
            </div>
          )}

          {/* Skeleton stat cards while loading */}
          {loading && !data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="w-9 h-9 rounded-lg animate-shimmer" />
                  <div className="h-8 rounded animate-shimmer w-2/3" />
                  <div className="h-3 rounded animate-shimmer w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-10">

        {/* ── CHARTS ROW ── */}
        {data && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Provider Donut */}
            <div className="card p-6 animate-fade-up stagger-1 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Models by Provider
                </h3>
                <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
                  {providerCount} providers
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.charts.providerDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {data.charts.providerDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={(v) => (
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{v}</span>
                    )}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Price Distribution */}
            <div className="card p-6 animate-fade-up stagger-2 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Price Distribution
                </h3>
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Input per 1M tokens
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.charts.priceDistribution} barCategoryGap="30%">
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={avgPrice}
                    stroke="rgba(99,102,241,0.4)"
                    strokeDasharray="3 3"
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366F1">
                    {data.charts.priceDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Context Sizes */}
            <div className="card p-6 animate-fade-up stagger-3 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Context Window Sizes
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.charts.contextDistribution} barCategoryGap="30%">
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.charts.contextDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`hsl(${200 + i * 20}, 80%, ${55 + i * 3}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── BROWSE SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── SIDEBAR ── */}
          <aside className="space-y-6 lg:col-span-1">

            {/* Category Filters */}
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Categories
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {CATEGORIES.map(cat => {
                  const count = data
                    ? cat.key === "All"
                      ? data.all.length
                      : data.all.filter(m => m.tags.includes(cat.key)).length
                    : 0;
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className="flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-all w-full text-left"
                      style={{
                        background: isActive ? "var(--accent-primary)" : "transparent",
                        color: isActive ? "white" : "var(--text-muted)",
                        border: isActive ? "1px solid transparent" : "1px solid var(--border-subtle)",
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "var(--border-subtle)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                      {data && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{
                            background: isActive ? "rgba(255,255,255,0.2)" : "var(--border-subtle)",
                            color: isActive ? "white" : "var(--text-muted)",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Price Range (per 1M tokens)
              </h3>
              <input
                type="range"
                min={0}
                max={100}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span>$0</span>
                <span className="font-bold" style={{ color: "var(--accent-primary)" }}>
                  Up to ${maxPrice === 100 ? "100+" : `$${maxPrice}`}
                </span>
                <span>$100+</span>
              </div>
            </div>

            {/* Context Window Filter */}
            <div>
              <h3 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Context Window
              </h3>
              <div className="space-y-2">
                {CONTEXT_FILTERS.map(f => {
                  const checked = contextFilters.includes(f.label);
                  return (
                    <button
                      key={f.label}
                      onClick={() => toggleContextFilter(f.label)}
                      className="flex items-center gap-2.5 w-full text-left text-xs transition-all"
                      style={{ color: checked ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                      <span
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: checked ? "var(--accent-primary)" : "transparent",
                          border: `1px solid ${checked ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                        }}
                      >
                        {checked && <span className="text-white text-[8px]">✓</span>}
                      </span>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info card */}
            <div
              className="rounded-xl p-4 hidden lg:block"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <p className="text-xs font-bold mb-1.5" style={{ color: "#A5B4FC" }}>
                Why model discovery?
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                The LLM landscape shifts weekly. We surface live OpenRouter data so
                you can pick the model that fits your task — coding, agents, RAG, or multimodal.
              </p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0" }}>
              {(["popular", "trending", "all"] as const).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-4 py-2.5 text-xs font-semibold capitalize transition-all"
                    style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                    }}
                  >
                    {tab === "popular" ? "🏆 Popular" : tab === "trending" ? "🔥 Trending" : "All Models"}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
                        style={{ background: "var(--accent-primary)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Sort */}
            <div
              className="rounded-xl p-3 flex flex-col sm:flex-row gap-3"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
            >
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "var(--text-muted)" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search models or providers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-16 py-2 text-xs rounded-lg outline-none transition-all font-medium"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                />
                <kbd
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--border-subtle)",
                    color: "var(--text-muted)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  ⌘K
                </kbd>
              </div>

              {/* Sort pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
                {SORT_OPTIONS.map(s => {
                  const isActive = sortBy === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className="shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all"
                      style={{
                        background: isActive ? "var(--accent-primary)" : "transparent",
                        color: isActive ? "white" : "var(--text-muted)",
                        border: isActive ? "1px solid transparent" : "1px solid var(--border-subtle)",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                {activeCategory === "All" ? "All Models" : `${activeCategory} Models`}
              </h2>
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {displayed.length} results
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <p className="font-semibold text-sm" style={{ color: "#F87171" }}>{error}</p>
                <button
                  onClick={() => loadData()}
                  className="mt-3 text-xs underline"
                  style={{ color: "#F87171" }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && <Skeleton />}

            {/* Model list */}
            {!loading && !error && (
              <div className="space-y-3">
                {displayed.map((m, i) => (
                  <ModelCard
                    key={m.id}
                    model={m}
                    rank={i + 1}
                    animDelay={Math.min(i * 40, 400)}
                  />
                ))}

                {displayed.length === 0 && (
                  <div
                    className="py-24 text-center rounded-xl"
                    style={{ border: "2px dashed var(--border-subtle)" }}
                  >
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="font-semibold text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      No models match your filters
                    </p>
                    <button
                      onClick={() => { setSearch(""); setActiveCategory("All"); setContextFilters([]); setMaxPrice(100); }}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      Clear all filters →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── COMPARE CTA ── */}
        <section
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div
            className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "var(--accent-primary)", filter: "blur(40px)" }}
          />
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Head-to-Head Model Comparison
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Pit any two models against each other on pricing, context, and capabilities.
            </p>
          </div>
          <a
            href="https://openrouter.ai/comparisons"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{
              background: "var(--accent-primary)",
              color: "white",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            Compare on OpenRouter →
          </a>
        </section>

      </main>

      {/* ── Toast ── */}
      {showToast && (
        <div className="toast">
          <span style={{ color: "#10B981" }}>✓</span> Data refreshed
        </div>
      )}

      {/* ── Back to Top ── */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ color: "var(--text-muted)" }}
        >
          ↑
        </button>
      )}
    </div>
  );
}
