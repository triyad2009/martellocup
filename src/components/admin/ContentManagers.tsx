import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUpload } from "@/components/MediaUpload";

type Lang = "bn" | "en";
const t = (lang: Lang, bn: string, en: string) => (lang === "bn" ? bn : en);

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`px-3 py-2.5 rounded-lg border border-border bg-background w-full ${p.className ?? ""}`} />
);
const TArea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={`px-3 py-2.5 rounded-lg border border-border bg-background w-full ${p.className ?? ""}`} />
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-card p-5 sm:p-6 space-y-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function useRows(table: string, order = "sort_order", asc = true) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from(table).select("*").order(order, { ascending: asc });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [table]);
  return { rows, loading, reload };
}

async function del(table: string, id: string, reload: () => void, lang: Lang) {
  if (!confirm(t(lang, "নিশ্চিত মুছবেন?", "Delete sure?"))) return;
  const { error } = await (supabase as any).from(table).delete().eq("id", id);
  if (error) toast.error(error.message);
  else { toast.success(t(lang, "মুছে ফেলা হয়েছে", "Deleted")); reload(); }
}

async function patch(table: string, id: string, p: any, reload: () => void) {
  const { error } = await (supabase as any).from(table).update(p).eq("id", id);
  if (error) toast.error(error.message); else reload();
}

/* ===================== HERO STATS ===================== */
export function HeroStatsManager({ lang }: { lang: Lang }) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("hero_stats").select("*").limit(1).maybeSingle();
    setRow(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-10" />;
  if (!row) return <p>No row</p>;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("hero_stats").update({
      teams_count: Number(row.teams_count) || 0,
      matches_count: Number(row.matches_count) || 0,
      goals_count: Number(row.goals_count) || 0,
      players_count: Number(row.players_count) || 0,
    }).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(t(lang, "সেভ হয়েছে", "Saved"));
  };

  return (
    <Section title={t(lang, "হিরো পরিসংখ্যান", "Hero Stats")}>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-sm">{t(lang, "দল", "Teams")}
          <Input type="number" value={row.teams_count} onChange={(e) => setRow({ ...row, teams_count: e.target.value })} />
        </label>
        <label className="block text-sm">{t(lang, "ম্যাচ", "Matches")}
          <Input type="number" value={row.matches_count} onChange={(e) => setRow({ ...row, matches_count: e.target.value })} />
        </label>
        <label className="block text-sm">{t(lang, "গোল", "Goals")}
          <Input type="number" value={row.goals_count} onChange={(e) => setRow({ ...row, goals_count: e.target.value })} />
        </label>
        <label className="block text-sm">{t(lang, "খেলোয়াড়", "Players")}
          <Input type="number" value={row.players_count} onChange={(e) => setRow({ ...row, players_count: e.target.value })} />
        </label>
      </div>
      <button onClick={save} disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-glow-red disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t(lang, "সেভ", "Save")}
      </button>
    </Section>
  );
}

/* ===================== TEAMS ===================== */
export function TeamsManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("teams");
  const [d, setD] = useState({ name_en: "", name_bn: "", coach: "", group_name: "", logo_url: "" });

  const add = async () => {
    if (!d.name_en.trim() || !d.name_bn.trim()) return toast.error(t(lang, "নাম আবশ্যক", "Names required"));
    const { error } = await supabase.from("teams").insert({
      name_en: d.name_en, name_bn: d.name_bn, coach: d.coach || null,
      group_name: d.group_name || null, logo_url: d.logo_url || null, sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ name_en: "", name_bn: "", coach: "", group_name: "", logo_url: "" }); toast.success("Added"); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন দল", "New Team")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Name (EN)" value={d.name_en} onChange={(e) => setD({ ...d, name_en: e.target.value })} />
          <Input placeholder="নাম (BN)" value={d.name_bn} onChange={(e) => setD({ ...d, name_bn: e.target.value })} />
          <Input placeholder={t(lang, "কোচ", "Coach")} value={d.coach} onChange={(e) => setD({ ...d, coach: e.target.value })} />
          <Input placeholder={t(lang, "গ্রুপ (A/B)", "Group (A/B)")} value={d.group_name} onChange={(e) => setD({ ...d, group_name: e.target.value })} />
        </div>
        <MediaUpload value={d.logo_url} onChange={(u) => setD({ ...d, logo_url: u ?? "" })} folder="teams" label={t(lang, "লোগো", "Logo")} />
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>

      <Section title={`${t(lang, "সব দল", "All Teams")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                {r.logo_url ? <img src={r.logo_url} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.name_en} / {r.name_bn}</p>
                  <p className="text-xs text-muted-foreground">{r.coach} · {t(lang, "গ্রুপ", "Group")}: {r.group_name || "-"}</p>
                </div>
                <button onClick={() => del("teams", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== PLAYERS ===================== */
export function PlayersManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("players");
  const [d, setD] = useState({ name: "", team: "", position: "", jersey: "", goals: "", photo_url: "" });

  const add = async () => {
    if (!d.name.trim()) return toast.error(t(lang, "নাম আবশ্যক", "Name required"));
    const { error } = await supabase.from("players").insert({
      name: d.name, team: d.team || null, position: d.position || null,
      jersey: d.jersey ? Number(d.jersey) : null, goals: Number(d.goals) || 0,
      photo_url: d.photo_url || null, sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ name: "", team: "", position: "", jersey: "", goals: "", photo_url: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন খেলোয়াড়", "New Player")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder={t(lang, "নাম", "Name")} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          <Input placeholder={t(lang, "দল", "Team")} value={d.team} onChange={(e) => setD({ ...d, team: e.target.value })} />
          <Input placeholder={t(lang, "পজিশন", "Position")} value={d.position} onChange={(e) => setD({ ...d, position: e.target.value })} />
          <Input placeholder={t(lang, "জার্সি #", "Jersey #")} type="number" value={d.jersey} onChange={(e) => setD({ ...d, jersey: e.target.value })} />
          <Input placeholder={t(lang, "গোল", "Goals")} type="number" value={d.goals} onChange={(e) => setD({ ...d, goals: e.target.value })} />
        </div>
        <MediaUpload value={d.photo_url} onChange={(u) => setD({ ...d, photo_url: u ?? "" })} folder="players" label={t(lang, "ছবি", "Photo")} />
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>

      <Section title={`${t(lang, "সব খেলোয়াড়", "All Players")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="grid sm:grid-cols-2 gap-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                {r.photo_url ? <img src={r.photo_url} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-muted" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">#{r.jersey ?? "-"} {r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.team} · {r.position} · ⚽{r.goals}</p>
                </div>
                <button onClick={() => del("players", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== FIXTURES ===================== */
export function FixturesManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("fixtures", "match_date", true);
  const [d, setD] = useState({ home_team: "", away_team: "", match_date: "", match_time: "", venue: "", round: "", status: "scheduled" });

  const add = async () => {
    if (!d.home_team || !d.away_team || !d.match_date) return toast.error(t(lang, "সব ফিল্ড পূরণ করুন", "Fill required"));
    const { error } = await supabase.from("fixtures").insert({ ...d, sort_order: rows.length });
    if (error) toast.error(error.message);
    else { setD({ home_team: "", away_team: "", match_date: "", match_time: "", venue: "", round: "", status: "scheduled" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন ম্যাচ", "New Fixture")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder={t(lang, "হোম দল", "Home Team")} value={d.home_team} onChange={(e) => setD({ ...d, home_team: e.target.value })} />
          <Input placeholder={t(lang, "অ্যাওয়ে দল", "Away Team")} value={d.away_team} onChange={(e) => setD({ ...d, away_team: e.target.value })} />
          <Input type="date" value={d.match_date} onChange={(e) => setD({ ...d, match_date: e.target.value })} />
          <Input type="time" value={d.match_time} onChange={(e) => setD({ ...d, match_time: e.target.value })} />
          <Input placeholder={t(lang, "ভেন্যু", "Venue")} value={d.venue} onChange={(e) => setD({ ...d, venue: e.target.value })} />
          <Input placeholder={t(lang, "রাউন্ড", "Round")} value={d.round} onChange={(e) => setD({ ...d, round: e.target.value })} />
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>
      <Section title={`${t(lang, "সব ম্যাচ", "All Fixtures")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.home_team} vs {r.away_team}</p>
                  <p className="text-xs text-muted-foreground">{r.match_date} {r.match_time} · {r.venue} · {r.round}</p>
                </div>
                <select value={r.status} onChange={(e) => patch("fixtures", r.id, { status: e.target.value }, reload)} className="text-xs px-2 py-1 rounded border border-border bg-background">
                  <option value="scheduled">scheduled</option>
                  <option value="live">live</option>
                  <option value="completed">completed</option>
                </select>
                <button onClick={() => del("fixtures", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== RESULTS ===================== */
export function ResultsManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("results", "match_date", false);
  const [d, setD] = useState({ home_team: "", away_team: "", home_score: "", away_score: "", match_date: "", scorers: "", motm: "" });

  const add = async () => {
    if (!d.home_team || !d.away_team || !d.match_date) return toast.error(t(lang, "সব ফিল্ড পূরণ করুন", "Fill required"));
    const { error } = await supabase.from("results").insert({
      home_team: d.home_team, away_team: d.away_team,
      home_score: Number(d.home_score) || 0, away_score: Number(d.away_score) || 0,
      match_date: d.match_date, scorers: d.scorers || null, motm: d.motm || null, sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ home_team: "", away_team: "", home_score: "", away_score: "", match_date: "", scorers: "", motm: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন ফলাফল", "New Result")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder={t(lang, "হোম দল", "Home Team")} value={d.home_team} onChange={(e) => setD({ ...d, home_team: e.target.value })} />
          <Input placeholder={t(lang, "অ্যাওয়ে দল", "Away Team")} value={d.away_team} onChange={(e) => setD({ ...d, away_team: e.target.value })} />
          <Input placeholder={t(lang, "হোম স্কোর", "Home Score")} type="number" value={d.home_score} onChange={(e) => setD({ ...d, home_score: e.target.value })} />
          <Input placeholder={t(lang, "অ্যাওয়ে স্কোর", "Away Score")} type="number" value={d.away_score} onChange={(e) => setD({ ...d, away_score: e.target.value })} />
          <Input type="date" value={d.match_date} onChange={(e) => setD({ ...d, match_date: e.target.value })} />
          <Input placeholder={t(lang, "ম্যান অফ দ্য ম্যাচ", "Man of the Match")} value={d.motm} onChange={(e) => setD({ ...d, motm: e.target.value })} />
        </div>
        <Input placeholder={t(lang, "গোলদাতা (কমা দিয়ে)", "Scorers (comma)")} value={d.scorers} onChange={(e) => setD({ ...d, scorers: e.target.value })} />
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>
      <Section title={`${t(lang, "সব ফলাফল", "All Results")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{r.home_team} <span className="text-primary">{r.home_score} - {r.away_score}</span> {r.away_team}</p>
                  <p className="text-xs text-muted-foreground">{r.match_date} · MOTM: {r.motm || "-"}</p>
                </div>
                <button onClick={() => del("results", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== POINTS TABLE ===================== */
export function PointsManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("points_table", "position", true);
  const [d, setD] = useState({ team: "", position: "", played: "", won: "", drawn: "", lost: "", goals_for: "", goals_against: "", points: "" });

  const add = async () => {
    if (!d.team) return toast.error(t(lang, "দল আবশ্যক", "Team required"));
    const num = (v: string) => Number(v) || 0;
    const { error } = await supabase.from("points_table").insert({
      team: d.team, position: num(d.position), played: num(d.played), won: num(d.won),
      drawn: num(d.drawn), lost: num(d.lost), goals_for: num(d.goals_for),
      goals_against: num(d.goals_against), points: num(d.points),
    });
    if (error) toast.error(error.message);
    else { setD({ team: "", position: "", played: "", won: "", drawn: "", lost: "", goals_for: "", goals_against: "", points: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "পয়েন্ট টেবিল এন্ট্রি", "Points Entry")}>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder={t(lang, "দল", "Team")} value={d.team} onChange={(e) => setD({ ...d, team: e.target.value })} />
          <Input placeholder="Pos" type="number" value={d.position} onChange={(e) => setD({ ...d, position: e.target.value })} />
          <Input placeholder="P" type="number" value={d.played} onChange={(e) => setD({ ...d, played: e.target.value })} />
          <Input placeholder="W" type="number" value={d.won} onChange={(e) => setD({ ...d, won: e.target.value })} />
          <Input placeholder="D" type="number" value={d.drawn} onChange={(e) => setD({ ...d, drawn: e.target.value })} />
          <Input placeholder="L" type="number" value={d.lost} onChange={(e) => setD({ ...d, lost: e.target.value })} />
          <Input placeholder="GF" type="number" value={d.goals_for} onChange={(e) => setD({ ...d, goals_for: e.target.value })} />
          <Input placeholder="GA" type="number" value={d.goals_against} onChange={(e) => setD({ ...d, goals_against: e.target.value })} />
          <Input placeholder="Pts" type="number" value={d.points} onChange={(e) => setD({ ...d, points: e.target.value })} />
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>
      <Section title={`${t(lang, "সব এন্ট্রি", "All Entries")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                <span className="font-bold w-6">{r.position}</span>
                <div className="flex-1"><p className="font-semibold">{r.team}</p>
                  <p className="text-xs text-muted-foreground">P{r.played} W{r.won} D{r.drawn} L{r.lost} · GF{r.goals_for}/GA{r.goals_against} · {r.points}pts</p>
                </div>
                <button onClick={() => del("points_table", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== NEWS ===================== */
export function NewsManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("news", "published_date", false);
  const [d, setD] = useState({ title_en: "", title_bn: "", excerpt_en: "", excerpt_bn: "", content_en: "", content_bn: "", category: "", cover_url: "" });

  const add = async () => {
    if (!d.title_en || !d.title_bn) return toast.error(t(lang, "শিরোনাম আবশ্যক", "Titles required"));
    const { error } = await supabase.from("news").insert({
      ...d, category: d.category || null, cover_url: d.cover_url || null,
      excerpt_en: d.excerpt_en || null, excerpt_bn: d.excerpt_bn || null,
      content_en: d.content_en || null, content_bn: d.content_bn || null,
      sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ title_en: "", title_bn: "", excerpt_en: "", excerpt_bn: "", content_en: "", content_bn: "", category: "", cover_url: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন সংবাদ", "New News")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Title (EN)" value={d.title_en} onChange={(e) => setD({ ...d, title_en: e.target.value })} />
          <Input placeholder="শিরোনাম (BN)" value={d.title_bn} onChange={(e) => setD({ ...d, title_bn: e.target.value })} />
          <TArea placeholder="Excerpt (EN)" rows={2} value={d.excerpt_en} onChange={(e) => setD({ ...d, excerpt_en: e.target.value })} />
          <TArea placeholder="সারসংক্ষেপ (BN)" rows={2} value={d.excerpt_bn} onChange={(e) => setD({ ...d, excerpt_bn: e.target.value })} />
          <TArea placeholder="Content (EN)" rows={4} value={d.content_en} onChange={(e) => setD({ ...d, content_en: e.target.value })} />
          <TArea placeholder="বিস্তারিত (BN)" rows={4} value={d.content_bn} onChange={(e) => setD({ ...d, content_bn: e.target.value })} />
          <Input placeholder={t(lang, "ক্যাটাগরি", "Category")} value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} />
        </div>
        <MediaUpload value={d.cover_url} onChange={(u) => setD({ ...d, cover_url: u ?? "" })} folder="news" label={t(lang, "কভার ছবি", "Cover")} />
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "প্রকাশ", "Publish")}
        </button>
      </Section>
      <Section title={`${t(lang, "সব সংবাদ", "All News")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                {r.cover_url ? <img src={r.cover_url} className="h-12 w-16 rounded object-cover" /> : <div className="h-12 w-16 rounded bg-muted" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.title_en}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.title_bn} · {r.published_date}</p>
                </div>
                <label className="inline-flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={r.is_published} onChange={(e) => patch("news", r.id, { is_published: e.target.checked }, reload)} />
                  {t(lang, "প্রকাশিত", "Pub")}
                </label>
                <button onClick={() => del("news", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== GALLERY ===================== */
export function GalleryManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("gallery_images");
  const [d, setD] = useState({ image_url: "", caption_en: "", caption_bn: "" });

  const add = async () => {
    if (!d.image_url) return toast.error(t(lang, "ছবি আবশ্যক", "Image required"));
    const { error } = await supabase.from("gallery_images").insert({
      image_url: d.image_url, caption_en: d.caption_en || null, caption_bn: d.caption_bn || null, sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ image_url: "", caption_en: "", caption_bn: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন ছবি", "New Image")}>
        <MediaUpload value={d.image_url} onChange={(u) => setD({ ...d, image_url: u ?? "" })} folder="gallery" label={t(lang, "ছবি আপলোড", "Upload Image")} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Caption (EN)" value={d.caption_en} onChange={(e) => setD({ ...d, caption_en: e.target.value })} />
          <Input placeholder="ক্যাপশন (BN)" value={d.caption_bn} onChange={(e) => setD({ ...d, caption_bn: e.target.value })} />
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>
      <Section title={`${t(lang, "গ্যালারি", "Gallery")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {rows.map((r) => (
              <div key={r.id} className="relative group rounded-xl overflow-hidden border border-border">
                <img src={r.image_url} className="w-full h-32 object-cover" />
                <button onClick={() => del("gallery_images", r.id, reload, lang)}
                  className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== SPONSORS ===================== */
export function SponsorsManager({ lang }: { lang: Lang }) {
  const { rows, loading, reload } = useRows("sponsors");
  const [d, setD] = useState({ name: "", tier: "gold", logo_url: "", website_url: "" });

  const add = async () => {
    if (!d.name) return toast.error(t(lang, "নাম আবশ্যক", "Name required"));
    const { error } = await supabase.from("sponsors").insert({
      name: d.name, tier: d.tier, logo_url: d.logo_url || null, website_url: d.website_url || null, sort_order: rows.length,
    });
    if (error) toast.error(error.message);
    else { setD({ name: "", tier: "gold", logo_url: "", website_url: "" }); reload(); }
  };

  return (
    <div className="space-y-5">
      <Section title={t(lang, "নতুন স্পন্সর", "New Sponsor")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder={t(lang, "নাম", "Name")} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          <select value={d.tier} onChange={(e) => setD({ ...d, tier: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background">
            <option value="platinum">Platinum</option><option value="gold">Gold</option>
            <option value="silver">Silver</option><option value="bronze">Bronze</option>
          </select>
          <Input placeholder="Website URL" value={d.website_url} onChange={(e) => setD({ ...d, website_url: e.target.value })} />
        </div>
        <MediaUpload value={d.logo_url} onChange={(u) => setD({ ...d, logo_url: u ?? "" })} folder="sponsors" label="Logo" />
        <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>
      <Section title={`${t(lang, "সব স্পন্সর", "All Sponsors")} (${rows.length})`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                {r.logo_url ? <img src={r.logo_url} className="h-10 w-10 object-contain bg-white rounded p-1" /> : <div className="h-10 w-10 bg-muted rounded" />}
                <div className="flex-1 min-w-0"><p className="font-semibold truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.tier}</p>
                </div>
                <button onClick={() => del("sponsors", r.id, reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ===================== ABOUT ===================== */
export function AboutManager({ lang }: { lang: Lang }) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const committee = useRows("committee_members");
  const [c, setC] = useState({ name: "", role_en: "", role_bn: "", photo_url: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("about_content").select("*").limit(1).maybeSingle();
    setRow(data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("about_content").update({
      description_en: row.description_en, description_bn: row.description_bn,
      mission_en: row.mission_en, mission_bn: row.mission_bn,
      vision_en: row.vision_en, vision_bn: row.vision_bn,
    }).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(t(lang, "সেভ হয়েছে", "Saved"));
  };

  const addMember = async () => {
    if (!c.name || !c.role_en || !c.role_bn) return toast.error(t(lang, "সব ফিল্ড", "All fields"));
    const { error } = await supabase.from("committee_members").insert({ ...c, photo_url: c.photo_url || null, sort_order: committee.rows.length });
    if (error) toast.error(error.message);
    else { setC({ name: "", role_en: "", role_bn: "", photo_url: "" }); committee.reload(); }
  };

  if (loading || !row) return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-10" />;

  return (
    <div className="space-y-5">
      <Section title={t(lang, "আমাদের সম্পর্কে", "About Content")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <TArea placeholder="Description (EN)" rows={3} value={row.description_en} onChange={(e) => setRow({ ...row, description_en: e.target.value })} />
          <TArea placeholder="বিবরণ (BN)" rows={3} value={row.description_bn} onChange={(e) => setRow({ ...row, description_bn: e.target.value })} />
          <TArea placeholder="Mission (EN)" rows={2} value={row.mission_en} onChange={(e) => setRow({ ...row, mission_en: e.target.value })} />
          <TArea placeholder="মিশন (BN)" rows={2} value={row.mission_bn} onChange={(e) => setRow({ ...row, mission_bn: e.target.value })} />
          <TArea placeholder="Vision (EN)" rows={2} value={row.vision_en} onChange={(e) => setRow({ ...row, vision_en: e.target.value })} />
          <TArea placeholder="ভিশন (BN)" rows={2} value={row.vision_bn} onChange={(e) => setRow({ ...row, vision_bn: e.target.value })} />
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t(lang, "সেভ", "Save")}
        </button>
      </Section>

      <Section title={t(lang, "কমিটি সদস্য যোগ", "Add Committee Member")}>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder={t(lang, "নাম", "Name")} value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <Input placeholder="Role (EN)" value={c.role_en} onChange={(e) => setC({ ...c, role_en: e.target.value })} />
          <Input placeholder="পদবি (BN)" value={c.role_bn} onChange={(e) => setC({ ...c, role_bn: e.target.value })} />
        </div>
        <MediaUpload value={c.photo_url} onChange={(u) => setC({ ...c, photo_url: u ?? "" })} folder="committee" label="Photo" />
        <button onClick={addMember} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4" /> {t(lang, "যোগ", "Add")}
        </button>
      </Section>

      <Section title={`${t(lang, "কমিটি", "Committee")} (${committee.rows.length})`}>
        <div className="space-y-2">
          {committee.rows.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
              {m.photo_url ? <img src={m.photo_url} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-muted" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.role_en} / {m.role_bn}</p>
              </div>
              <button onClick={() => del("committee_members", m.id, committee.reload, lang)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ===================== CONTACT ===================== */
export function ContactManager({ lang }: { lang: Lang }) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_info").select("*").limit(1).maybeSingle();
    setRow(data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("contact_info").update({
      phone: row.phone, email: row.email,
      address_en: row.address_en, address_bn: row.address_bn,
      facebook_url: row.facebook_url, youtube_url: row.youtube_url, instagram_url: row.instagram_url,
    }).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(t(lang, "সেভ হয়েছে", "Saved"));
  };

  if (loading || !row) return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-10" />;

  return (
    <Section title={t(lang, "যোগাযোগ তথ্য", "Contact Info")}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input placeholder={t(lang, "ফোন", "Phone")} value={row.phone ?? ""} onChange={(e) => setRow({ ...row, phone: e.target.value })} />
        <Input placeholder="Email" value={row.email ?? ""} onChange={(e) => setRow({ ...row, email: e.target.value })} />
        <Input placeholder="Address (EN)" value={row.address_en ?? ""} onChange={(e) => setRow({ ...row, address_en: e.target.value })} />
        <Input placeholder="ঠিকানা (BN)" value={row.address_bn ?? ""} onChange={(e) => setRow({ ...row, address_bn: e.target.value })} />
        <Input placeholder="Facebook URL" value={row.facebook_url ?? ""} onChange={(e) => setRow({ ...row, facebook_url: e.target.value })} />
        <Input placeholder="YouTube URL" value={row.youtube_url ?? ""} onChange={(e) => setRow({ ...row, youtube_url: e.target.value })} />
        <Input placeholder="Instagram URL" value={row.instagram_url ?? ""} onChange={(e) => setRow({ ...row, instagram_url: e.target.value })} />
      </div>
      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t(lang, "সেভ", "Save")}
      </button>
    </Section>
  );
}

/* ───── Jersey Products ───── */
type JerseyProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  delivery_charge: number;
  available_sizes: string[];
  size_chart: Record<string, { chest?: string; length?: string }> | null;
  is_active: boolean;
  cod_enabled: boolean;
  sort_order: number;
};
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

export function JerseyProductsManager({ lang }: { lang: Lang }) {
  const [rows, setRows] = useState<JerseyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const { data } = await (supabase as any)
      .from("jersey_products").select("*").order("sort_order");
    setRows((data ?? []) as JerseyProduct[]); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const { error } = await (supabase as any).from("jersey_products").insert({
      name: t(lang, "নতুন জার্সি", "New Jersey"),
      price: 0, delivery_charge: 0, available_sizes: ALL_SIZES, sort_order: rows.length,
    });
    if (error) return toast.error(error.message);
    toast.success(t(lang, "যোগ হয়েছে", "Added")); load();
  };
  const update = async (id: string, patch: Partial<JerseyProduct>) => {
    const { error } = await (supabase as any).from("jersey_products").update(patch).eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const remove = async (id: string) => {
    if (!confirm(t(lang, "মুছে ফেলবেন?", "Delete?"))) return;
    const { error } = await (supabase as any).from("jersey_products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t(lang, "মুছে ফেলা হয়েছে", "Deleted")); load(); }
  };
  const toggleSize = (p: JerseyProduct, s: string) => {
    const next = p.available_sizes.includes(s)
      ? p.available_sizes.filter((x) => x !== s)
      : [...p.available_sizes, s];
    update(p.id, { available_sizes: next });
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Section title={t(lang, "জার্সি ম্যানেজমেন্ট", "Jersey Management")}>
      <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
        <Plus className="h-4 w-4" /> {t(lang, "নতুন জার্সি", "Add Jersey")}
      </button>
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map((p) => (
          <div key={p.id} className="rounded-xl border border-border p-4 space-y-3">
            <MediaUpload value={p.image_url} onChange={(u) => update(p.id, { image_url: u })} folder="jerseys" label={t(lang, "জার্সি ছবি", "Jersey Image")} />
            <Input value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} placeholder={t(lang, "নাম", "Name")} />
            <TArea value={p.description ?? ""} onChange={(e) => update(p.id, { description: e.target.value })} placeholder={t(lang, "বিবরণ", "Description")} rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">
                <span className="text-muted-foreground">{t(lang, "দাম", "Price")}</span>
                <Input type="number" value={p.price} onChange={(e) => update(p.id, { price: parseFloat(e.target.value) || 0 })} />
              </label>
              <label className="text-xs">
                <span className="text-muted-foreground">{t(lang, "ডেলিভারি", "Delivery")}</span>
                <Input type="number" value={p.delivery_charge} onChange={(e) => update(p.id, { delivery_charge: parseFloat(e.target.value) || 0 })} />
              </label>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t(lang, "উপলব্ধ সাইজ", "Available Sizes")}</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((s) => (
                  <button key={s} onClick={() => toggleSize(p, s)} className={`px-3 py-1 rounded-md border text-xs font-bold ${p.available_sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t(lang, "সাইজ চার্ট (চেস্ট / লেংথ ইঞ্চিতে)", "Size Chart (Chest / Length in inches)")}</p>
              <div className="space-y-1.5">
                {p.available_sizes.map((s) => {
                  const chart = p.size_chart?.[s] || {};
                  const setChart = (key: "chest" | "length", val: string) => {
                    const next = { ...(p.size_chart || {}), [s]: { ...chart, [key]: val } };
                    update(p.id, { size_chart: next });
                  };
                  return (
                    <div key={s} className="grid grid-cols-[2.5rem_1fr_1fr] gap-1.5 items-center">
                      <span className="text-xs font-bold text-center">{s}</span>
                      <Input className="h-8 text-xs" placeholder={t(lang, "চেস্ট", "Chest")} defaultValue={chart.chest ?? ""} onBlur={(e) => setChart("chest", e.target.value)} />
                      <Input className="h-8 text-xs" placeholder={t(lang, "লেংথ", "Length")} defaultValue={chart.length ?? ""} onBlur={(e) => setChart("length", e.target.value)} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={p.is_active} onChange={(e) => update(p.id, { is_active: e.target.checked })} />
                  {t(lang, "সক্রিয়", "Active")}
                </label>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={!!p.cod_enabled} onChange={(e) => update(p.id, { cod_enabled: e.target.checked })} />
                  {t(lang, "ক্যাশ অন ডেলিভারি", "Cash on Delivery")}
                </label>
              </div>
              <button onClick={() => remove(p.id)} className="text-destructive p-2 hover:bg-destructive/10 rounded-md"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───── Jersey Orders ───── */
type JerseyOrder = {
  id: string;
  product_id: string | null;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  jersey_print_name: string;
  jersey_number: number | null;
  size: string;
  quantity: number;
  unit_price: number;
  delivery_charge: number;
  total_amount: number;
  notes: string | null;
  admin_notes: string | null;
  status: string;
  payment_method: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type JerseyPayment = {
  id: string;
  jersey_order_id: string | null;
  payer_name: string;
  payer_phone: string;
  sender_last4: string;
  transaction_id: string | null;
  amount: number | null;
  payment_method_name: string | null;
  status: string;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
};

export function JerseyOrdersManager({ lang }: { lang: Lang }) {
  const [rows, setRows] = useState<JerseyOrder[]>([]);
  const [payments, setPayments] = useState<Record<string, JerseyPayment[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "delivered">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data: orders } = await (supabase as any)
      .from("jersey_orders").select("*").order("created_at", { ascending: false });
    const { data: pays } = await (supabase as any)
      .from("payment_submissions").select("*")
      .eq("submission_type", "jersey")
      .order("created_at", { ascending: false });
    const map: Record<string, JerseyPayment[]> = {};
    ((pays ?? []) as JerseyPayment[]).forEach((p) => {
      if (!p.jersey_order_id) return;
      (map[p.jersey_order_id] ||= []).push(p);
    });
    setRows((orders ?? []) as JerseyOrder[]);
    setPayments(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string, reason?: string) => {
    const patch: any = { status };
    if (reason !== undefined) patch.rejection_reason = reason;
    const { error } = await (supabase as any).from("jersey_orders").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t(lang, "আপডেট হয়েছে", "Updated")); load(); }
  };
  const setPayStatus = async (id: string, status: string, reason?: string) => {
    const patch: any = { status };
    if (reason !== undefined) patch.rejection_reason = reason;
    const { error } = await (supabase as any).from("payment_submissions").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t(lang, "আপডেট হয়েছে", "Updated")); load(); }
  };
  const setAdminNotes = async (id: string, admin_notes: string) => {
    const { error } = await (supabase as any).from("jersey_orders").update({ admin_notes }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t(lang, "নোট সংরক্ষিত", "Note saved")); load(); }
  };
  const remove = async (id: string) => {
    if (!confirm(t(lang, "মুছবেন?", "Delete?"))) return;
    const { error } = await (supabase as any).from("jersey_orders").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB"); } catch { return s; }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const statuses: Array<typeof filter> = ["all", "pending", "approved", "delivered", "rejected"];

  return (
    <Section title={t(lang, "জার্সি অর্ডার", "Jersey Orders")}>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
            {s} ({s === "all" ? rows.length : rows.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">{t(lang, "কোনো অর্ডার নেই", "No orders")}</p>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => {
            const op = expanded[o.id];
            const pays = payments[o.id] || [];
            return (
              <div key={o.id} className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{o.product_name} <span className="text-xs font-normal text-muted-foreground">· {o.size} × {o.quantity}</span></p>
                    <p className="text-sm">
                      {t(lang, "প্রিন্ট", "Print")}: <span className="font-mono font-bold uppercase">{o.jersey_print_name}</span>
                      {o.jersey_number != null && <> · #{o.jersey_number}</>}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t(lang, "অর্ডার আইডি", "Order ID")}:{" "}
                      <button
                        onClick={() => { navigator.clipboard?.writeText(o.id); toast.success(t(lang, "কপি হয়েছে", "Copied")); }}
                        className="font-mono hover:text-primary"
                        title={t(lang, "কপি করতে ক্লিক করুন", "Click to copy")}
                      >{o.id}</button>
                      {" · "}{fmtDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      o.status === "approved" ? "bg-success/15 text-success" :
                      o.status === "delivered" ? "bg-primary/15 text-primary" :
                      o.status === "rejected" ? "bg-destructive/15 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>{o.status}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${o.payment_method === "cod" ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/15 text-blue-600"}`}>
                      {o.payment_method === "cod" ? t(lang, "ক্যাশ অন ডেলিভারি", "COD") : t(lang, "অনলাইন", "Online")}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <p><span className="text-muted-foreground">👤 {t(lang, "নাম", "Name")}:</span> <span className="font-semibold">{o.customer_name}</span></p>
                  <p><span className="text-muted-foreground">📞 {t(lang, "ফোন", "Phone")}:</span> <a href={`tel:${o.customer_phone}`} className="font-semibold text-primary">{o.customer_phone}</a></p>
                  {o.customer_email && (
                    <p className="sm:col-span-2"><span className="text-muted-foreground">✉️ {t(lang, "ইমেইল", "Email")}:</span> <a href={`mailto:${o.customer_email}`} className="font-semibold text-primary">{o.customer_email}</a></p>
                  )}
                  <p className="sm:col-span-2"><span className="text-muted-foreground">📍 {t(lang, "ঠিকানা", "Address")}:</span> {o.delivery_address}</p>
                  <p><span className="text-muted-foreground">{t(lang, "একক দাম", "Unit Price")}:</span> ৳ {o.unit_price}</p>
                  <p><span className="text-muted-foreground">{t(lang, "ডেলিভারি", "Delivery")}:</span> ৳ {o.delivery_charge}</p>
                  <p className="sm:col-span-2 text-sm"><span className="text-muted-foreground">💰 {t(lang, "সর্বমোট", "Total")}:</span> <span className="font-bold text-base">৳ {o.total_amount}</span></p>
                  {o.notes && <p className="sm:col-span-2"><span className="text-muted-foreground">📝 {t(lang, "কাস্টমার নোট", "Customer Note")}:</span> {o.notes}</p>}
                  {o.rejection_reason && <p className="sm:col-span-2 text-destructive">✗ {o.rejection_reason}</p>}
                </div>

                <AdminNoteEditor
                  initial={o.admin_notes || ""}
                  onSave={(v) => setAdminNotes(o.id, v)}
                  lang={lang}
                />

                <button
                  onClick={() => setExpanded((e) => ({ ...e, [o.id]: !e[o.id] }))}
                  className="w-full text-left text-xs font-semibold text-primary py-1.5 px-2 rounded-md bg-primary/5 hover:bg-primary/10"
                >
                  {op ? "▼" : "▶"} {t(lang, "পেমেন্ট তথ্য", "Payment Info")} ({pays.length})
                </button>

                {op && (
                  <div className="space-y-2 pt-1">
                    {pays.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic px-2">{t(lang, "এখনো কোনো পেমেন্ট সাবমিট হয়নি", "No payment submitted yet")}</p>
                    ) : pays.map((p) => (
                      <div key={p.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{p.payment_method_name || "—"} · ৳ {p.amount ?? "—"}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            p.status === "approved" ? "bg-success/15 text-success" :
                            p.status === "rejected" ? "bg-destructive/15 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>{p.status}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-3 gap-y-0.5">
                          <p><span className="text-muted-foreground">{t(lang, "পেয়ার", "Payer")}:</span> {p.payer_name}</p>
                          <p><span className="text-muted-foreground">{t(lang, "ফোন", "Phone")}:</span> <a href={`tel:${p.payer_phone}`} className="text-primary">{p.payer_phone}</a></p>
                          <p><span className="text-muted-foreground">{t(lang, "প্রেরকের শেষ ৪", "Sender Last 4")}:</span> <span className="font-mono">{p.sender_last4}</span></p>
                          <p><span className="text-muted-foreground">TxID:</span> <span className="font-mono">{p.transaction_id || "—"}</span></p>
                          <p className="sm:col-span-2 text-muted-foreground">{fmtDate(p.created_at)}</p>
                          {p.notes && <p className="sm:col-span-2"><span className="text-muted-foreground">📝</span> {p.notes}</p>}
                          {p.rejection_reason && <p className="sm:col-span-2 text-destructive">✗ {p.rejection_reason}</p>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-border">
                          {p.status !== "approved" && <button onClick={() => setPayStatus(p.id, "approved")} className="px-2 py-0.5 rounded bg-success/15 text-success text-[11px] font-semibold">{t(lang, "অনুমোদন", "Approve")}</button>}
                          {p.status !== "rejected" && <button onClick={() => { const r = prompt(t(lang, "কারণ", "Reason")) || ""; setPayStatus(p.id, "rejected", r); }} className="px-2 py-0.5 rounded bg-destructive/15 text-destructive text-[11px] font-semibold">{t(lang, "প্রত্যাখ্যান", "Reject")}</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {o.status !== "approved" && <button onClick={() => setStatus(o.id, "approved")} className="px-3 py-1 rounded-md bg-success/15 text-success text-xs font-semibold">{t(lang, "অনুমোদন", "Approve")}</button>}
                  {o.status !== "delivered" && <button onClick={() => setStatus(o.id, "delivered")} className="px-3 py-1 rounded-md bg-primary/15 text-primary text-xs font-semibold">{t(lang, "ডেলিভার্ড", "Mark Delivered")}</button>}
                  {o.status !== "rejected" && <button onClick={() => { const r = prompt(t(lang, "কারণ", "Reason")) || ""; setStatus(o.id, "rejected", r); }} className="px-3 py-1 rounded-md bg-destructive/15 text-destructive text-xs font-semibold">{t(lang, "প্রত্যাখ্যান", "Reject")}</button>}
                  <button onClick={() => remove(o.id)} className="ml-auto p-1.5 text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
