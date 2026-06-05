## কী বানাব

### ১. Season-10 vibe (সব জায়গায়)
- Navbar logo এর পাশে animated "SEASON 10" badge (gradient + pulse)
- Hero section এ S10 watermark + intro animation (framer-motion)
- Footer এ "Season 10 — 2026" tagline
- নতুন CSS token: `--s10-gold`, gradient + glow

### ২. FIFA WORLD CUP option (Navbar এ prominent button)
Navbar এর উপরে আলাদা glowing button ("⚽ FIFA WORLD CUP 2026") যেটা সব page এ দেখাবে — gradient animation সহ।

নতুন route: `/fifa` — sub-tabs সহ একটা hub:
- **Fixtures & Live Scores** — TheSportsDB free API থেকে World Cup matches fetch (দেশ, তারিখ, সময়, venue)। Live match হলে auto-poll প্রতি ৩০ সেকেন্ডে → score পরিবর্তন হলে toast popup
- **Debate Chat** — global room (একটাই)
- **Quiz** — MCQ, সঠিক উত্তরে পয়েন্ট
- **Predict** — upcoming match এর score guess
- **Mini Game** — penalty shootout (click timing based)
- **Leaderboard** — Top 10 দল (পয়েন্ট descending)

### ৩. Debate join flow
`/fifa/debate` এ ঢুকলে যদি registered না হয়:
- Name (auto from profile), পছন্দের দেশ select (32 World Cup teams dropdown), profile photo upload
- Save করলে chat এ ঢুকবে; নিজের team badge দেখাবে প্রতি message এ
- যেকোনো game/quiz/predict খেললে পয়েন্ট নিজের team এ যোগ হবে

### ৪. Database (নতুন tables)
- `wc_participants` (user_id PK, display_name, country_code, country_name, photo_url, total_points)
- `wc_chat_messages` (id, user_id, country_code, message, created_at) + realtime
- `wc_quiz_questions` (id, question_bn/en, options jsonb, correct_index, points)
- `wc_quiz_attempts` (user_id, question_id, is_correct, points_earned)  — unique(user_id, question_id) যাতে repeat না হয়
- `wc_predictions` (user_id, match_id text, home_score, away_score, points_earned)
- `wc_game_scores` (user_id, game_type, score, points, created_at)
- View: `wc_team_leaderboard` — country_code, country_name, total_points, member_count, ORDER BY total_points DESC LIMIT 10
- RLS: সবাই read পারবে chat/leaderboard; নিজের attempts/predictions নিজে write

### ৫. Live Score API integration
TheSportsDB free endpoints (no key দরকার):
- `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026` (World Cup)
- Live: `https://www.thesportsdb.com/api/v1/json/3/eventslive.php?s=Soccer`
- Server function এ proxy + cache (CORS safe)
- Frontend: TanStack Query, refetchInterval: 30s live match থাকলে
- Score change detect → Sonner toast + sound notification (existing scanner sound reuse)

### ৬. Technical structure
- `src/routes/fifa.tsx` — layout with tabs (`/fifa`, `/fifa/debate`, `/fifa/quiz`, `/fifa/predict`, `/fifa/game`, `/fifa/leaderboard`)
- `src/lib/fifa.functions.ts` — serverFn: `getWorldCupFixtures`, `getLiveScores`
- `src/lib/fifa-countries.ts` — 32 teams data (flag emoji, code, name)
- `src/components/fifa/*` — DebateChat, QuizCard, PredictCard, PenaltyGame, LiveScoreToast, JoinDebateModal
- Login required everywhere (existing `LoginGate`)

### বড় কাজ — approve করলে শুরু করব। কোনো কিছু বদলাতে চাইলে এখনই বলুন।