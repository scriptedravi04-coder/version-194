import { api } from "./api";
// Session 24. A brand pays for a UGC brief, then the app posts the brief with that paid order.
// If the post fails (network, server error), the money is already taken — pressing "Secure brief
// & pay" again used to open a NEW checkout and charge a second time. Now the paid order is kept
// on this device and the next tap posts the brief with it (the server checks it is paid, covers
// the escrow and funds nothing else).
const KEY = "ugc_paid_order";

export function getPaidBriefOrder() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && typeof v.order_id === "string" && v.order_id ? v : null;
  } catch {
    return null;
  }
}

export function savePaidBriefOrder(orderId, amount) {
  try {
    if (orderId) localStorage.setItem(KEY, JSON.stringify({ order_id: orderId, amount: Number(amount) || 0, at: Date.now() }));
  } catch { /* storage unavailable */ }
}

export function clearPaidBriefOrder() {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}

/** Server codes after which the saved order must not be tried again. */
export const FINAL_ORDER_CODES = ["PAYMENT_ALREADY_USED", "PAYMENT_TOO_LOW", "PAYMENT_NOT_COMPLETED"];

// Session 26. Where the brand lands after a paid brief is posted: My Briefs.
export const BRIEF_POSTED_PATH = "/brand/ugc/briefs?tab=briefs";

/**
 * Leave the post page for My Briefs. Uses the router first; if the page is still on the post
 * screen a moment later (a lazy page that never finished loading kept the old screen — the
 * "stuck on Processing…" report), it does a full page load instead.
 */
export function goToPostedBriefs(navigate, { fallbackMs = 2500 } = {}) {
  try { navigate(BRIEF_POSTED_PATH); } catch { /* fall through to the hard redirect */ }
  if (typeof window === "undefined") return;
  setTimeout(() => {
    try {
      if (window.location.pathname.startsWith("/brand/ugc/post")) window.location.assign(BRIEF_POSTED_PATH);
    } catch { /* ignore */ }
  }, fallbackMs);
}

/**
 * Safety net while the checkout is open: if the payment for `orderId` completes but the normal
 * success callback never arrives, call `onPaid(orderId)` once. Returns a stop function.
 * The brief post is idempotent per order on the server, so a double call is harmless.
 */
export function watchPaidOrder(checkStatus, orderId, onPaid, { startAfterMs = 15000, intervalMs = 5000, maxMs = 300000 } = {}) {
  if (!orderId || typeof checkStatus !== "function") return () => {};
  let stopped = false;
  let timer = null;
  const began = Date.now();
  const tick = async () => {
    if (stopped) return;
    if (Date.now() - began > maxMs) { stopped = true; return; }
    try {
      const paid = await checkStatus(orderId);
      if (!stopped && paid) { stopped = true; onPaid(orderId); return; }
    } catch { /* transient — try again */ }
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };
  timer = setTimeout(tick, startAfterMs);
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

/** true when Razorpay / the server say this order is paid. */
export async function checkBriefOrderPaid(orderId) {
  const { data } = await api.post("payments/razorpay/check-status", { order_id: orderId });
  return Boolean(data?.paid);
}
