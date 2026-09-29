# Ybex — Session 29–30 Summary (start the next session from here)

**Latest zip:** `version229.zip` (v228 + agreement v1). Built from Claude's v222 → v223 … v228 in this chat. `metadata.json` still says "version212" (AI Studio leftover).
**Language:** Ravi writes Hindi/Hinglish — reply the same way. All in-app / email text is **English**.
**State (v229):** 825 tests pass, 1 skipped on purpose; `tsc`, crash guard, `vite build` clean.
**Rules:** `npm run verify` before every zip · WHO + WHEN on every write · status tokens = DB contract · a money claim in the UI must match the server · no invented numbers/names/photos in new work · never edit a test just to make it pass · Supabase work = a prompt for Ravi's separate Supabase-connected Claude, never done from here.
**ARCHITECTURE.md:** 63 rules (62 overlays in a portal + scroll lock; 63 creator dashboard numbers from `/dashboard/creator`).
**Lock (rule 60):** Campaign, UGC, Invite, Chat. Screens may be redesigned with the SAME server calls. New in the lock this session (Ravi's OK): `backend/campaignManage.ts`, `BrandCampaignsMobile.jsx`, `BrandCampaignDetailMobile.jsx` (logged in `PROTECTED_CHANGES.md`).
**Note:** Ravi's phone test on 29 Sep was on `version219.ai.studio` — deploy the latest build before testing.

---

## 1. Done

### v223 — creator dashboard + overlays
- Modals/drawer covered only part of the screen and the page scrolled behind: `PullToRefresh` always set `translate3d(0,0,0)`. Now `transform: none` at rest. New `ModalPortal` + `useScrollLock` (locks body + `#app-scroll-container`) on the invite modal and notification drawer.
- New `GET /dashboard/creator` (`backend/creatorDashboard.ts`): earnings (this month / escrow / total — Earnings-page rules, IST month), open + completed work with real amount ("Agreed fee" / "Your payout"), next step, profile views read without counting.
- Creator dashboard: fixed ₹0 deal cards (`agreed_rate` didn't exist), "Monthly Earnings" (was all escrow money), ₹0 flash on live refresh, self-counted views; removed fake trend pills, sparklines, stock photo, fake match %, "₹10,000", "1d ago". Active deals: All active / Needs you / With brand / Completed. Important-for-You invite card fits its box.

### v224 — brand mobile KYC + admin login
- `BrandKycMobile.jsx` (`/brand/kyc` on phones): status → business & tax (GST / solo) → contact → submitted. Same endpoints + payload as desktop. Updates on KYC notification + every 30 s (desktop 5 s). Bug fixed: form prefills once (background user refresh used to wipe typing).
- Admin login in Ravi's design, logic unchanged; personal email placeholder removed.
- Checked Ravi's own screens (onboarding, Brand tab + 10 sub-screens, brand home): all 32 calls hit existing routes. Not edited.

### v225–v226 — Manage tab (MG-01 … MG-06)
- `BrandCampaignsMobile.jsx`: chips with counts, live / review / completed / draft cards, local draft, empty state, FAB + create menu. No calls of its own.
- Backend `backend/campaignManage.ts` (new): pause/resume applications, close campaign (status `completed` + closed_at/by, deals untouched), matching-creators count, apply guard in front of the locked apply route (409 `APPLICATIONS_CLOSED`).
- `BrandCampaignDetailMobile.jsx`: summary, real stats, ROI predict, pitches, PDF report, no-pitches state (share / invite / matching count), actions sheet (edit, share, pause/resume, close with confirm).
- Social-proof ticker on brand home kept on purpose (Ravi) — uses real brand names (Sugar, Mamaearth, Minimalist); consider generic names. Featured creators are real-only.

### v227 — chat + loader
- Both were already built (loader "Turn 14" in session 23; mobile chat already on the Uniqe_Chat design). Added the top bar during route code loading. Removed made-up fallback times, invented ₹15,000 original ask, and the "Minimum ₹3,000" counter line (no such server rule; the ₹3,000 floor exists only for invites).

### v228 — EX-04 / EX-05
- `CreatorProfileBrandMobile.jsx` (brand on a phone opening `/creator/:id`): cover, avatar, handle · city · rating (only with reviews) · collabs, categories, stats (followers / avg reach / engagement — only if set), bio, rate card (only rates that exist), brand reviews, Save + Invite to campaign. Share uses the phone share sheet.
- Invite sheet (EX-05) inside `InviteToCampaignModal.jsx` on mobile: pick one of the brand's live campaigns (prefills title, deliverables, message; fee from the creator's reel rate), or write a custom invite; same `send-brief` call and payload. "+ Create a new campaign". Desktop modal unchanged but now in a portal.
- The design's "Chat" button is not there: a chat opens only after the creator accepts an invite (session 26 rule).
- Tests: `creatorProfileBrandMobile.test.jsx` (3).

---

### v229 — Agreement v1 (Ravi: "naya agreement UGC aur campaign chat mein, tick ke baad hi OTP")
- `src/lib/agreementTerms.js`: one source for the v1 text — campaign (10 clauses: parties, scope, timeline, escrow + fee/TDS, 90 days live + #ad/ASCI, non-exclusive 12-month licence, cancellation, conduct, disputes → Jaipur arbitration, electronic acceptance under Section 10A) and UGC (8 clauses, non-exclusive 6 months). Key points on top, "See all terms", "Download PDF" (jsPDF, "Rs." in the PDF).
- `AgreementTermsPanel.jsx` (UGC style) on all four screens: `ContractModal` (campaign desktop, rebuilt in the UGC style, portal + scroll lock), `MobileContractSheet`, `UGCContractModal`, `CreatorUGCMobile` claim.
- **OTP only after ticking**: boxes start unticked (UGC had two pre-ticked); the code is sent once, when the box(es) are ticked; the OTP area is disabled until then. UGC no longer sends on open.
- The stored signature text = the agreement object's text (`asCaptureSource` / `agreementPlainText`); versions `campaign-v1-desktop/mobile`, `ugc-v1-desktop/mobile`. Server unchanged (it already stores any version + text).
- "Binding e-signature" line removed everywhere → "Accepted electronically … (Section 10A, IT Act 2000)".
- Same calls as before (`/otp/send`, `/otp/verify`, sign/claim routes). Lock updated with Ravi's reason (agreementCapture.js, agreementTerms.js, AgreementTermsPanel.jsx).
- Tests updated to the new rule (with Ravi's instruction): `agreementRecord.test.ts` wiring, `session24Phase1.test.jsx` (no OTP before ticking). New `chat/agreementV1.test.jsx` (4).
- Not changed: legacy sign screens (`/deals`, Collabs, DealDetail, CreatorUGCOrders) still record `text-not-captured` and old text.

## 2. Ravi — to do
1. **Supabase:** give the Supabase Claude the prompt from chat (5 columns on `campaigns` + check that status `completed` is allowed). Until then Pause/Close answer "setup needed". Send back its report.
2. Deploy v228, then test on a phone:
   - Creator dashboard: numbers match the Earnings page; invite modal + bell drawer cover the whole screen, page doesn't scroll behind.
   - Brand: KYC flow; Campaigns list + detail; Pause → a creator can't apply; Close → moves to Completed.
   - Brand opens a creator profile → Invite → pick a campaign → creator gets the invite.
3. Decide: profile-view counter counts a creator's own visits (fix is in locked `creators_routes.ts` — needs unlock). Brand-tab hub hardcodes "₹1,000" referral text (screen reads the server amount). Hinglish lines in the chat design — keep English?

## 2b. Ravi's work list (collected in chat, build when Ravi says)
1. Desktop creator profile: real match % (Category 40 · Platform 20 · Budget 25 · Location 15) — only the random match; fake rating/views stay.
2. Hide the Barter option in campaign create (desktop + mobile); barter → Phase 2.
3. Creator mobile home: deals use `agreed_amount` (was `agreed_rate` → ₹10,000 fallback).
4. UGC brief after payment → My Briefs (mobile: change the URL too). Desktop also "stuck" — waiting for Ravi's toast text / Cloud Run `ugc/briefs` log.
5. Photos: resize on upload (avatars ~0.8 MB each) + resize existing.
6. Banners: base64 in `banners.image_url` → Storage bucket; delete empty `banner-images` bucket.
7. `content-submissions` (1.67 GB, public) → private + signed links + thumbnails in lists (Ravi OK'd the unlock).
8. Landing reviews: remove the 18 hardcoded reviews (incl. real brand names); admin save must show an error when Supabase fails; rating (option or remove stars — Ravi to decide). Supabase report on `landing_reviews` pending.
9. Slowness: one socket per tab, per-user inbox cache clear, stop the creator dashboard's 60 s all-campaigns poll; needs `[slow-api]` logs + Cloud Run/Supabase regions + min instances.
Phase 2: barter end-to-end.

## 3. Claude — next
- After the Supabase report: adjust Close if `completed` isn't allowed.
- Desktop `CreatorPublicView.jsx` still shows generated ratings / views / match % (`fakeRating`, `fakeViews`, `runMatchCalculation`) — remove on Ravi's OK.
- `CampaignCard.jsx` (`budget_min || 10000`), `CampaignMiniList.jsx` (`|| 15000`), `getCampaignStats` (generated views/applied, locked util) still invent numbers on creator-facing campaign cards.
- Session 28 list: agreements v1 text, `[slow-api]` logs, base64 photos → storage.
