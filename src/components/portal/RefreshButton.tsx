"use client";

import { useState } from "react";

export function RefreshButton({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={busy}
        className={
          compact
            ? "inline-flex items-center border border-gold/50 px-3 py-2 text-xs font-medium text-gold transition hover:bg-gold hover:text-navy-deep disabled:opacity-50"
            : "inline-flex items-center border border-navy/20 bg-navy px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-indigo disabled:opacity-50"
        }
      >
        {busy ? "Refreshing…" : "Refresh"}
      </button>
      {error ? <span className="text-[11px] text-red-700">{error}</span> : null}
    </span>
  );
}
