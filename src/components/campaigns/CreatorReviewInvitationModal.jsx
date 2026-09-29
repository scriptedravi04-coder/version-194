import React, { useState } from "react";
import { 
  X, Check, AlertCircle, ShieldCheck, DollarSign, Package, 
  Calendar, MessageSquare, ArrowRight, CornerDownLeft, Sparkles, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "../../lib/api";
import useBusy from "../../lib/useBusy";
import ButtonSpinner from "../common/ButtonSpinner";
import ModalPortal from "../common/ModalPortal";
import useScrollLock from "../../lib/useScrollLock";
import { formatBudget, getDeliverablesCount } from "../../utils/invitationUtils";

const DECLINE_REASONS = [
  "Budget too low",
  "Deliverables not aligned",
  "Busy / Not available",
  "Other"
];

export default function CreatorReviewInvitationModal({
  isOpen = true,
  onClose,
  invite,
  onAccepted,
  onDeclined,
}) {
  const [isDeclining, setIsDeclining] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Budget too low");
  const [customReason, setCustomReason] = useState("");

  const { isBusy, anyBusy, run } = useBusy();
  // Session 29: page behind must not scroll while this is open.
  useScrollLock(Boolean(isOpen && invite));

  if (!isOpen || !invite) return null;

  const brandName = invite.brand_name || "Brand Partner";
  const brandLogo = invite.brand_logo || "";
  const campaignTitle = invite.campaign_title || "Campaign Collaboration";
  const campaignDesc = invite.campaign_description || invite.message || invite.pitch || "No campaign description provided.";
  const budget = formatBudget(invite.proposed_budget || invite.budget_range);
  const deliverables = invite.deliverables || "Standard deliverables";
  const deliverablesCount = invite.deliverables_count || getDeliverablesCount(invite.deliverables);
  const timeline = invite.timeline || "Flexible";
  const notes = invite.notes || invite.pitch || invite.message || "";

  // 1. Accept & Start Negotiating — opens a NEW campaign deal chat (backend/creators_routes.ts)
  const handleAccept = () => {
    run("accept", async () => {
      try {
        const res = await api.post(`/creators/invitations/${invite.id}/accept`);
        toast.success("Invitation accepted! Chat thread is now open.");
        if (onAccepted) {
          onAccepted(invite, res.data?.thread_id);
        }
        onClose();
      } catch (err) {
        toast.error(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to accept invitation. Please try again."
        );
      }
    });
  };

  // 2. Decline Flow with Reason Confirmation
  const handleConfirmDecline = () => {
    const finalReason = selectedReason === "Other" && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    run("decline", async () => {
      try {
        await api.post(`/creators/invitations/${invite.id}/decline`, {
          reason: finalReason
        });
        toast.success("Invitation declined. Brand has been notified with your reason.");
        if (onDeclined) {
          onDeclined(invite, finalReason);
        }
        onClose();
      } catch (err) {
        toast.error(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to decline invitation. Please try again."
        );
      }
    });
  };

  return (
    <ModalPortal>
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 pb-24 sm:pb-4 bg-black/50 backdrop-blur-xs overflow-y-auto overscroll-contain"
        onClick={(e) => {
          if (e.target === e.currentTarget && !anyBusy) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-[var(--border-default)] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative my-8"
        >
          {/* Top Dismiss Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={anyBusy}
            aria-label="Close modal"
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>

          {!isDeclining ? (
            /* Main Review Invitation View */
            <div className="space-y-5">
              {/* Brand Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--border-default)]">
                {brandLogo ? (
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="w-12 h-12 rounded-2xl object-cover border border-black/5 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-[var(--violet)] font-bold flex items-center justify-center text-base shrink-0 border border-purple-200">
                    <Building2 size={22} className="text-[var(--violet)]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                      <Sparkles size={10} className="text-amber-500" /> Direct Campaign Offer
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate mt-0.5">
                    {brandName}
                  </h3>
                  <p className="text-[11px] text-gray-500">Verified Brand Sponsor</p>
                </div>
              </div>

              {/* Campaign Title & Description */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Campaign Title
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                  {campaignTitle}
                </h4>
                {campaignDesc && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">
                    {campaignDesc}
                  </p>
                )}
              </div>

              {/* Proposed Budget & Deliverables Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <DollarSign size={12} /> Offered Budget
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck size={10} /> Escrow
                    </span>
                  </div>
                  <div className="font-mono font-bold text-lg sm:text-xl text-emerald-950 tracking-tight">
                    {budget}
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                      <Package size={12} /> Deliverables
                    </span>
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                      {deliverablesCount} {deliverablesCount === 1 ? "Item" : "Items"}
                    </span>
                  </div>
                  <div className="font-medium text-xs text-[var(--text-primary)] line-clamp-2 leading-snug">
                    {deliverables}
                  </div>
                </div>
              </div>

              {/* Timeline & Notes/Pitch from Brand */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/60">
                  <Calendar size={14} className="text-gray-500 shrink-0" />
                  <span className="font-medium text-gray-700">Timeline:</span> {timeline}
                </div>

                {notes && (
                  <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-3 text-xs text-purple-950">
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-purple-700 mb-1">
                      <MessageSquare size={11} /> Brand Pitch & Notes
                    </div>
                    <p className="italic leading-relaxed text-gray-700">"{notes}"</p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed m-0">
                Accepting opens a new chat for this campaign. The fee is not final — you can accept it or suggest your own fee there. A short thank-you note is sent to the brand for you.
              </p>

              {/* Action Buttons: Strict ARCHITECTURE.md Alignment */}
              {/* Left: Dismissive / Secondary [Decline Invitation] */}
              {/* Right: Affirmative / Primary [Accept & Start Negotiating] */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsDeclining(true)}
                  disabled={anyBusy}
                  className="btn-secondary py-2.5 px-5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:border-rose-200 cursor-pointer"
                >
                  Decline Invitation
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={anyBusy}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isBusy("accept") ? (
                    <ButtonSpinner label="Accepting..." />
                  ) : (
                    <>
                      <Check size={14} /> Accept & Start Negotiating
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Decline Confirmation Sub-view */
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-default)]">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Decline Campaign Invitation
                  </h3>
                  <p className="text-xs text-gray-500">
                    From {brandName} • {campaignTitle}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Are you sure you want to decline this invitation?</strong>
                <p className="mt-1 text-[11px] text-amber-800">
                  The brand will be notified with your feedback. Your inbox will stay clean and no thread will be created.
                </p>
              </div>

              {/* Decline Reason Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Reason for Declining
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:bg-white outline-none cursor-pointer"
                >
                  {DECLINE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom reason input if 'Other' is chosen */}
              {selectedReason === "Other" && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Please specify reason (optional)
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g. Currently on travel, conflict with another sponsor..."
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:bg-white outline-none"
                  />
                </div>
              )}

              {/* Confirmation Action Buttons: ARCHITECTURE.md Alignment */}
              {/* Left: Dismissive / Secondary [Back / Cancel] */}
              {/* Right: Affirmative / Action [Confirm Decline] */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsDeclining(false)}
                  disabled={anyBusy}
                  className="btn-secondary py-2.5 px-5 text-xs font-semibold cursor-pointer"
                >
                  Back to Review
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  disabled={anyBusy}
                  className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isBusy("decline") ? (
                    <ButtonSpinner label="Declining..." />
                  ) : (
                    "Confirm Decline"
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
    </ModalPortal>
  );
}
