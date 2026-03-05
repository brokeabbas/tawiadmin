// tawiadmin/src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, cn } from "../components/reusable/atoms";
import logo from "../assets/logo.png";

const AUTH_KEY = "tawi_admin_authed";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: connect to auth API
      console.log("Admin login:", { email, password, remember });

      await new Promise((r) => setTimeout(r, 650));

      // simple auth flag for now
      localStorage.setItem(AUTH_KEY, "1");

      // ✅ go to admin dashboard
      navigate("/control-panel", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background (same theme) */}
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
        @keyframes tawiIn {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>

      {/* ✅ Top-left plain logo */}
      <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className={cn(
            "inline-flex items-center rounded-xl p-1.5",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30"
          )}
          aria-label="Go to home"
        >
          <img
            src={logo}
            alt="Tawi"
            className="h-12 w-auto object-contain sm:h-14 lg:h-16"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </button>
      </div>

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

      <main className="relative z-10 flex min-h-screen items-center px-4 py-12 sm:px-6 lg:px-10">
        <div
          className="mx-auto w-full max-w-6xl motion-reduce:animate-none"
          style={{ animation: "tawiIn 260ms ease-out both" }}
        >
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left */}
            <section className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/35 p-7 shadow-soft backdrop-blur sm:p-8">
                <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/35 px-3 py-1 text-xs font-semibold text-zinc-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Tawi Admin Console
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-100">
                    Oversight and control.
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-300/80">
                    Manage verification, track location activity, and export audit-ready reports —
                    all from one secure admin workspace.
                  </p>

                  <div className="mt-7 grid gap-3">
                    {[
                      {
                        t: "Verification workflow",
                        d: "Approve, flag, and keep evidence consistent across locations.",
                      },
                      {
                        t: "Operational visibility",
                        d: "Monitor activity and spot anomalies early.",
                      },
                      {
                        t: "Reporting",
                        d: "Generate clean, traceable exports for audits and stakeholders.",
                      },
                    ].map((x) => (
                      <div
                        key={x.t}
                        className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4"
                      >
                        <p className="text-sm font-semibold text-zinc-100">{x.t}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-300/75">{x.d}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
                    <p className="text-xs text-zinc-300/70">
                      Tip: Start your day by clearing the verification queue to keep field ops moving.
                    </p>
                  </div>

                  <p className="mt-5 text-xs text-zinc-300/55">
                    © {new Date().getFullYear()} • Tawi • Internal use
                  </p>
                </div>
              </div>
            </section>

            {/* Right: Login */}
            <section className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/55 p-6 shadow-soft backdrop-blur sm:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                      Log in to Admin
                    </h2>
                    <p className="mt-1 text-sm text-zinc-300/80">
                      Use your admin credentials to access workflows and reporting.
                    </p>
                  </div>

                  <span className="mt-0.5 inline-flex items-center rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1 text-xs font-medium text-zinc-200/90">
                    Admin
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { t: "Secure", d: "Encrypted session" },
                    { t: "Audit-ready", d: "Traceable actions" },
                    { t: "Controlled", d: "Permissioned access" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-2xl border border-white/10 bg-zinc-950/25 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-zinc-100">{x.t}</p>
                      <p className="mt-0.5 text-xs text-zinc-300/70">{x.d}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-100" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "h-11 rounded-2xl border border-white/10 bg-zinc-950/30 px-3 text-sm text-zinc-100 outline-none transition",
                        "placeholder:text-zinc-400/60",
                        "focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/15"
                      )}
                      placeholder="admin@tawi.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-100" htmlFor="password">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          "h-11 w-full rounded-2xl border border-white/10 bg-zinc-950/30 px-3 pr-14 text-sm text-zinc-100 outline-none transition",
                          "placeholder:text-zinc-400/60",
                          "focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/15"
                        )}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1.5 text-xs font-medium transition",
                          "text-zinc-300/80 hover:bg-white/5 hover:text-zinc-100",
                          "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
                        )}
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-300/80">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-950/30 text-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      className="rounded-lg px-1 py-1 text-sm font-medium text-zinc-200/80 transition hover:text-zinc-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
                      onClick={() => alert("Hook this to your reset flow")}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "mt-2 w-full rounded-2xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300",
                      "shadow-soft hover:shadow-md transition"
                    )}
                  >
                    {submitting ? "Logging in..." : "Log in"}
                  </Button>

                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-2xl border border-white/10 bg-zinc-950/20 py-2.5 text-sm font-medium transition",
                      "text-zinc-100 hover:bg-white/5",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
                    )}
                    onClick={() => navigate("/", { replace: true })}
                  >
                    Back to Home
                  </button>

                  <p className="pt-1 text-center text-xs text-zinc-300/60">
                    This portal is restricted to authorized personnel.
                  </p>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}