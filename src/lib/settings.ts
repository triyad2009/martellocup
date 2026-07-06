import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeMode = "classic" | "tide";

export type TournamentSettings = {
  id: string;
  season_name: string;
  tagline: string;
  location: string;
  tournament_start: string;
  hero_logo_url: string | null;
  theme_mode: ThemeMode;
};

// Classic red logo (original)
export const CLASSIC_LOGO_URL =
  "https://i.postimg.cc/sxgdMH6c/FB-IMG-1776993011009.jpg";

// The Tenth Tide — Season 10 official logo
export const TIDE_LOGO_URL =
  "https://i.postimg.cc/JhvWD0D6/IMG-20260706-WA0009.jpg";

// Fallback logo for SSR / first render before settings load
export const DEFAULT_LOGO_URL = CLASSIC_LOGO_URL;

export function useTournamentSettings() {
  const [settings, setSettings] = useState<TournamentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("tournament_settings")
        .select("id, season_name, tagline, location, tournament_start, hero_logo_url, theme_mode")
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setSettings(data as TournamentSettings | null);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel(`settings-watch-${Math.random().toString(36).slice(2)}`)
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

// Site-wide logo — admin-controlled. When Tide theme is active and no explicit
// logo override is set, the Tenth Tide logo is used automatically.
export function useSiteLogo(): string {
  const { settings } = useTournamentSettings();
  if (settings?.hero_logo_url) return settings.hero_logo_url;
  if (settings?.theme_mode === "tide") return TIDE_LOGO_URL;
  return DEFAULT_LOGO_URL;
}

/** Applies the selected theme mode to <html> so CSS overrides can react. */
export function ThemeApplier() {
  const { settings } = useTournamentSettings();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const mode = settings?.theme_mode ?? "classic";
    const root = document.documentElement;
    root.classList.toggle("theme-tide", mode === "tide");
  }, [settings?.theme_mode]);
  return null;
}
