# Martello Cup Manager

# ====================================================================
# 🏆 MARTELLO CUP — FOOTBALL TOURNAMENT MANAGEMENT SYSTEM
# SUPER MASTER PROMPT FOR LOVABLE AI
# ====================================================================

## PROJECT OVERVIEW
Build a complete Football Tournament Management Website called "Martello Cup". Permanent website updated every season via Admin Panel. Dual language (Bengali + English) with toggle. Heavily animated, mobile-first, premium sporty design. Every content editable from Admin Panel except Developer Credit section. Use React + TypeScript + Tailwind CSS + Supabase + Framer Motion.

Location: Gayanbari, Gabura, Shyamnagar, Satkhira, Bangladesh. 8-Team Tournament.

## DESIGN SYSTEM

Colors:
- Primary Red: #D71920 (buttons, CTA, headers, highlights)
- White: #FFFFFF (main background)
- Light Gray: #F5F5F5 (section backgrounds)
- Dark: #1A1A2E (hero sections, footer, admin sidebar)
- Text Dark: #1A1A1A
- Text Gray: #6B7280
- Accent Blue: #1E4FA1 (info, links — sparingly)
- Accent Green: #2E8B57 (success, win states)
- Accent Gold: #D4A017 (trophy, champion highlights)
- Error Red: #DC2626
- Warning Yellow: #F59E0B
- Border: #E5E7EB

Typography:
- Headings: "Oswald" — Bold, uppercase, sporty
- Body: "Inter" or "Poppins" — clean sans-serif
- Bengali: "Hind Siliguri"

Animations (Framer Motion — HEAVY throughout):
- Page transitions: fade + slide-up
- Scroll animations: staggered children reveal
- Hero: parallax, floating particles, gradient animation
- Buttons: hover scale(1.05), tap scale(0.95), glow
- Cards: hover lift + shadow + subtle rotate
- Navbar: glassmorphism + backdrop-blur on scroll
- Score updates: number counter animation
- Modals: scale-up + backdrop blur
- Stats counters: animate on scroll into view
- Gallery: lightbox transitions
- Sponsor logos: grayscale to color on hover
- Loading: skeleton pulse + branded loader
- Toast: slide-in auto-dismiss
- Confetti on champion page

Layout:
- Max width: 1280px centered
- Section padding: 80px desktop, 40px mobile
- Card radius: 12-16px, Button radius: 8-12px
- Responsive: Mobile 0-640px, Tablet 641-1024px, Desktop 1025px+

## LANGUAGE SYSTEM
- Language toggle (BN|EN) on Navbar, visible every page
- All text from translation JSON object
- Default: Bengali. Switches without reload
- Store preference in localStorage
- All labels, buttons, headings, errors, placeholders translatable

## FIXED DEVELOPER CREDIT (HARDCODED — CANNOT BE EDITED/DELETED FROM ADMIN)

Placement 1: Thin strip below Navbar on every page
Placement 2: Below all footer content on every page
Text: "Develop By TAHSINULLAH RIYAD"
"TAHSINULLAH RIYAD" = clickable button with gradient dark-to-red, glow/pulse animation, hover brightness + scale(1.05)
Click opens Developer Modal.

Developer Modal:
- Full overlay, dark glassmorphism backdrop (blur 20px)
- Centered, max-width 500px
- Scale entrance animation (0.8→1, opacity 0→1)
- Close X button with hover rotation
- Click outside to close

Modal Content:
- Name: "TAHSINULLAH RIYAD" — large, bold, glowing text
- Subtitle: "Full Stack Developer"
- Large rounded buttons with platform brand colors, white text/icon, hover scale+shadow, staggered entrance animation:

1. 🌐 Portfolio (LARGEST — gold border + glow): https://tr-com.lovable.app
2. 💻 GitHub (#333): https://github.com/tahsinullahriyad
3. 💼 LinkedIn (#0077B5): https://www.linkedin.com/in/tahsinullah-riyad-b16035304
4. 📘 Facebook (#1877F2): https://www.facebook.com/tahsinullah.riyad.tr
5. 📷 Instagram (gradient): https://www.instagram.com/tahsinullah.riyad
6. 📱 WhatsApp (#25D366): https://wa.me/qr/E44HZE4NNWUSF1
7. 🐦 Twitter/X (#000): https://x.com/tahsinullar2k9
8. ✈️ Telegram (#0088CC): https://t.me/tahsinullahriyad_tr
9. 🎮 Discord (#5865F2): https://discord.com/users/tahsinullahriyad
10. 📧 Email (#D71920): mailto:info@tahsinullahriyad.world
11. 🎥 YouTube (dimmed, "Coming Soon"): #

## PUBLIC PAGES

### NAVBAR
- Sticky, glassmorphism on scroll
- Logo left (from Admin, placeholder "MC" badge)
- Menu: Home, Fixtures, Results, Points Table, Teams, Players, Registration, Tickets, Gallery, News, Sponsors, About, Contact
- Language toggle (BN|EN)
- Mobile: hamburger + slide-in drawer
- Active page: red underline animation
- Below navbar: Developer credit strip

### PAGE 1: HOMEPAGE

Section 1 — Hero:
- Full viewport, animated gradient dark+red background
- Large "MARTELLO CUP" glowing text
- Tagline, Season badge (from Admin)
- Location text
- Countdown timer (flip-clock style) to next match/tournament start
- CTA: "View Fixtures" (red) + "Register Team" (outline white)
- Floating football/trophy icons, scroll-down bounce arrow

Section 2 — Live Score Ticker:
- If LIVE match: Team A Logo—Score—Team B Logo, pulsing red LIVE badge, minute, scorers
- If no live: "Next Match" card with countdown
- If nothing: "Latest Result" card
- Auto-refresh 30s

Section 3 — Quick Stats Bar:
- Animated counters: Total Teams, Matches, Goals, Players

Section 4 — Upcoming Matches:
- Next 3-4 matches as cards (teams, date, time, venue, "View Details")
- Horizontal scroll mobile

Section 5 — Latest Results:
- Last 3-4 results (score, scorers, MOTM, "Full Report")

Section 6 — Points Table Preview:
- Top 4 teams compact table (P,W,D,L,GD,Pts)
- Leader gold highlight. "View Full Table" button

Section 7 — Featured News:
- 3 latest news cards (image, title, date, excerpt)
- Hover image zoom. "View All News"

Section 8 — Gallery Preview:
- 6-8 photos grid/masonry. Hover overlay. "View Gallery"

Section 9 — Sponsors Carousel:
- Auto-sliding logos, categorized sizes
- Grayscale→color hover

Section 10 — Video Highlights:
- Embedded video (URL from Admin)

### PAGE 2: FIXTURES
- Filters: Round (Group/QF/SF/3rd/Final), Team, Status (Upcoming/Live/Finished), Date
- List/Grid toggle
- Match cards: match#, round badge, Team A vs Team B, date/time, venue, status badge (blue/red-pulse/green/yellow)
- If finished: score shown
- Click → Match Detail: lineups, goals+minute, cards+minute, subs, MOTM, stats (possession/shots/corners), report, photos
- Calendar view option

### PAGE 3: RESULTS
- Completed matches only
- Result cards: Team A (score)—(score) Team B, scorers, MOTM, date/venue, "Match Report"
- Knockout Bracket visualization: QF→SF→Final tree, animated lines, winner gold/green, click match→details

### PAGE 4: POINTS TABLE (AUTO-CALCULATED)
- Calculates from match results automatically
- Columns: #, Logo+Name, P, W, D, L, GF, GA, GD, Pts, Form (last 5 colored dots)
- Default: Win=3, Draw=1, Loss=0 (configurable Admin)
- Tiebreaker: Points→GD→GF→H2H (configurable)
- 1st gold row, 2nd silver, qualification green border, elimination red border
- If groups: separate table per group
- Mobile: horizontal scroll, sticky team column
- Click team→team page

### PAGE 5: TEAMS
List: 8 teams grid (logo, name, description, "View Team"). Hover lift+rotation. Filter by group. Search.

Team Page (/teams/[slug]):
- Banner, logo+name, description
- Stats: P,W,D,L, GF/GA, clean sheets, position
- Coach/Captain info with photos
- Squad grid (player cards: photo, name, jersey#, position). Filter: All/GK/DF/MF/FW. Click→player page
- Match history in tournament
- Team gallery

### PAGE 6: PLAYERS
Directory: all players grid. Filter: team, position. Search.
Player card: photo, name, jersey# badge, position badge (color-coded), team logo, key stat.

Player Page (/players/[slug]):
- Large photo, name, jersey# background, position badge, team
- Info: DOB/age, height, weight, foot, captain badge
- Stats dashboard (animated): matches, minutes, goals, assists, yellows, reds, clean sheets, MOTM
- Match-by-match log table
- Bio

### PAGE 7: STATISTICS
Tabs:
- Top Scorers (rank, photo, name, team, goals, assists — top 3 gold/silver/bronze)
- Top Assists
- Clean Sheets
- Cards (most yellow, most red, fair play)
- Team Stats (best attack, defense, most wins)
- Awards (Golden Boot/Glove/Ball, Best Young Player, Fair Play — from Admin)
All auto-calculated from match data.

### PAGE 8: REGISTRATION
- Open/Close controlled from Admin
- Closed: "Registration Closed" message
- Open: Form with:
  - Team Name, Short Name, Logo Upload, Category (Admin options)
  - Coach Name, Phone, Email
  - Address, Captain Name
  - Player list (min 11, max configurable): Name, Jersey#, Position, DOB, Photo, NID/Birth Cert#, Document Upload
  - Banner (optional), Description (optional), Social Links (optional)
  - Payment proof upload (if fee)
  - Terms checkbox
  - Submit → success with registration ID
  - Status tracking: Pending→Approved/Rejected
- Public registered teams list

### PAGE 9: TICKETS
- On/Off from Admin
- Off: "Coming Soon"
- On: Match list with ticket cards (teams, date, venue, categories+prices, available count, "Buy Ticket")
- Flow: Select match→category→quantity→buyer info (name/phone/email)→payment method→proof upload→confirm
- Booking confirmation with ID + QR e-ticket
- Status check by booking ID

### PAGE 10: GALLERY
Tabs: Photos | Videos
Photos: Albums (from Admin), masonry grid, lightbox, download, share, lazy loading, filter by album
Videos: Grid thumbnails, YouTube/Facebook embeds, play overlay, filter

### PAGE 11: NEWS
List: cards (image+title+excerpt+date), category filter, search, pagination, featured/pinned top, hover zoom+lift
Article (/news/[slug]): featured image, title, date/author/category, rich content, social share, related articles, prev/next nav

### PAGE 12: SPONSORS
Categories: Title (largest+gold glow), Platinum, Gold, Silver, Bronze, Media Partner
Each: logo, name, description, website link (new tab)
Grayscale→color hover
"Become a Sponsor" CTA → contact/package info, PDF download

### PAGE 13: ABOUT
- History (rich text from Admin)
- Mission & Vision
- Committee members grid (photo, name, designation, bio — from Admin)
- Past Winners/Hall of Fame (year, champion, runner-up, top scorer, best player — from Admin)
- Animated timeline

### PAGE 14: CONTACT
- Contact info from Admin (phone click-to-call, WhatsApp click-to-chat, email, address, hours)
- Google Maps embed
- Social links
- Contact form: name, email, phone, subject dropdown, message → Admin Panel
- FAQ accordion (from Admin) with search

### PAGE 15: VENUES
- Venue list (photo, name, address, capacity, facilities icons)
- Venue page: gallery, description, maps, upcoming matches, directions, facilities

### FOOTER
4 columns (stacked mobile): About+social | Quick Links | Info Links | Contact+Newsletter
Bottom: "© 2025 Martello Cup. All Rights Reserved." + Privacy/Terms
Below: Developer credit (fixed, clickable)

## ADMIN PANEL

Auth: login at /admin/login, Supabase Auth, email+password, remember me, password reset
Default: admin@martellocup.com / admin123
Layout: dark sidebar (#1A1A2E), topbar (name, notifications, logout), light content area, responsive

### Dashboard
- Stat cards: Teams, Players, Matches, Completed, Upcoming, Goals, Registrations, Tickets Sold, News, Visitors
- Recent activity, quick actions (Add Match, Update Score, Add News, View Registrations)
- Charts: goals per matchday, ticket sales
- Next 5 matches list

### Site Settings
General: Tournament Name, Tagline, Season, Start/End Date, Description, Status (Upcoming/Ongoing/Completed)
Branding: Logo upload, Favicon, Hero Banner, OG Image
Contact: Phone1, Phone2, WhatsApp, Email, Address, Hours, Maps URL
Social: Facebook, YouTube, Instagram, Twitter, TikTok
SEO: Meta Title, Description, Keywords, Analytics ID
Announcement: Text + Active toggle
Registration: Open toggle, dates, fee, payment instructions, min/max players, documents list, terms (rich text)
Tickets: Active toggle, categories CRUD (name, price, description, quantity)
Format: Type (Group+KO/KO/League), groups count, teams per group, qualifying count, points W/D/L, tiebreakers, match duration, extra time, subs allowed

### Teams Manager
List: table (logo, name, group, players count, actions), search, filter
Add/Edit: Name, Short Name, Slug (auto), Logo, Banner, Group, Coach (name+photo), Manager, Captain (dropdown), Description (rich text), Address, Social Links, Status, Order
Delete with confirmation

### Players Manager
List: table (photo, name, jersey#, team, position, goals, cards, actions), filter team/position, search
Add/Edit: Name, Slug, Photo, Jersey#, Team (dropdown), Position (GK/DF/MF/FW), DOB, Nationality, Height, Weight, Foot, Captain/Vice Captain, Bio, Status (Active/Injured/Suspended)
Stats AUTO-CALCULATED from match data

### Matches Manager (CORE)
List: table (match#, teams, date, venue, status, score, actions), filter round/status/team/date
Add/Edit:
- Setup: Match#, Round, Group, Home Team, Away Team, Date, Time, Venue, Referee, Status, Notes
- Live: Home Score (+/-), Away Score (+/-), Current Minute, Period (1st Half/HT/2nd Half/ET/Penalties)
- Goals: Add (team, scorer dropdown, assist dropdown, minute, type: Normal/Penalty/OwnGoal/FreeKick/Header). List with edit/delete
- Cards: Add (team, player, type: Yellow/Red/SecondYellow, minute, reason). List with edit/delete
- Subs: Add (team, player out, player in, minute). List with edit/delete
- Result: MOTM dropdown, Report (rich text), Stats (possession/shots/shotsOT/corners/fouls), Photos upload

CRITICAL: Saving result auto-recalculates Points Table + Player Stats + Team Stats + Top Scorers INSTANTLY

### Points Table Manager
- View auto-calculated table
- Configure: points W/D/L, tiebreaker order
- Manual override: deduct/award points with reason
- Separate tables per group

### Venues Manager
List + Add/Edit: Name, Slug, Address, Maps URL, Capacity, Description (rich text), Facilities checklist, Photos (multiple), Status

### Registration Manager
List: table (team, contact, date, status, actions), filter status, search
View: full details, documents, players, payment proof
Actions: Approve, Reject (with reason), Download PDF, Contact links, Convert to team

### Ticket Manager
Overview: total sold, revenue, per-match breakdown
Bookings list: table (ID, match, buyer, category, qty, amount, status, actions), filter/search
Actions: View, Confirm, Cancel (refund note), Print/Resend e-ticket

### Gallery Manager
Albums: grid (cover, name, count, date). Add/Edit: Name, Description, Cover, Category, Date, Upload multiple photos (drag&drop), Reorder, Delete individual
Videos: list. Add: Title, Description, URL (auto-embed), Thumbnail, Category, Date

### News Manager
List: table (title, category, date, status, actions), filter/search
Add/Edit: Title, Slug, Category (Announcement/Preview/Report/Interview/Press/General), Featured Image, Content (RICH TEXT EDITOR), Excerpt, Author, Tags, Status (Draft/Published), Date, Featured toggle, SEO fields

### Sponsors Manager
List + Add/Edit: Name, Logo, Category (Title/Platinum/Gold/Silver/Bronze/Media), Website, Description, Banner, Order (drag&drop), Status
Packages: Add/Edit: Name, Price, Benefits, Brochure PDF, Status

### Awards Manager
Set: Golden Boot (auto/manual), Golden Glove, Golden Ball, Best Young Player, Fair Play, Best Coach, MOTN, Custom awards
Each: name, winner (player/team), photo, description, display toggle

### Pages Content Manager
About: History, Mission, Vision, Plans (rich text)
Committee: CRUD (name, designation, photo, bio, order)
Past Winners: CRUD (season, champion, runner-up, scorer, best player, photo)
Rules: rich text + PDF upload
Privacy Policy, Terms: rich text
FAQ: CRUD (question, answer, category, order)

### Messages
List (name, email, subject, date, status unread/read/replied), view, mark, delete

### Admin Users
List, Add (name, email, password, role), Edit, Delete
Roles: Super Admin (full), Content Manager (news/gallery/sponsors/pages), Match Manager (matches/teams/players), Media Manager (gallery/videos), Viewer (read-only)

### Language Manager
Table of translatable strings: Bengali | English columns, inline edit, search, organized by page

## DATABASE (SUPABASE)

Tables:
- settings (id, key, value, type, timestamps)
- teams (id, name, short_name, slug, logo_url, banner_url, group_name, coach_name, coach_photo_url, manager_name, captain_player_id FK, description, address, social_links JSON, display_order, status, timestamps)
- players (id, name, slug, photo_url, jersey_number, team_id FK, position ENUM, dob, nationality, height_cm, weight_kg, preferred_foot, is_captain, is_vice_captain, bio, status, timestamps)
- venues (id, name, slug, address, maps_url, capacity, description, facilities JSON, photos JSON, status, timestamps)
- matches (id, match_number, round ENUM, group_name, home_team_id FK, away_team_id FK, date, time, venue_id FK, status ENUM, home_score, away_score, current_minute, match_period, referee, motm_player_id FK, match_report, match_stats JSON, notes, timestamps)
- match_goals (id, match_id FK, team_id FK, scorer_id FK, assist_id FK, minute, goal_type ENUM, timestamps)
- match_cards (id, match_id FK, team_id FK, player_id FK, card_type ENUM, minute, reason, timestamps)
- match_substitutions (id, match_id FK, team_id FK, player_out_id FK, player_in_id FK, minute, timestamps)
- registrations (id, team_name, logo_url, category, coach_name, coach_phone, coach_email, address, captain_name, players_data JSON, documents JSON, payment_proof_url, fee, status ENUM, rejection_reason, timestamps)
- tickets (id, booking_id UNIQUE, match_id FK, buyer_name, buyer_phone, buyer_email, category, quantity, total_amount, payment_method, payment_proof_url, status ENUM, qr_code, timestamps)
- news (id, title, slug, category, featured_image_url, content, excerpt, author, tags JSON, status ENUM, is_featured, published_at, seo_title, seo_description, timestamps)
- gallery_albums (id, name, description, cover_url, category, date, order, timestamps)
- gallery_photos (id, album_id FK, image_url, caption, order, timestamps)
- gallery_videos (id, title, description, video_url, thumbnail_url, category, date, timestamps)
- sponsors (id, name, logo_url, category ENUM, website_url, description, banner_url, order, status, timestamps)
- awards (id, name, type, winner_player_id FK, winner_team_id FK, photo_url, description, season, display, timestamps)
- committee_members (id, name, designation, photo_url, bio, order, timestamps)
- past_winners (id, season, champion, runner_up, top_scorer, best_player, photo_url, timestamps)
- faqs (id, question, answer, category, order, timestamps)
- contact_messages (id, name, email, phone, subject, message, status ENUM, timestamps)
- admin_users (id, name, email, password_hash, role ENUM, last_login, timestamps)
- translations (id, key, bn_text, en_text, page, section, timestamps)
- page_contents (id, page_name, section, content, language, timestamps)

## TECH STACK
- React 18+ TypeScript, Vite, Tailwind CSS, Framer Motion
- React Router, TanStack Query, React Hook Form, Zod
- Lucide React icons, React Hot Toast, date-fns, Recharts
- Rich text editor (React Quill/TipTap), React Dropzone, React Lightbox
- Embla Carousel, React Helmet, i18next
- Supabase: PostgreSQL, Auth, Storage, Real-time subscriptions, RLS

## CRITICAL RULES
1. ALL public content editable from Admin. No hardcoded content except Developer Credit.
2. Developer Credit ("Develop By TAHSINULLAH RIYAD") is PERMANENTLY HARDCODED on every page (below navbar + footer bottom). CANNOT be edited/removed from Admin. All modal links FIXED.
3. Points Table AUTO-CALCULATES from match results.
4. Player stats AUTO-CALCULATE from match data.
5. Language system works ALL pages — every text has BN+EN.
6. ALL forms have validation with language-appropriate errors.
7. ALL images uploadable via Admin, stored in Supabase Storage.
8. FULLY RESPONSIVE on mobile/tablet/desktop.
9. HEAVY ANIMATIONS everywhere using Framer Motion.
10. Admin Panel has DIFFERENT layout (sidebar style) but same color theme.
11. Live score uses Supabase real-time subscriptions.
12. Bangladesh timezone (UTC+6).
13. Premium sporty feel (FIFA/UEFA style).
14. Handle error/empty/loading states with proper UI.
15. Admin panel intuitive for non-tech users.

## INITIAL PLACEHOLDERS
- Logo: "MC" text in shield badge
- Name: "Martello Cup"
- Location: "Gayanbari, Gabura, Shyamnagar, Satkhira"
- 8 demo teams with placeholder logos
- Sample fixtures, 2-3 news articles, placeholder gallery
- Admin: admin@martellocup.com / admin123

## BUILD ORDER
Step 1: Foundation (setup, Supabase, i18n, design tokens, Navbar, Footer, Dev Credit Modal, routing)
Step 2: Admin Auth (login, Supabase Auth, protected routes, admin layout, dashboard)
Step 3: Admin Core (Settings, Teams CRUD, Players CRUD, Venues CRUD)
Step 4: Match Engine (Matches CRUD, live score, goals/cards/subs, auto points table, auto player stats)
Step 5: Public Core (Homepage, Fixtures, Results, Points Table, Teams, Players, Statistics)
Step 6: Content (News CRUD+pages, Gallery CRUD+pages, Sponsors CRUD+page)
Step 7: Registration+Tickets (forms, admin managers)
Step 8: Remaining (About, Contact, FAQ, Awards, Committee, Past Winners, Venues, Rules)
Step 9: Polish (animations, SEO, errors, loading, 404, performance, mobile testing)

Start building Step 1 now. Make it visually stunning with heavy animations.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://martellocup.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d2d5010-10d9-4b50-a122-0d17f2aee7fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
