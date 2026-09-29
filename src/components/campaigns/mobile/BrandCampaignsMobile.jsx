import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, RotateCcw, SquarePlus, Megaphone, ChevronRight, Trash2 } from "lucide-react";
import ModalPortal from "../../common/ModalPortal";
import useScrollLock from "../../../lib/useScrollLock";

// Session 30: Ravi's brand mobile design — MG-01 Campaigns, MG-02 empty, MG-03 create menu.
// UI ONLY. This file makes no server calls: BrandCampaigns.jsx (locked screen) loads the data
// and passes its own handlers in, so the calls of the campaign flow are unchanged (rule 60).
// Only real numbers: applicant count = campaign.applicants.length from GET /campaigns?mine=true.

const lower = (s) => String(s || "").toLowerCase().trim();

function Chip({ tone, children }) {
  const tones = {
    live: ["#DCFCE7", "#15803D"], draft: ["#F1F1F5", "#4B5563"], review: ["#FEF3C7", "#B45309"],
    done: ["#EEF2FF", "#4338CA"], violet: ["#F3EDFF", "#7C3AED"],
  };
  const [bg, fg] = tones[tone] || tones.draft;
  return (
    <span className="h-[22px] px-2 rounded-[7px] inline-flex items-center text-[10px] font-bold tracking-[.5px] uppercase whitespace-nowrap shrink-0" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

function daysLeftText(c) {
  const end = c.deadline || c.end_date || c.closes_at;
  if (!end) return "";
  const t = new Date(end).getTime();
  if (Number.isNaN(t)) return "";
  const d = Math.ceil((t - Date.now()) / 86400000);
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  return `${d <= 7 ? "Closes" : "Ends"} in ${d} day${d === 1 ? "" : "s"}`;
}

function savedAgo(c) {
  const t = new Date(c.updated_at || c.created_at || "").getTime();
  if (Number.isNaN(t)) return "";
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 60) return `Saved ${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Saved ${h}h ago`;
  return `Saved ${Math.floor(h / 24)}d ago`;
}

function budgetText(c) {
  if (c.budget_min === 0) return "Barter";
  const f = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const min = Number(c.budget_min || 0), max = Number(c.budget_max || 0);
  if (min && max && max !== min) return `${f(min)} – ${f(max)} per creator`;
  if (min || max) return `${f(min || max)} per creator`;
  return "";
}

function subline(c) {
  const bits = [];
  const plats = Array.isArray(c.platforms) ? c.platforms.filter(Boolean) : [];
  if (plats.length) bits.push(plats.join(", "));
  const b = budgetText(c);
  if (b) bits.push(b);
  return bits.join(" · ");
}

export default function BrandCampaignsMobile({
  campaigns = [], filtered = [], tabs = [], activeTab, setActiveTab, isUnderReview,
  hasLocalDraft, localDraftInfo,
  onCreate, onResumeDraft, onDiscardDraft, onEdit, onSubmitDraft, onManage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollLock(menuOpen);

  const kind = (c) => {
    const s = lower(c.status);
    if (s === "live" || s === "approved") return "live";
    if (isUnderReview?.(c.status)) return "review";
    if (s === "completed") return "done";
    return "draft";
  };

  const isEmpty = campaigns.length === 0 && !hasLocalDraft;

  return (
    <div className="w-full text-left text-[#0A0A0A]" style={{ fontFamily: "'DM Sans', sans-serif" }} data-testid="brand-campaigns-mobile">
      <div className="pt-1 pb-3">
        <div className="text-2xl font-bold tracking-[-.8px]">Campaigns</div>
      </div>

      {isEmpty ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-5 gap-2.5">
          <div className="w-16 h-16 rounded-[20px] bg-[#F3EDFF] flex items-center justify-center"><Megaphone size={32} color="#7C3AED" /></div>
          <div className="mt-1.5 text-[19px] font-bold">No campaigns yet</div>
          <div className="text-[13.5px] leading-relaxed text-[#6B7280]">Post a brief and verified creators pitch to you. You only pay when you hire someone.</div>
          <div className="w-full mt-3 flex flex-col gap-2">
            <button type="button" onClick={onCreate} className="h-[50px] rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center gap-2 text-[15px] font-semibold active:scale-[.99]" style={{ boxShadow: "0 12px 22px -14px rgba(124,58,237,.9)" }}>
              <Plus size={17} /> Create campaign
            </button>
            <Link to="/brand/ugc/instant" className="h-[50px] rounded-2xl bg-white border border-[#E0E0E8] flex items-center justify-center text-[15px] font-semibold text-[#0A0A0A]">Try Instant UGC</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-28">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {tabs.map((t) => {
              const on = activeTab === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className="h-[34px] px-3 rounded-[17px] flex items-center text-[12.5px] font-semibold whitespace-nowrap shrink-0 transition"
                  style={on ? { background: "#0A0A0A", color: "#fff" } : { background: "#fff", color: "#374151", border: "1px solid #E0E0E8" }}>
                  {t.id === "all" ? "All" : t.label} · {t.count || 0}
                </button>
              );
            })}
          </div>

          {hasLocalDraft && (activeTab === "all" || activeTab === "draft") && (
            <div className="bg-white border border-[#E6E6EE] rounded-[20px] p-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center"><Chip tone="draft">Draft</Chip><span className="text-xs font-medium text-[#6B7280]">On this device</span></div>
                <div className="mt-2 text-[15px] font-semibold leading-snug truncate">
                  {localDraftInfo?.campaignTitle || localDraftInfo?.title || "Untitled campaign"}
                </div>
              </div>
              <button type="button" onClick={onDiscardDraft} aria-label="Discard draft" className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF]"><Trash2 size={16} /></button>
              <button type="button" onClick={onResumeDraft} className="h-[38px] px-3.5 rounded-xl bg-[#F3EDFF] text-[#7C3AED] text-[13px] font-semibold">Resume</button>
            </div>
          )}

          {filtered.length === 0 && !(hasLocalDraft && activeTab === "draft") && (
            <div className="py-10 text-center text-[13px] text-[#6B7280]">Nothing here yet.</div>
          )}

          {filtered.map((c) => {
            const k = kind(c);
            const id = c.campaign_id || c.id;
            const applicants = Array.isArray(c.applicants) ? c.applicants.length : null;
            if (k === "draft") {
              return (
                <div key={id} className="bg-white border border-[#E6E6EE] rounded-[20px] p-3.5 flex items-center gap-3">
                  <button type="button" onClick={() => onEdit(c)} className="flex-1 min-w-0 text-left">
                    <div className="flex gap-2 items-center"><Chip tone="draft">Draft</Chip><span className="text-xs font-medium text-[#6B7280]">{savedAgo(c)}</span></div>
                    <div className="mt-2 text-[15px] font-semibold leading-snug line-clamp-2">{c.title || "Untitled campaign"}</div>
                    {subline(c) && <div className="mt-0.5 text-xs text-[#6B7280] truncate">{subline(c)}</div>}
                  </button>
                  <button type="button" onClick={() => onSubmitDraft(c)} className="h-[38px] px-3.5 rounded-xl bg-[#F3EDFF] text-[#7C3AED] text-[13px] font-semibold shrink-0">Launch</button>
                </div>
              );
            }
            return (
              <button key={id} type="button" onClick={() => onManage(c)} className="bg-white border border-[#E6E6EE] rounded-[20px] p-3.5 text-left active:scale-[.995] transition">
                <div className="flex items-center justify-between gap-2">
                  <Chip tone={k}>{k === "live" ? "Live" : k === "review" ? "Under review" : "Completed"}</Chip>
                  <span className="text-xs font-medium text-[#6B7280] truncate">{k === "live" ? daysLeftText(c) : ""}</span>
                </div>
                <div className="mt-2.5">
                  <div className="text-[15.5px] font-semibold leading-snug line-clamp-2">{c.title || "Campaign"}</div>
                  {subline(c) && <div className="mt-0.5 text-[12.5px] text-[#6B7280] truncate">{subline(c)}</div>}
                </div>
                {k !== "review" && applicants !== null && (
                  <div className="mt-3 pt-3 border-t border-[#F0F0F4] flex items-center justify-between">
                    {applicants > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-lg font-bold">{applicants}</span>
                        <span className="text-[11.5px] font-medium text-[#6B7280]">Applicant{applicants === 1 ? "" : "s"}</span>
                      </div>
                    ) : (
                      <span className="text-[12.5px] text-[#6B7280]">No pitches yet</span>
                    )}
                    <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[#7C3AED]">{applicants > 0 ? "Review" : "Open"} <ChevronRight size={14} /></span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FAB + create menu (MG-03) */}
      {!isEmpty && (
        <ModalPortal>
          {menuOpen && <div className="fixed inset-0 z-[45] bg-[rgba(12,12,18,.34)]" onClick={() => setMenuOpen(false)} />}
          {menuOpen && (
            <div className="fixed right-6 z-[46] flex flex-col items-end gap-2.5" style={{ bottom: "calc(164px + env(safe-area-inset-bottom, 0px))" }}>
              {hasLocalDraft && (
                <MenuItem label="Resume draft" onClick={() => { setMenuOpen(false); onResumeDraft(); }} icon={<RotateCcw size={18} color="#F59E0B" />} />
              )}
              <MenuItem label="New campaign" onClick={() => { setMenuOpen(false); onCreate(); }} icon={<SquarePlus size={18} color="#7C3AED" />} />
            </div>
          )}
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close menu" : "Create"}
            className="fixed right-[18px] z-[46] w-14 h-14 rounded-[19px] bg-[#7C3AED] flex items-center justify-center active:scale-95 transition md:hidden"
            style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))", boxShadow: "0 14px 28px -12px rgba(124,58,237,.65)" }}>
            {menuOpen ? <X size={22} color="#fff" /> : <Plus size={22} color="#fff" strokeWidth={2.4} />}
          </button>
        </ModalPortal>
      )}
    </div>
  );
}

function MenuItem({ label, icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5">
      <span className="px-3 py-2 rounded-[11px] bg-white border border-[#E5E5EA] text-[13px] font-medium text-[#3F3F46] whitespace-nowrap" style={{ boxShadow: "0 8px 20px -12px rgba(18,18,26,.4)" }}>{label}</span>
      <span className="w-11 h-11 rounded-[15px] bg-white border border-[#E5E5EA] flex items-center justify-center" style={{ boxShadow: "0 8px 20px -12px rgba(18,18,26,.4)" }}>{icon}</span>
    </button>
  );
}
