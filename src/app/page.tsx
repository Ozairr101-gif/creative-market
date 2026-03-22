import Link from "next/link";
import {
  Calendar,
  Search,
  MessageSquare,
  Shield,
  Star,
  CheckCircle,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const VENDOR_CATEGORIES = [
  { slug: "venue", label: "Venues", icon: "🏛️" },
  { slug: "caterer", label: "Caterers", icon: "🍽️" },
  { slug: "photographer", label: "Photographers", icon: "📸" },
  { slug: "videographer", label: "Videographers", icon: "🎥" },
  { slug: "decorator", label: "Decorators & Mandap", icon: "✨" },
  { slug: "bridalwear", label: "Bridalwear", icon: "👗" },
  { slug: "mehndi_artist", label: "Mehndi Artists", icon: "🌿" },
  { slug: "dj", label: "DJs & Entertainment", icon: "🎵" },
  { slug: "officiant", label: "Officiants & Priests", icon: "📿" },
  { slug: "wedding_planner", label: "Wedding Planners", icon: "📋" },
  { slug: "transport", label: "Transport", icon: "🚗" },
  { slug: "hair_makeup", label: "Hair & Makeup", icon: "💄" },
];

const TESTIMONIALS = [
  {
    name: "Priya & Rahul",
    location: "London",
    quote:
      "Shaadi HQ made planning our three-day wedding feel effortless. Having all our events — mehndi, shaadi, and walima — in one place, with family able to see everything, was a complete game-changer. We found our caterer and decorator through the platform too.",
  },
  {
    name: "Zainab & Omar",
    location: "Birmingham",
    quote:
      "We'd been overwhelmed trying to co-ordinate across spreadsheets and WhatsApp groups. Shaadi HQ brought everything together beautifully. The vendor search helped us find an incredible Nikah photographer we never would have found otherwise.",
  },
  {
    name: "Harpreet & Jasvir",
    location: "Leicester",
    quote:
      "The secure payments feature gave us real peace of mind — we knew every deposit was protected. The platform genuinely understands Asian weddings; it felt like it was made exactly for us.",
  },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#FAF7F5" }}
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(139,29,79,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(201,151,63,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(139,29,79,0.05) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />
      {/* Subtle geometric motif top-right */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #8B1D4F 0px,
            #8B1D4F 1px,
            transparent 1px,
            transparent 18px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left">
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
            />
            Built for Asian weddings in the UK
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6" style={{ color: "#1a0a12" }}>
            Your complete Asian{" "}
            <br className="hidden lg:block" />
            wedding{" "}
            <span style={{ color: "#C9973F" }}>OS</span>
          </h1>

          <p className="text-lg lg:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0" style={{ color: "#5a3a4a" }}>
            From mehndi to walima — plan every event, discover trusted vendors,
            and manage payments in one beautiful place. Built for Asian weddings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

        {/* Right: floating event cards */}
        <div className="flex-shrink-0 w-72 lg:w-80 relative">
          <div className="relative flex flex-col gap-0">
            {/* Timeline line */}
            <div
              className="absolute left-5 top-6 bottom-6 w-px"
              style={{ backgroundColor: "rgba(201,151,63,0.3)" }}
              aria-hidden="true"
            />

            {[
              { label: "Mehndi", date: "12 Jun", color: "#16a34a", dot: "#bbf7d0" },
              { label: "Shaadi", date: "15 Jun", color: "#8B1D4F", dot: "#C9973F" },
              { label: "Walima", date: "16 Jun", color: "#d97706", dot: "#fde68a" },
            ].map((event, i) => (
              <div key={event.label} className="relative flex items-center gap-4 py-3">
                {/* Gold timeline dot */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: event.dot, border: `2px solid ${event.color}` }}
                  aria-hidden="true"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl px-5 py-3.5 shadow-md"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid rgba(139,29,79,0.08)",
                    transform: `translateX(${i % 2 === 1 ? "8px" : "0px"})`,
                  }}
                >
                  <p className="font-semibold text-sm" style={{ color: "#1a0a12" }}>
                    {event.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#8B1D4F" }}>
                    {event.date} · London
                  </p>
                </div>
              </div>
            ))}

            {/* Bottom decoration */}
            <div
              className="mt-4 rounded-2xl px-5 py-3 text-center"
              style={{
                backgroundColor: "rgba(201,151,63,0.1)",
                border: "1px dashed rgba(201,151,63,0.4)",
              }}
            >
              <p className="text-xs font-medium" style={{ color: "#C9973F" }}>
                + 3 more events to add
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const stats = [
    { value: "2,000+", label: "Verified Vendors" },
    { value: "UK's #1", label: "Asian Wedding Platform" },
    { value: "£0", label: "Hidden Fees" },
    { value: "100%", label: "Secure Payments" },
  ];

  return (
    <section
      style={{
        backgroundColor: "#fffdf9",
        borderTop: "1px solid rgba(201,151,63,0.3)",
        borderBottom: "1px solid rgba(201,151,63,0.3)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-[rgba(139,29,79,0.12)]">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center text-center px-4">
              <span className="text-2xl font-bold" style={{ color: "#8B1D4F" }}>
                {stat.value}
              </span>
              <span className="text-sm mt-0.5" style={{ color: "#7a5060" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      icon: Calendar,
      title: "Create your wedding workspace",
      description:
        "Add all your events — mehndi, nikah, shaadi, walima — and invite family to collaborate",
      step: "01",
    },
    {
      icon: Search,
      title: "Discover trusted vendors",
      description:
        "Browse 2,000+ verified Asian wedding specialists across the UK",
      step: "02",
    },
    {
      icon: MessageSquare,
      title: "Request quotes & shortlist",
      description:
        "Send inquiries, compare quotes, and shortlist your favourites",
      step: "03",
    },
    {
      icon: Shield,
      title: "Book securely",
      description:
        "Pay deposits and milestone payments with full transaction protection",
      step: "04",
    },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: "#FAF7F5" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "#1a0a12" }}>
            Plan your entire wedding journey
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5a3a4a" }}>
            Four simple steps from first ideas to your wedding day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative flex flex-col">
                {/* Step number */}
                <span
                  className="text-6xl font-black leading-none mb-4 select-none"
                  style={{ color: "rgba(139,29,79,0.07)" }}
                  aria-hidden="true"
                >
                  {step.step}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 -mt-8"
                  style={{
                    backgroundColor: "rgba(139,29,79,0.08)",
                    border: "1px solid rgba(139,29,79,0.12)",
                  }}
                >
                  <Icon size={22} style={{ color: "#8B1D4F" }} />
                </div>

                <h3 className="font-semibold text-lg mb-2" style={{ color: "#1a0a12" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7a5060" }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#8B1D4F" }}
          >
            See how it all works in detail
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Category Section ────────────────────────────────────────────────────────

function CategorySection() {
  return (
    <section
      className="py-24"
      style={{ backgroundColor: "#fff9f5" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "#1a0a12" }}>
            Every vendor you need, in one place
          </h2>
          <p className="text-lg" style={{ color: "#5a3a4a" }}>
            2,000+ specialists across every category, all verified and reviewed
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {VENDOR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/vendors/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "white",
                border: "1px solid rgba(139,29,79,0.08)",
              }}
            >
              <span className="text-3xl" role="img" aria-hidden="true">
                {cat.icon}
              </span>
              <span
                className="text-sm font-medium leading-tight"
                style={{ color: "#3a1525" }}
              >
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-24" style={{ backgroundColor: "#FAF7F5" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "#1a0a12" }}>
            Couples who found their perfect day
          </h2>
          <p className="text-lg" style={{ color: "#5a3a4a" }}>
            Real stories from real Asian weddings across the UK
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="relative flex flex-col rounded-3xl px-8 py-8"
              style={{
                backgroundColor: "rgba(139,29,79,0.04)",
                border: "1px solid rgba(139,29,79,0.10)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="#C9973F"
                    style={{ color: "#C9973F" }}
                  />
                ))}
              </div>

              <blockquote
                className="text-base leading-relaxed flex-1 mb-6 italic"
                style={{ color: "#3a1525" }}
              >
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(139,29,79,0.12)",
                    color: "#8B1D4F",
                  }}
                  aria-hidden="true"
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#1a0a12" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8B1D4F" }}>
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Vendor CTA Section ───────────────────────────────────────────────────────

function VendorCTASection() {
  return (
    <section
      className="py-20"
      style={{
        backgroundColor: "#FAF7F5",
        borderTop: "1px solid rgba(139,29,79,0.08)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
          style={{
            background: "linear-gradient(135deg, #8B1D4F 0%, #6b1540 100%)",
          }}
        >
          {/* Left: vendor pitch */}
          <div className="px-10 py-14 lg:px-16 lg:py-16">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              For Wedding Professionals
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Are you a wedding vendor?
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
              Join 2,000+ Asian wedding specialists already on Shaadi HQ.
              Reach thousands of couples planning their perfect day, manage
              inquiries in one place, and grow your business with zero commission
              on bookings.
            </p>
            <ul className="space-y-2.5 mb-10">
              {[
                "Free to list your business",
                "Reach brides across the UK",
                "Manage quotes & bookings in one dashboard",
                "Verified badge builds instant trust",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle size={18} style={{ color: "#C9973F" }} className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "#C9973F", color: "white" }}
            >
              Join as a Vendor
            </Link>
          </div>

          {/* Right: decorative panel */}
          <div
            className="hidden lg:flex items-center justify-center p-16 relative overflow-hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
            aria-hidden="true"
          >
            {/* Geometric motif */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, rgba(201,151,63,0.15) 0%, transparent 60%),
                  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 40%)`,
              }}
            />
            <div className="relative text-center">
              <p className="text-7xl font-black text-white opacity-10 leading-none select-none">
                2,000+
              </p>
              <p className="text-white font-semibold text-xl mt-4 opacity-60">
                vendors already listed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <CategorySection />
      <TestimonialsSection />
      <VendorCTASection />
    </main>
  );
}
