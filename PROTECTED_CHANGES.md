# Protected flows — change log

Campaign, UGC and Invite-to-campaign are **locked** (Ravi, session 28: all three tested and working
on the deployed build; launch is close). See `scripts/protectedFlows.mjs` and ARCHITECTURE.md rule 60.

- Logic files: frozen by content hash.
- Screen files of these flows: design may change; the server calls they make may not.

Only Ravi can approve a change. After he approves, run:
`npm run protect:update -- --reason "what Ravi approved"` — every run is logged below.

## Log

- 2026-09-29 — **Baseline** (session 28, v220): Ravi tested Campaign, UGC and Invite-to-campaign on v219 and all work. v220 adds only the session-28 fixes (brand KYC gate, per-user drafts, live refresh). 35 logic files + 4 screen groups (chat, ugc, campaign, invite) locked.

- 2026-09-28T22:09:00.966Z — Session 28: signature records (agreement_signatures) — Ravi approved in chat: 'ye toh abhi hi implement krege'. Sign routes save text/version/OTP email/IP; screens send their text; lock list +3 files.
  - logic files changed: backend/deals_routes.ts, backend/deals_chat_routes.ts, backend/signTokens.ts, backend/agreementRecord.ts, backend/admin_agreements_routes.ts, src/lib/agreementCapture.js, backend/ugc_routes.ts, src/components/chat/mobile/useChatThreadMobile.js
  - screen call groups changed: none

- 2026-09-29T12:42:46.179Z — Session 30, Ravi (chat): 'inka backend bhi bana do or inka ui bhi bana do' — adds campaign pause/close/matching-creators backend (new file backend/campaignManage.ts, apply guard in front of the locked apply route) and the mobile campaign list/detail screens. No existing locked file changed its logic; the locked applicants and campaigns pages only render the new mobile screens.
  - logic files changed: none
  - screen call groups changed: none

- 2026-09-29T12:42:55.814Z — Session 30, Ravi: adds backend/campaignManage.ts and the two mobile campaign screens to the lock (they were built on Ravi's OK in chat).
  - logic files changed: backend/campaignManage.ts
  - screen call groups changed: campaign

- 2026-09-29T20:23:14.560Z — Session 30, Ravi (chat): 'naya agreement UGC aur campaign chat mein attach karo; campaign ka UI aur backend update ho; terms tick karein tabhi OTP jaaye; calls aur logic na toote'. Agreement v1 text (src/lib/agreementTerms.js), versions v0 → v1 in agreementCapture.js, shared AgreementTermsPanel. Server calls unchanged.
  - logic files changed: src/lib/agreementCapture.js, src/lib/agreementTerms.js
  - screen call groups changed: chat
