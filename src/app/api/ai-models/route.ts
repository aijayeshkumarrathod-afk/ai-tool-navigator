import { NextResponse } from "next/server";

// Maps model ID substrings → category tags
const CATEGORY_RULES: Array<{ match: string[]; tags: string[] }> = [
  { match: ["claude", "gpt", "gemini", "mistral", "llama", "qwen", "deepseek", "command", "nova"], tags: ["Chat"] },
  { match: ["codestral", "coder", "code", "deepseek-coder", "qwen-coder", "starcoder"], tags: ["Coding"] },
  { match: ["claude-3", "gpt-4", "o1", "o3", "deepseek-r1", "qwq", "gemini-2.0-flash-thinking", "sonar-reasoning"], tags: ["Reasoning"] },
  { match: ["vision", "pixtral", "llava", "minicpm-v", "qwen2-vl", "image", "omni", "vl"], tags: ["Image / Multimodal"] },
  { match: ["gemini", "claude-3", "gpt-4o", "sonar", "perplexity", "command"], tags: ["Research"] },
  { match: ["claude", "gpt-4", "mistral-large", "llama-3", "qwen"], tags: ["Agents / Automation"] },
  { match: ["claude", "gpt-4o", "mistral", "gemini"], tags: ["Writing"] },
];

function categorizeTags(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const tags = new Set<string>();
  for (const rule of CATEGORY_RULES) {
    if (rule.match.some(kw => id.includes(kw))) {
      rule.tags.forEach(t => tags.add(t));
    }
  }
  if (tags.size === 0) tags.add("Chat");
  return Array.from(tags);
}

// Known popular model IDs (ordered by real-world usage popularity)
const POPULAR_SLUGS = [
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.1-405b-instruct",
  "anthropic/claude-3-haiku",
  "openai/gpt-4o-mini",
  "deepseek/deepseek-r1",
  "google/gemini-2.0-flash-001",
  "mistralai/mistral-large",
  "qwen/qwen-2.5-72b-instruct",
  "anthropic/claude-3.5-haiku",
  "openai/o3-mini",
  "meta-llama/llama-3.3-70b-instruct",
  "mistralai/codestral-2501",
  "google/gemini-pro-1.5",
];

const TRENDING_SLUGS = [
  "deepseek/deepseek-r1",
  "openai/o3-mini",
  "google/gemini-2.0-flash-001",
  "anthropic/claude-3.5-haiku",
  "meta-llama/llama-3.3-70b-instruct",
  "mistralai/codestral-2501",
  "qwen/qwen-2.5-72b-instruct",
  "anthropic/claude-3.7-sonnet",
  "openai/gpt-4o-mini",
  "mistralai/mixtral-8x22b-instruct",
];

function badgeFor(slug: string, idx: number): string | null {
  if (idx === 0) return "🏆 #1 Popular";
  if (TRENDING_SLUGS.includes(slug)) return "🔥 Trending";
  if (slug.includes("free")) return "Free";
  if (slug.includes("deepseek") && slug.includes("r1")) return "🔥 Hot";
  return null;
}

function pricePer1M(raw: string | undefined): number {
  if (!raw || raw === "0") return 0;
  return parseFloat(raw) * 1_000_000;
}

function formatCtx(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

function providerName(id: string): string {
  const prefix = id.split("/")[0];
  const MAP: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    "meta-llama": "Meta",
    mistralai: "Mistral AI",
    deepseek: "DeepSeek",
    qwen: "Qwen / Alibaba",
    cohere: "Cohere",
    "01-ai": "01 AI",
    "microsoft": "Microsoft",
    perplexity: "Perplexity",
    "nous": "Nous Research",
    "nousresearch": "Nous Research",
  };
  return MAP[prefix] ?? prefix.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "User-Agent": "AI-Navigator/1.0" },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) throw new Error(`OpenRouter API: ${res.status}`);

    const json = await res.json();
    const raw: any[] = json.data ?? [];

    // Enrich and shape data
    const enriched = raw.map((m: any) => {
      const slug = m.canonical_slug ?? m.id;
      const popularIdx = POPULAR_SLUGS.indexOf(slug);
      const isTrending = TRENDING_SLUGS.includes(slug);

      return {
        id: m.id,
        slug,
        name: m.name?.replace(/^[^:]+:\s*/, "") ?? slug, // strip "Provider: " prefix
        provider: providerName(m.id),
        description: m.description ?? "",
        context: formatCtx(m.context_length ?? 0),
        contextRaw: m.context_length ?? 0,
        modality: m.architecture?.modality ?? "text->text",
        inputModalities: m.architecture?.input_modalities ?? ["text"],
        promptPricePer1M: pricePer1M(m.pricing?.prompt),
        completionPricePer1M: pricePer1M(m.pricing?.completion),
        isFree: pricePer1M(m.pricing?.prompt) === 0 && pricePer1M(m.pricing?.completion) === 0,
        createdAt: m.created ? new Date(m.created * 1000).toISOString() : null,
        tags: categorizeTags(m.id),
        popularityRank: popularIdx >= 0 ? popularIdx + 1 : null,
        isTrending,
        badge: badgeFor(slug, popularIdx),
        isPopular: popularIdx >= 0,
      };
    });

    // Sort: popular first, then trending, then by newest
    const popular = POPULAR_SLUGS
      .map(slug => enriched.find(m => m.slug === slug))
      .filter(Boolean);

    const trending = TRENDING_SLUGS
      .map(slug => enriched.find(m => m.slug === slug))
      .filter((m): m is NonNullable<typeof m> => !!m && !POPULAR_SLUGS.includes(m.slug));

    const rest = enriched
      .filter(m => !POPULAR_SLUGS.includes(m.slug) && !TRENDING_SLUGS.includes(m.slug))
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    const allModels = [...popular, ...rest];

    // Provider distribution (for chart)
    const providerCounts: Record<string, number> = {};
    for (const m of enriched) {
      providerCounts[m.provider] = (providerCounts[m.provider] ?? 0) + 1;
    }
    const providerChart = Object.entries(providerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Price distribution buckets (for chart)
    const priceBuckets = [
      { label: "Free", min: 0, max: 0 },
      { label: "<$1", min: 0.001, max: 1 },
      { label: "$1–$5", min: 1, max: 5 },
      { label: "$5–$15", min: 5, max: 15 },
      { label: ">$15", min: 15, max: Infinity },
    ];
    const priceChart = priceBuckets.map(b => ({
      label: b.label,
      count: enriched.filter(m =>
        b.min === 0 && b.max === 0
          ? m.isFree
          : m.promptPricePer1M > b.min && m.promptPricePer1M <= b.max
      ).length,
    }));

    // Context length distribution
    const ctxBuckets = [
      { label: "≤8K", max: 8192 },
      { label: "16K", max: 16384 },
      { label: "32K", max: 32768 },
      { label: "128K", max: 131072 },
      { label: "200K+", max: Infinity },
    ];
    const ctxChart = ctxBuckets.map((b, i) => ({
      label: b.label,
      count: enriched.filter(m => {
        const prev = i === 0 ? 0 : ctxBuckets[i - 1].max;
        return m.contextRaw > prev && m.contextRaw <= b.max;
      }).length,
    }));

    return NextResponse.json({
      total: enriched.length,
      popular: popular.slice(0, 10),
      trending: trending.slice(0, 8),
      all: allModels,
      charts: {
        providerDistribution: providerChart,
        priceDistribution: priceChart,
        contextDistribution: ctxChart,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
