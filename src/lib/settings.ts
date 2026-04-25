import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TournamentSettings = {
  id: string;
  season_name: string;
  tagline: string;
  location: string;
  tournament_start: string;
  hero_logo_url: string | null;
};

export function useTournamentSettings() {
  const [settings, setSettings] = useState<TournamentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("tournament_settings")
        .select("id, season_name, tagline, location, tournament_start, hero_logo_url")
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setSettings(data as TournamentSettings | null);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("settings-watch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_settings" },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading };
}
