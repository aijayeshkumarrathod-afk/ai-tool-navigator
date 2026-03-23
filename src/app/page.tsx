"use client";

import { useState } from "react";
import { UseCaseSearchBox } from "@/components/search/UseCaseSearchBox";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolRecommendation } from "@/lib/openrouter";

interface SearchResults {
  recommendations: ToolRecommendation[];
}

const QUICK_CHIPS = [
  { icon: "💻", label: "Coding",       href: "/ai-models" },
  { icon: "✍️", label: "Writing",      href: "/ai-models" },
  { icon: "🔬", label: "Research",     href: "/ai-models" },
  { icon: "💬", label: "Chat",         href: "/ai-models" },
  { icon: "🤖", label: "Agents",       href: "/ai-models" },
  { icon: "🎨", label: "Image Gen",    href: "/ai-models" },
];

const FEATURED_MODELS = [
  { name: "GPT-4o",            provider: "OpenAI",    tag: "Multimodal",  color: "#10A37F" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", tag: "Reasoning",   color: "#E97D3A" },
  { name: "Gemini 1.5 Pro",    provider: "Google",    tag: "Large Context",color: "#4285F4" },
  { name: "DeepSeek-V3",       provider: "DeepSeek",  tag: "Coding",      color: "#06B6D4" },
  { name: "Llama 3.1 405B",    provider: "Meta",      tag: "Open Source", color: "#0082FB" },
];

export default function Home() {
  const [results, setResults] = useState<SearchResults | null>(null);

  const handleResults = (newResults: SearchResults | null) => {
    setResults(newResults);
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">

        {/* ── HERO ── */}
        <header className="text-center mb-12 space-y-5 animate-fade-up">
          {/* Eyebrow tag */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent-primary)" }}
            />
            <span className="text-xs font-semibold" style={{ color: "#A5B4FC" }}>
              Powered by OpenRouter · 300+ AI models
            </span>
          </div>

          <h1
            className="font-black tracking-tight leading-none"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "var(--text-primary)" }}
          >
            Find the Best AI Tool<br />
            <span className="gradient-text">for Any Use Case</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Describe what you want to do. Get expert recommendations backed by
            real-world capabilities and live web context.
          </p>
        </header>

        {/* ── SEARCH BOX ── */}
        <section className="mb-10 animate-fade-up stagger-2">
          <UseCaseSearchBox onResults={handleResults} />
        </section>

        {/* ── QUICK CHIP ROW ── */}
        {!results && (
          <div className="flex flex-wrap gap-2 justify-center mb-16 animate-fade-up stagger-3">
            {QUICK_CHIPS.map((chip) => (
              <a
                key={chip.label}
                href={chip.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                }}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </a>
            ))}
          </div>
        )}

        {/* ── SEARCH RESULTS ── */}
        {results && (
          <section className="space-y-6 animate-fade-up">
            <div className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Top Recommendations
              </h2>
              <button
                onClick={() => setResults(null)}
                className="text-xs font-semibold transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← New Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.recommendations.map((tool, index) => (
                <ToolCard
                  key={index}
                  name={tool.name}
                  reason={tool.reason}
                  quality_note={tool.quality_note}
                  url={tool.url}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM SECTIONS (only shown when no results) ── */}
        {!results && (
          <div className="space-y-8">

            {/* AI Models CTA */}
            <section
              className="relative rounded-2xl p-8 overflow-hidden animate-fade-up stagger-4"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 100%)",
                border: "1px solid rgba(99,102,241,0.18)",
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                style={{ background: "var(--accent-primary)", filter: "blur(40px)" }}
              />
              <div
                className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
                style={{ background: "var(--accent-secondary)", filter: "blur(40px)" }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ background: "rgba(99,102,241,0.15)", color: "#A5B4FC" }}
                  >
                    ⚡ NEW
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    Explore AI Model Rankings
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Live stats, pricing, and discovery powered by OpenRouter&apos;s ecosystem
                  </p>
                </div>

                <a
                  href="/ai-models"
                  className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    background: "var(--accent-primary)",
                    color: "white",
                    textDecoration: "none",
                    boxShadow: "0 0 20px rgba(99,102,241,0.25)",
                  }}
                >
                  See Rankings & Browse →
                </a>
              </div>

              {/* Trending mini-cards */}
              <div className="relative z-10 mt-6 flex gap-3 overflow-x-auto pb-1">
                {FEATURED_MODELS.map((m) => (
                  <div
                    key={m.name}
                    className="shrink-0 rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all hover:-translate-y-0.5"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      minWidth: "160px",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                      style={{ background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}33` }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                        {m.name}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Category browser */}
            <section className="animate-fade-up stagger-5">
              <div className="text-center mb-5">
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Or browse AI tools by category
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  Explore applications manually
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Coding", "Writing", "Presentations", "Image Gen", "Video", "Research", "Social Media", "Automation"].map((cat) => (
                  <div
                    key={cat}
                    className="flex flex-col items-center justify-center p-5 rounded-xl transition-all cursor-not-allowed"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{cat}</span>
                    <span className="text-[10px] mt-1 px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--border-subtle)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Coming soon
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
