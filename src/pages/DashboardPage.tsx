import { useNavigate } from "react-router-dom";
import { Button, cn } from "../components/reusable/atoms";
import logo from "../assets/logo.png";

function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/45 p-4 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-zinc-900/60">
      <p className="text-sm font-semibold text-zinc-100">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-300/70">{desc}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background (unchanged) */}
      <style>{`
        @keyframes tawiGradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes tawiFloat {
          0%   { transform: translate3d(0,0,0); }
          50%  { transform: translate3d(0,-14px,0); }
          100% { transform: translate3d(0,0,0); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(34,197,94,0.20), rgba(161,98,7,0.14), rgba(16,185,129,0.12), rgba(9,9,11,0.0))",
            backgroundSize: "240% 240%",
            animation: "tawiGradientShift 16s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-1/2 top-[-320px] h-[760px] w-[760px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(34,197,94,0.18), rgba(9,9,11,0) 60%)",
            animation: "tawiFloat 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute right-[-260px] top-[18%] h-[560px] w-[560px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(161,98,7,0.12), rgba(9,9,11,0) 60%)",
            animation: "tawiFloat 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-260px] left-[-260px] h-[560px] w-[560px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(34,197,94,0.10), rgba(9,9,11,0) 60%)",
            animation: "tawiFloat 11s ease-in-out infinite",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, rgba(255,255,255,0.00) 1px, rgba(255,255,255,0.00) 14px)",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,9,11,0)_0%,rgba(9,9,11,0.55)_70%,rgba(9,9,11,0.9)_100%)]" />
      </div>

      {/* centered layout wrapper */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="shrink-0">
          <PageContainer className="flex items-center justify-between py-5">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className={cn(
                "inline-flex items-center gap-3 rounded-2xl",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
              )}
              aria-label="Go to home"
            >
              {/* ✅ Logo displayed exactly like your ReusableNav */}
              <img
  src={logo}
  alt="Tawi"
  className="h-16 w-auto object-contain sm:h-20 lg:h-24 xl:h-28"
  loading="eager"
  decoding="async"
  draggable={false}
/>

              <div className="hidden sm:block leading-tight text-left">
                <div className="text-sm font-semibold tracking-tight text-zinc-100">
                  TAWI Admin
                </div>
                <div className="text-xs text-zinc-300/70">
                  Operations • Verification • Reporting
                </div>
              </div>
            </button>


          </PageContainer>
        </header>

        {/* Main (centered) */}
        <main className="flex flex-1 items-center">
          <PageContainer className="w-full py-10 md:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              {/* Left */}
              <section>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1 text-xs font-semibold text-zinc-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  TAWI Admin Panel • Oversight • Audit-ready
                </div>

                <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-100 sm:text-5xl">
                  TAWI <span className="text-emerald-200">Admin Panel</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300/80 md:text-[17px]">
                  Oversee everything going on across Tawi — manage locations, review verification,
                  and generate operational reports with consistent, traceable records.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => navigate("/login")}
                    className={cn(
                      "rounded-2xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300",
                      "shadow-soft hover:shadow-md transition"
                    )}
                  >
                    Log in to Admin
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => navigate("/", { replace: true })}
                    className={cn(
                      "rounded-2xl border border-white/10 bg-zinc-950/20 text-zinc-100",
                      "hover:bg-white/5 transition"
                    )}
                  >
                    Back to Home
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <FeatureCard
                    title="Verification at scale"
                    desc="Review evidence, flag issues, and keep records consistent across sites."
                  />
                  <FeatureCard
                    title="Operational visibility"
                    desc="Monitor activity by location and catch anomalies early."
                  />
                  <FeatureCard
                    title="Offline-first workflows"
                    desc="Built for field conditions—sync when connectivity returns."
                  />
                  <FeatureCard
                    title="Audit-ready exports"
                    desc="Generate reports that stay clean, consistent, and traceable."
                  />
                </div>

                <p className="mt-7 text-xs text-zinc-300/70">
                  Built for <span className="font-semibold text-zinc-100">Tawi Farms</span> — field efficiency,
                  verification accuracy, and traceable records.
                </p>
              </section>

              {/* Right */}
              <section className="lg:justify-self-end">
                <div className="rounded-3xl border border-white/10 bg-zinc-900/55 p-6 shadow-soft backdrop-blur sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                        Admin access
                      </h2>
                      <p className="mt-1 text-sm text-zinc-300/75">
                        Sign in to oversee workflows, queues, and reporting.
                      </p>
                    </div>

                    <span className="inline-flex items-center rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1 text-xs font-medium text-zinc-200/90">
                      Admin
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      { t: "Verification queue", d: "Approve, flag, and ensure quality." },
                      { t: "Location overview", d: "Performance snapshots by site." },
                      { t: "Reporting", d: "Exports for audits and stakeholders." },
                    ].map((x) => (
                      <div
                        key={x.t}
                        className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4"
                      >
                        <p className="text-sm font-semibold text-zinc-100">{x.t}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-300/70">{x.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </PageContainer>
        </main>
      </div>
    </div>
  );
}