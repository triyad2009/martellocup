import { createServerFn } from "@tanstack/react-start";

// TheSportsDB free API — World Cup events
const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const WORLD_CUP_LEAGUE_ID = "4429"; // FIFA World Cup

export type WCMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_badge?: string | null;
  away_badge?: string | null;
  home_score: number | null;
  away_score: number | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  status: string | null;
  round: string | null;
  is_live: boolean;
};

function mapEvent(e: any): WCMatch {
  const status = (e.strStatus || e.strPostponed || "").toString();
  const isLive =
    /1H|2H|HT|LIVE|IN PLAY|ET|PEN/i.test(status) ||
    (e.intHomeScore != null && e.strStatus !== "Match Finished");
  return {
    id: String(e.idEvent),
    home_team: e.strHomeTeam,
    away_team: e.strAwayTeam,
    home_badge: e.strHomeTeamBadge || null,
    away_badge: e.strAwayTeamBadge || null,
    home_score: e.intHomeScore != null ? Number(e.intHomeScore) : null,
    away_score: e.intAwayScore != null ? Number(e.intAwayScore) : null,
    date: e.dateEvent || null,
    time: e.strTime || null,
    venue: e.strVenue || null,
    status: e.strStatus || null,
    round: e.intRound ? `Round ${e.intRound}` : e.strSeason || null,
    is_live: isLive,
  };
}

export const getWorldCupFixtures = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      // Try latest season
      const seasons = ["2026", "2022", "2018"];
      for (const s of seasons) {
        const res = await fetch(
          `${API_BASE}/eventsseason.php?id=${WORLD_CUP_LEAGUE_ID}&s=${s}`,
        );
        if (!res.ok) continue;
        const data = (await res.json()) as { events?: any[] };
        if (data.events && data.events.length > 0) {
          return {
            season: s,
            matches: data.events.map(mapEvent),
            error: null as string | null,
          };
        }
      }
      return { season: null, matches: [], error: "no_data" };
    } catch (err) {
      console.error("getWorldCupFixtures failed", err);
      return { season: null, matches: [], error: "fetch_failed" };
    }
  },
);

export const getLiveWorldCupScores = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const res = await fetch(`${API_BASE}/eventslive.php?s=Soccer`);
      if (!res.ok) return { matches: [] as WCMatch[] };
      const data = (await res.json()) as { events?: any[] | null };
      const events = data.events || [];
      const wc = events
        .filter((e) => String(e.idLeague) === WORLD_CUP_LEAGUE_ID)
        .map(mapEvent);
      return { matches: wc };
    } catch (err) {
      console.error("getLiveWorldCupScores failed", err);
      return { matches: [] as WCMatch[] };
    }
  },
);
