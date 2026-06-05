import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getLiveWorldCupScores } from "@/lib/fifa.functions";
import { Link } from "@tanstack/react-router";

/** Polls live World Cup scores in the background and pops a toast when a score changes. */
export function LiveScoreWatcher() {
  const lastScores = useRef<Record<string, string>>({});

  const { data } = useQuery({
    queryKey: ["wc-live-watcher"],
    queryFn: () => getLiveWorldCupScores(),
    refetchInterval: 45000,
    refetchIntervalInBackground: true,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!data?.matches?.length) return;
    for (const m of data.matches) {
      const key = `${m.home_score ?? 0}-${m.away_score ?? 0}`;
      const prev = lastScores.current[m.id];
      if (prev && prev !== key) {
        // Score changed — notify
        try {
          new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play().catch(() => {});
        } catch {}
        toast(
          `⚽ ${m.home_team} ${m.home_score} - ${m.away_score} ${m.away_team}`,
          {
            description: "FIFA World Cup • LIVE",
            duration: 8000,
            action: { label: "View", onClick: () => (window.location.href = "/fifa") },
          },
        );
      }
      lastScores.current[m.id] = key;
    }
  }, [data]);

  // Show subtle indicator if any live match exists
  if (!data?.matches?.length) return null;

  return (
    <Link
      to="/fifa"
      className="fixed bottom-20 left-3 z-40 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg animate-pulse"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      {data.matches.length} LIVE
    </Link>
  );
}
