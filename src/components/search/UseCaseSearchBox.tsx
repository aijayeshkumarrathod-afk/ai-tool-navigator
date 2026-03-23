"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { ToolRecommendation } from "@/lib/openrouter";

interface SearchResults {
  recommendations: ToolRecommendation[];
}

const ANIMATED_PLACEHOLDERS = [
  "I want to write code...",
  "I want to generate images...",
  "I want to summarize research papers...",
  "I want to build an AI agent...",
  "I want to create a pitch deck...",
  "I want to chat with AI...",
  "I want to analyze data...",
];

export function UseCaseSearchBox({ onResults }: { onResults: (results: SearchResults | null) => void }) {
  const [useCase, setUseCase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through animated placeholders
  useEffect(() => {
    if (isFocused || useCase) return;
    const id = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % ANIMATED_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(id);
  }, [isFocused, useCase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useCase.trim()) return;

    setIsLoading(true);
    setError(null);
    onResults(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to fetch recommendations");
      onResults(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const tryExample = (text: string) => {
    setUseCase(text);
    inputRef.current?.focus();
  };

  const examples = [
    "Make a pitch deck",
    "Write a React component",
    "Summarize a research paper",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Search
            className="h-5 w-5 transition-colors"
            style={{ color: isFocused ? "var(--accent-primary)" : "var(--text-muted)" }}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder={ANIMATED_PLACEHOLDERS[placeholderIdx]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          style={{
            width: "100%",
            paddingLeft: "3rem",
            paddingRight: "9rem",
            paddingTop: "1rem",
            paddingBottom: "1rem",
            fontSize: "1rem",
            background: "var(--bg-surface)",
            border: `2px solid ${isFocused ? "var(--accent-primary)" : "var(--border-subtle)"}`,
            borderRadius: "14px",
            color: "var(--text-primary)",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: isFocused ? "0 0 0 4px rgba(99,102,241,0.1)" : undefined,
          }}
        />

        <div className="absolute inset-y-2 right-2 flex items-center">
          <button
            type="submit"
            disabled={isLoading || !useCase.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isLoading || !useCase.trim() ? "not-allowed" : "pointer",
              background: isLoading || !useCase.trim()
                ? "var(--border-subtle)"
                : "var(--accent-primary)",
              color: isLoading || !useCase.trim() ? "var(--text-muted)" : "white",
              border: "none",
              transition: "all 0.2s ease",
              gap: "8px",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-3.5 w-3.5" />
                Searching...
              </>
            ) : (
              "Find Tools"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl text-sm flex items-start gap-3"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#F87171",
          }}
        >
          <span className="font-bold shrink-0">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Example suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Try:</span>
        {examples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tryExample(ex)}
            className="text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <span
              style={{
                textDecoration: "underline",
                textDecorationColor: "var(--border-subtle)",
                textUnderlineOffset: "3px",
              }}
            >
              {ex}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
