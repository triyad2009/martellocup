# Martello Finance Portal (`/portal`)

A private tournament finance portal, separate from the regular website login. Only people the admin issues a username + password to can enter.

## 1. Access & Unlock Experience

- New route: `/portal`
- **Login form** — username + password (admin-generated, not tied to Supabase auth email accounts).
- On successful login: a full-screen **camera-lens shutter animation** (multi-blade iris opens like a DSLR lens) reveals the dashboard behind it. ~1.2s.
- Portal session stored in `localStorage` as a signed token (24h expiry), separately from Supabase auth — so this portal is independent from normal user accounts.
- Logout button clears the token.

## 2. Admin — Credential Management

New tab in the existing Admin panel: **"Finance Portal"**.
- Generate credential: enter a label (e.g. "Treasurer Rakib") → system auto-generates username + strong password → shown **once** with copy button.
- List all credentials with: label, username, created date, last login, active toggle, revoke button.
- Passwords stored as bcrypt-style hash (via pgcrypto `crypt()`), never in plaintext.

## 3. Portal Dashboard (after unlock)

Tabs:

### a) Overview
- Total Income, Total Expenses, Net Balance — big cards.
- Monthly bar chart (recharts) and category donut.

### b) Income Ledger
- Auto-fed from every **approved** `payment_submissions` row (tickets, jerseys, sponsorships) + manual entries.
- Manual entry form: amount, source (donor/sponsor name), collected_by (which committee member), method (cash/bkash/bank), note, date, optional receipt image upload.
- Columns: Date, Source, Collected By, Method, Amount, Receipt.

### c) Expense Requests
- Submit expense: title, category (equipment, food, transport, prize, misc), amount, vendor/shop name, description, **shop slip upload** (image/pdf, multiple allowed), date.
- Status flow: `pending → approved / rejected` by an admin-level portal user.
- List view with filter by status; click row → detail modal showing all slips.

### d) Transactions (all-in-one)
- Unified timeline: every income + expense in one sortable/filterable table.
- Filters: date range, type, category, collected_by.
- Search.

### e) Export
- "Download PDF Report" button → generates a branded PDF (Martello logo top-left, tournament name, date range, summary totals, full transaction table, expense breakdown) using `jspdf` + `jspdf-autotable`.
- Options: choose date range + include/exclude expense slips as appendix images.

## 4. Auto-Sync from Existing Systems

- DB trigger on `payment_submissions`: when status flips to `approved`, insert a matching row into `portal_income` (idempotent on submission id).
- Backfill migration inserts all currently-approved submissions.

## 5. Technical Details

**New tables** (all with GRANTs + RLS scoped to `service_role` only — the portal talks through server functions, not direct client access):
- `portal_credentials` — id, label, username (unique), password_hash, is_active, created_by, last_login_at, role (`viewer` / `manager` / `treasurer`).
- `portal_sessions` — id, credential_id, token_hash, expires_at, ip, user_agent.
- `portal_income` — id, source_submission_id (nullable), amount, source_name, collected_by, method, note, receipt_url, entry_date, created_by_credential.
- `portal_expenses` — id, title, category, amount, vendor, description, entry_date, status, requested_by_credential, decided_by_credential, decided_at.
- `portal_expense_slips` — id, expense_id, file_url, file_type.

**Server functions** (`src/lib/portal.functions.ts`, all use `requireSupabaseAuth` for admin-only ops OR verify portal token for portal ops):
- `adminCreatePortalCredential` (admin only) — returns plaintext once.
- `adminListPortalCredentials` (admin only).
- `adminRevokePortalCredential` (admin only).
- `portalLogin(username, password)` → issues token.
- `portalMe(token)` → validates + returns credential info.
- `portalAddIncome`, `portalListIncome`.
- `portalSubmitExpense`, `portalListExpenses`, `portalDecideExpense`.
- `portalExportData(dateRange)` → returns JSON for PDF generation client-side.

**Files**:
- `src/routes/portal.tsx` — login form + camera-lens shutter → dashboard.
- `src/components/portal/CameraShutter.tsx` — SVG-based iris animation.
- `src/components/portal/IncomeTab.tsx`, `ExpensesTab.tsx`, `TransactionsTab.tsx`, `OverviewTab.tsx`, `ExportTab.tsx`.
- `src/components/admin/PortalCredentialsManager.tsx` — new admin tab.
- `src/lib/portal.functions.ts` — server functions.
- `src/lib/portal-session.ts` — token storage helpers.
- Add "Finance Portal" tab to `src/routes/admin.tsx`.

Portal is **not** added to the public Navbar — access is by direct URL `/portal` only (shared privately by admins).

## Confirm to proceed

Shall I build this exactly as above? Or would you like to change:
- Any tab structure
- Password vs OTP-based portal login
- PDF library / branding tweaks
