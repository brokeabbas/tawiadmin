  // tawiadmin/src/components/controlPanel/ControlPanelSidebar.tsx
  import React, { useEffect } from "react";
  import { cn } from "../reusable/atoms";

  export type ControlPanelNavItem = {
    label: string;
    targetId: string; // route segment: "agents" | "locations" | "farms" | "insights"
    hint?: string;
    badge?: string;
    icon?: React.ReactNode;
  };

  function IconX(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function IconDot(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <circle cx="12" cy="12" r="6" />
      </svg>
    );
  }

  function IconUsers(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path
          d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M4 21a8 8 0 0 1 16 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19.5 10.5a3 3 0 1 0-1.6-5.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 21a7.5 7.5 0 0 0-4.2-6.7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function IconMap(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path
          d="M9 19 3 21V5l6-2 6 2 6-2v16l-6 2-6-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 3v16" stroke="currentColor" strokeWidth="2" />
        <path d="M15 5v16" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  function IconLeaf(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path
          d="M20 4s-6.5 0-10.2 3.8C6 11.6 6 18 6 18s6.4 0 10.2-3.8C20 10.5 20 4 20 4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M10 14c1.5-1.5 4-3 8-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 18c0-3.5 1-6.5 3-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function IconChart(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path
          d="M4 19V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 19h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 15l4-4 3 3 5-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 7.5h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const defaultItems: ControlPanelNavItem[] = [
    {
      label: "Insights",
      targetId: "insights",
      hint: "Analytics • trends • exports",
      icon: <IconChart className="h-4.5 w-4.5" />,
    },
    
    {
      label: "Agents",
      targetId: "agents",
      hint: "Registration • management • assignments",
      icon: <IconUsers className="h-4.5 w-4.5" />,
    },
    {
      label: "Location Management",
      targetId: "locations",
      hint: "States/LGAs • coverage • monitoring",
      icon: <IconMap className="h-4.5 w-4.5" />,
    },
    {
      label: "Farms",
      targetId: "farms",
      hint: "Farm records • polygons • verification",
      icon: <IconLeaf className="h-4.5 w-4.5" />,
    },
  
    // ✅ NEW
    {
      label: "Cooperatives",
      targetId: "cooperatives",
      hint: "Co-ops • members • onboarding",
      icon: <IconUsers className="h-4.5 w-4.5" />,
    }
  ];

  export function ControlPanelSidebar({
    open,
    onClose,
    items = defaultItems,
    activeId,
    onSelect,
  }: {
    open: boolean;
    onClose: () => void;
    items?: ControlPanelNavItem[];
    activeId?: string;
    onSelect?: (id: string) => void;
  }) {
    useEffect(() => {
      if (!open) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    const content = (
      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-zinc-900/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_90%_30%,rgba(0,0,0,0.04),transparent_45%)]" />
        </div>

        <div className="relative flex items-center justify-between gap-3 border-b border-zinc-200/70 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/70 shadow-soft backdrop-blur">
                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
                <IconDot className="h-3.5 w-3.5 text-emerald-600" />
              </span>

              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">Tawi Admin</p>
                  <span className="rounded-full border border-zinc-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                    Ops
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-600">Control panel</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/70 p-2.5 text-zinc-900 shadow-soft backdrop-blur transition",
              "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
              "lg:hidden"
            )}
            aria-label="Close sidebar"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="relative px-4 pt-4">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Navigation
          </p>
        </div>

        <nav className="relative flex-1 overflow-hidden px-3 pb-3 pt-3">
          <div className="grid gap-2">
            {items.map((it) => {
              const active = it.targetId === activeId;

              return (
                <button
                  key={it.targetId}
                  type="button"
                  onClick={() => {
                    onSelect?.(it.targetId);
                    onClose();
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl p-3 text-left transition",
                    "ring-1 ring-inset ring-zinc-900/5",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
                    active
                      ? "bg-gradient-to-r from-emerald-50/90 via-white/80 to-white/60 ring-emerald-200/70 shadow-soft"
                      : "bg-white/55 hover:bg-white/75 hover:shadow-soft",
                    "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:rounded-r-full before:bg-emerald-600 before:transition before:duration-200",
                    active ? "before:opacity-100" : "before:opacity-0 group-hover:before:opacity-40",
                    "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_0%,rgba(16,185,129,0.16),transparent_55%)] after:opacity-0 after:transition after:duration-200",
                    active ? "after:opacity-100" : "group-hover:after:opacity-100"
                  )}
                >
                  <div className="relative flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition",
                        "ring-1 ring-inset ring-zinc-900/5",
                        active
                          ? "bg-emerald-600 text-white shadow-soft"
                          : "bg-white/70 text-zinc-700 group-hover:bg-white"
                      )}
                    >
                      {it.icon ?? <IconDot className={cn("h-4 w-4", active ? "text-white" : "text-emerald-600")} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={cn(
                            "text-sm font-semibold tracking-tight",
                            active ? "text-emerald-950" : "text-zinc-900"
                          )}
                        >
                          {it.label}
                        </p>

                        {it.badge ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              "border shadow-[0_1px_0_rgba(0,0,0,0.02)]",
                              active
                                ? "border-emerald-200/80 bg-white/80 text-emerald-700"
                                : "border-zinc-200 bg-white/70 text-zinc-700"
                            )}
                          >
                            {it.badge}
                          </span>
                        ) : null}
                      </div>

                      {it.hint ? (
                        <p
                          className={cn(
                            "mt-1 text-xs leading-5",
                            active ? "text-emerald-900/65" : "text-zinc-600"
                          )}
                        >
                          {it.hint}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="relative p-4">
          <p className="px-1 text-[10px] text-zinc-500">Secure • Audited • Least privilege</p>
        </div>
      </div>
    );

    return (
      <>
        {/* Desktop sidebar (static, full height, NO SCROLL) */}
        <aside className="hidden w-72 shrink-0 lg:block lg:h-screen">
          <div className="h-full overflow-hidden overscroll-none border-r border-zinc-200/70 bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/40">
            {content}
          </div>
        </aside>

        {/* Mobile overlay */}
        <div
          className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
          aria-hidden={!open}
        >
          <div
            className={cn("absolute inset-0 bg-black/35 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
            onClick={onClose}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-[88%] max-w-sm transition-transform duration-300 ease-out",
              open ? "translate-x-0" : "-translate-x-full"
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-full overflow-hidden overscroll-none border-r border-zinc-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/55">
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }