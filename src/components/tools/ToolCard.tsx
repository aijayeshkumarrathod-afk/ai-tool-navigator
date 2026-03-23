import { ExternalLink } from "lucide-react"

export interface ToolCardProps {
  name: string
  reason: string
  quality_note: string
  url: string
}

export function ToolCard({ name, reason, quality_note, url }: ToolCardProps) {
  return (
    <div
      className="flex flex-col rounded-xl group transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.35)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Tool initial avatar */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0 text-white"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <h3
              className="text-base font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </h3>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-all"
            style={{
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#A5B4FC",
              background: "rgba(99,102,241,0.05)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)";
            }}
          >
            Visit
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 space-y-3 flex-1">
        <div>
          <h4
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Why it&apos;s best
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {reason}
          </p>
        </div>
        <div>
          <h4
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Output Quality
          </h4>
          <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
            {quality_note}
          </p>
        </div>
      </div>
    </div>
  )
}
