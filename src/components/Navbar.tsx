"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/",          label: "AI Tools"  },
    { href: "/ai-models", label: "AI Models" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #1E1E2E",
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black logo-glow"
            style={{ background: "linear-gradient(135deg, #6366F1, #06B6D4)" }}
          >
            AI
          </div>
          <span className="font-extrabold text-lg tracking-tight gradient-text">
            Navigator
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Live indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full mr-4"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full live-dot"
              style={{ background: "#10B981" }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "#10B981" }}
            >
              LIVE
            </span>
          </div>

          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg"
                style={{ color: isActive ? "#F8FAFC" : "#64748B" }}
              >
                <span>{label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #6366F1, #06B6D4)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
