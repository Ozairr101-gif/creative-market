import Link from "next/link";
import { Calendar, Search, MessageSquare, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Shaadi HQ",
  description:
    "Plan your entire Asian wedding from one beautiful workspace. Learn how Shaadi HQ helps you manage events, discover vendors, request quotes, and book securely.",
};

const STEPS = [
  {
    number: "01",
    icon: Calendar,
    title: "Create your wedding workspace",
    headline: "All your events, one beautiful calendar",
    description: `Every Asian wedding is made up of multiple events — and keeping track of them all
across WhatsApp groups and spreadsheets is exhausting. Shaadi HQ gives you a
dedicated workspace for your entire wedding journey.

Add every event — mehndi, haldi, sangeet, nikah, shaadi, walima — with dates,
venues, and guest lists. Invite family members to collaborate so everyone stays
on the same page without the chaos.`,
    features: [
      "Create and manage multiple events in one place",
      "Invite family and close friends to collaborate",
      "Shared timeline visible to your whole planning team",
      "Add notes, to-dos, and custom reminders per event",
    ],
    mockLabel: "Event Calendar View",
    mockContent: [
      { event: "Mehndi", date: "12 Jun", color: "#16a34a", bg: "#f0fdf4" },
      { event: "Nikah", date: "14 Jun", color: "#059669", bg: "#ecfdf5" },
      { event: "Shaadi", date: "15 Jun", color: "#8B1D4F", bg: "rgba(139,29,79,0.06)" },
      { event: "Walima", date: "16 Jun", color: "#d97706", bg: "#fffbeb" },
    ],
  },
  {
    number: "02",
    icon: Search,
    title: "Discover trusted vendors",
    headline: "2,000+ verified Asian wedding specialists",
    description: `Finding the right vendors for an Asian wedding requires specialists who understand
the traditions, the scale, and the cultural nuances. Generic wedding directories
just don't cut it.

Shaadi HQ is built exclusively for Asian weddings. Every vendor on our platform
is verified and reviewed by real couples. Filter by location, event type,
category, and budget to find exactly who you need.`,
    features: [
      "Filter by city, category, event type, and budget",
      "Verified and reviewed by real Asian wedding couples",
      "View full portfolios, pricing, and availability",
      "Save favourites to your shortlist across devices",
    ],
    mockLabel: "Vendor Discovery",
    mockContent: null,
    mockVendors: [
      { name: "Raj Photography", category: "Photographer", location: "London", rating: "4.9" },
      { name: "Spice Garden Catering", category: "Caterer", location: "Birmingham", rating: "4.8" },
      { name: "Mehndi by Priya", category: "Mehndi Artist", location: "Leicester", rating: "5.0" },
    ],
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Request quotes & shortlist",
    headline: "Compare quotes, choose with confidence",
    description: `Getting quotes from Asian wedding vendors traditionally means dozens of phone
calls, unanswered emails, and trying to remember who said what. We've fixed that.

Send an inquiry to multiple vendors with a single form. Receive their quotes
directly in your Shaadi HQ inbox, compare them side by side, and shortlist
your top choices — all without leaving the platform.`,
    features: [
      "Send inquiries to multiple vendors at once",
      "Receive and compare quotes in one unified inbox",
      "Shortlist favourites and share with family",
      "Message vendors directly with follow-up questions",
    ],
    mockLabel: "Quote Comparison",
    mockContent: null,
    mockQuotes: [
      { vendor: "Raj Photography", price: "£2,400", status: "Received" },
      { vendor: "Noor Studios", price: "£1,950", status: "Received" },
      { vendor: "Vision Films", price: "£2,100", status: "Pending" },
    ],
  },
  {
    number: "04",
    icon: Shield,
    title: "Book securely",
    headline: "Every payment protected, every booking guaranteed",
    description: `Paying large deposits to wedding vendors is nerve-wracking. Horror stories of
vendors disappearing or disputes over what was agreed are all too common.

Shaadi HQ's secure payment system holds deposits in escrow until services are
delivered. Pay milestones at each agreed stage, and if anything goes wrong,
our resolution team has you covered. Your wedding day is protected.`,
    features: [
      "Deposits held securely in escrow",
      "Milestone payments tied to delivery stages",
      "Dispute resolution if anything goes wrong",
      "Full transaction history and digital receipts",
    ],
    mockLabel: "Payment Timeline",
    mockContent: null,
    mockPayments: [
      { label: "Deposit paid", amount: "£600", status: "complete" },
      { label: "Mid-point milestone", amount: "£900", status: "upcoming" },
      { label: "Final balance", amount: "£900", status: "pending" },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <main style={{ backgroundColor: "#FAF7F5" }}>
      {/* Page header */}
      <section
        className="relative overflow-hidden py-20 lg:py-28"
        style={{
          background: "linear-gradient(160deg, #FAF7F5 0%, rgba(139,29,79,0.04) 100%)",
          borderBottom: "1px solid rgba(139,29,79,0.08)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse at 70% 50%, rgba(201,151,63,0.07) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{
              backgroundColor: "rgba(139,29,79,0.08)",
              color: "#8B1D4F",
              border: "1px solid rgba(139,29,79,0.15)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#C9973F" }}
              aria-hidden="true"
            />
            Simple. Beautiful. Made for you.
          </div>
          <h1
            className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{ color: "#1a0a12" }}
          >
            How{" "}
            <span style={{ color: "#8B1D4F" }}>Shaadi HQ</span>
            {" "}works
          </h1>
          <p
            className="text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: "#5a3a4a" }}
          >
            From your first ideas to your last dance — four steps to a wedding
            planned entirely in one place, designed specifically for the Asian
            wedding experience.
          </p>
        </div>
      </section>

      {/* Steps */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 space-y-28">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 1;

          return (
            <section
              key={step.number}
              className={`flex flex-col gap-12 lg:gap-20 lg:flex-row ${isEven ? "lg:flex-row-reverse" : ""} items-center`}
            >
              {/* Text side */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="text-5xl font-black leading-none"
                    style={{ color: "rgba(139,29,79,0.10)" }}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(139,29,79,0.08)",
                      border: "1px solid rgba(139,29,79,0.14)",
                    }}
                  >
                    <Icon size={22} style={{ color: "#8B1D4F" }} />
                  </div>
                </div>

                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#C9973F" }}
                >
                  Step {step.number}
                </p>
                <h2
                  className="text-3xl lg:text-4xl font-bold tracking-tight mb-3"
                  style={{ color: "#1a0a12" }}
                >
                  {step.title}
                </h2>
                <p
                  className="text-xl font-medium mb-5"
                  style={{ color: "#8B1D4F" }}
                >
                  {step.headline}
                </p>

                <div className="space-y-3 mb-8">
                  {step.description.trim().split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="text-base leading-relaxed"
                      style={{ color: "#5a3a4a" }}
                    >
                      {para.replace(/\n/g, " ").trim()}
                    </p>
                  ))}
                </div>

                <ul className="space-y-2.5">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                        style={{
                          backgroundColor: "rgba(139,29,79,0.10)",
                          color: "#8B1D4F",
                        }}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: "#3a1525" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock UI side */}
              <div className="flex-1 min-w-0 w-full">
                <div
                  className="rounded-3xl overflow-hidden shadow-xl"
                  style={{
                    border: "1px solid rgba(139,29,79,0.10)",
                    backgroundColor: "white",
                  }}
                >
                  {/* Mock window chrome */}
                  <div
                    className="flex items-center gap-2 px-5 py-3.5"
                    style={{
                      backgroundColor: "rgba(139,29,79,0.04)",
                      borderBottom: "1px solid rgba(139,29,79,0.08)",
                    }}
                    aria-hidden="true"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fca5a5" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fde68a" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#bbf7d0" }} />
                    <span
                      className="ml-3 text-xs font-medium"
                      style={{ color: "#8B1D4F" }}
                    >
                      Shaadi HQ — {step.mockLabel}
                    </span>
                  </div>

                  {/* Mock content */}
                  <div className="p-6 min-h-[280px] flex flex-col justify-center">
                    {/* Step 1: event calendar */}
                    {step.number === "01" && step.mockContent && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9973F" }}>
                          Your Wedding Events
                        </p>
                        {step.mockContent.map((ev) => (
                          <div
                            key={ev.event}
                            className="flex items-center gap-4 rounded-xl px-4 py-3"
                            style={{ backgroundColor: ev.bg, border: `1px solid ${ev.color}22` }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: ev.color }}
                              aria-hidden="true"
                            />
                            <span className="font-semibold text-sm flex-1" style={{ color: "#1a0a12" }}>
                              {ev.event}
                            </span>
                            <span className="text-xs" style={{ color: ev.color }}>
                              {ev.date} · London
                            </span>
                          </div>
                        ))}
                        <div
                          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 mt-2"
                          style={{
                            border: "1.5px dashed rgba(139,29,79,0.2)",
                            color: "#8B1D4F",
                          }}
                        >
                          <span className="text-lg" aria-hidden="true">+</span>
                          <span className="text-sm font-medium">Add another event</span>
                        </div>
                      </div>
                    )}

                    {/* Step 2: vendor cards */}
                    {step.number === "02" && step.mockVendors && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9973F" }}>
                          Matching Vendors
                        </p>
                        {step.mockVendors.map((v) => (
                          <div
                            key={v.name}
                            className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                            style={{
                              backgroundColor: "#FAF7F5",
                              border: "1px solid rgba(139,29,79,0.08)",
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ backgroundColor: "rgba(139,29,79,0.08)" }}
                              aria-hidden="true"
                            >
                              ⭐
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm" style={{ color: "#1a0a12" }}>
                                {v.name}
                              </p>
                              <p className="text-xs" style={{ color: "#7a5060" }}>
                                {v.category} · {v.location}
                              </p>
                            </div>
                            <span
                              className="text-xs font-bold px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: "rgba(201,151,63,0.12)",
                                color: "#C9973F",
                              }}
                            >
                              ★ {v.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 3: quote comparison */}
                    {step.number === "03" && step.mockQuotes && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9973F" }}>
                          Quote Inbox
                        </p>
                        {step.mockQuotes.map((q) => (
                          <div
                            key={q.vendor}
                            className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                            style={{
                              backgroundColor: "#FAF7F5",
                              border: "1px solid rgba(139,29,79,0.08)",
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm" style={{ color: "#1a0a12" }}>
                                {q.vendor}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "#7a5060" }}>
                                Photographer · London
                              </p>
                            </div>
                            <span className="font-bold text-sm" style={{ color: "#8B1D4F" }}>
                              {q.price}
                            </span>
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: q.status === "Received"
                                  ? "rgba(22,163,74,0.10)"
                                  : "rgba(201,151,63,0.12)",
                                color: q.status === "Received" ? "#16a34a" : "#C9973F",
                              }}
                            >
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 4: payment timeline */}
                    {step.number === "04" && step.mockPayments && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#C9973F" }}>
                          Payment Milestones — Raj Photography
                        </p>
                        {step.mockPayments.map((p, i) => (
                          <div key={p.label} className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    p.status === "complete"
                                      ? "rgba(22,163,74,0.12)"
                                      : p.status === "upcoming"
                                      ? "rgba(139,29,79,0.10)"
                                      : "rgba(0,0,0,0.05)",
                                  color:
                                    p.status === "complete"
                                      ? "#16a34a"
                                      : p.status === "upcoming"
                                      ? "#8B1D4F"
                                      : "#9ca3af",
                                }}
                                aria-hidden="true"
                              >
                                {p.status === "complete" ? "✓" : i + 1}
                              </div>
                              {i < (step.mockPayments?.length ?? 0) - 1 && (
                                <div
                                  className="w-px h-8"
                                  style={{
                                    backgroundColor: "rgba(139,29,79,0.12)",
                                  }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div
                              className="flex-1 flex items-center justify-between rounded-xl px-4 py-3 mb-1"
                              style={{
                                backgroundColor:
                                  p.status === "upcoming"
                                    ? "rgba(139,29,79,0.04)"
                                    : "transparent",
                                border:
                                  p.status === "upcoming"
                                    ? "1px solid rgba(139,29,79,0.12)"
                                    : "1px solid transparent",
                              }}
                            >
                              <span className="text-sm font-medium" style={{ color: "#3a1525" }}>
                                {p.label}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    p.status === "complete"
                                      ? "#16a34a"
                                      : p.status === "upcoming"
                                      ? "#8B1D4F"
                                      : "#9ca3af",
                                }}
                              >
                                {p.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div
                          className="mt-4 rounded-xl px-4 py-3 text-center"
                          style={{
                            backgroundColor: "rgba(22,163,74,0.07)",
                            border: "1px solid rgba(22,163,74,0.15)",
                          }}
                        >
                          <p className="text-xs font-medium" style={{ color: "#16a34a" }}>
                            All payments held securely in escrow
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <section
        className="py-20"
        style={{
          borderTop: "1px solid rgba(139,29,79,0.08)",
        }}
      >
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center">
          <h2
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#1a0a12" }}
          >
            Ready to start planning?
          </h2>
          <p
            className="text-lg leading-relaxed mb-10"
            style={{ color: "#5a3a4a" }}
          >
            Join thousands of couples who have planned their perfect Asian
            wedding with Shaadi HQ. It&apos;s free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: "#8B1D4F" }}
            >
              Start Planning Free
            </Link>
            <Link
              href="/vendors"
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:shadow-md"
              style={{
                backgroundColor: "white",
                color: "#8B1D4F",
                border: "1.5px solid rgba(139,29,79,0.25)",
              }}
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
