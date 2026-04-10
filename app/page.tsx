"use client";

import { useState } from "react";
import { AgentRunner } from "@/components/AgentRunner";
import { ToolPanel } from "@/components/ToolPanel";
import type { ParsedToolUse } from "@/lib/stream-parser";

export default function Home() {
  const [toolInvocations, setToolInvocations] = useState<
    ParsedToolUse[]
  >([]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <AgentRunner onToolActivity={setToolInvocations} />
        </div>

        <aside className="hidden lg:flex w-80 xl:w-88 border-l border-(--border) flex-col">
          <ToolPanel invocations={toolInvocations} />
        </aside>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header
      className={[
        "flex items-center justify-between",
        "px-5 py-3 border-b border-(--border)",
        "shrink-0 bg-(--surface)/80 backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--boston-blue)] flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
          </svg>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-(--cream) tracking-tight">
            Boston 311 Hackathon
          </span>
          <span
            className={[
              "text-[10px] text-(--cream)/50 font-medium",
              "bg-(--cream)/5 border border-(--cream)/10",
              "px-2 py-0.5 rounded-full",
            ].join(" ")}
          >
            Powered by Subconscious
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://data.boston.gov/dataset/311-service-requests"
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "text-[11px] text-(--cream)/60",
            "hover:text-[var(--boston-light-blue)] transition-colors",
          ].join(" ")}
        >
          311 Data
        </a>
        <a
          href="https://docs.subconscious.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "text-[11px] text-(--cream)/60",
            "hover:text-[var(--boston-light-blue)] transition-colors",
          ].join(" ")}
        >
          Docs
        </a>
        <a
          href="https://subconscious.dev/platform"
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "text-[11px] text-(--cream)/60",
            "hover:text-[var(--boston-light-blue)] transition-colors",
          ].join(" ")}
        >
          Get API Key
        </a>
      </div>
    </header>
  );
}
