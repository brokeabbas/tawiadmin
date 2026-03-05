import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "../../components/reusable/atoms";

type LatLng = { lat: number; lng: number };

export type OpsMapPoint = {
  id: string;
  label: string;
  value: number;
  position: LatLng;
  meta?: string;
};

function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(t);
  }, [map]);
  return null;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function LiveOpsMap({
  title = "Live map",
  subtitle = "Operational geospatial view",
  center = { lat: 9.082, lng: 8.6753 },
  zoom = 6,
  points,
  className,
}: {
  title?: string;
  subtitle?: string;
  center?: LatLng;
  zoom?: number;
  points: OpsMapPoint[];
  className?: string;
}) {
  const max = useMemo(() => Math.max(1, ...points.map((p) => p.value)), [points]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px]",
        "border border-zinc-200/70 bg-white/55 backdrop-blur supports-[backdrop-filter]:bg-white/45",
        "shadow-soft ring-1 ring-inset ring-zinc-900/5",
        className
      )}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {title}
          </p>
          <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            nodes
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-zinc-900">
            {points.length}
          </p>
        </div>
      </div>

      {/* map */}
      <div
        className={cn(
          "relative h-[420px] w-full",
          // Leaflet control + tooltip styling (light, rounded, glassy)
          "[&_.leaflet-control-zoom]:rounded-2xl [&_.leaflet-control-zoom]:overflow-hidden",
          "[&_.leaflet-bar]:border [&_.leaflet-bar]:border-zinc-200/70 [&_.leaflet-bar]:bg-white/70 [&_.leaflet-bar]:backdrop-blur",
          "[&_.leaflet-bar_a]:text-zinc-900 [&_.leaflet-bar_a:hover]:bg-white",
          "[&_.leaflet-tooltip]:rounded-xl [&_.leaflet-tooltip]:border [&_.leaflet-tooltip]:border-zinc-200/70",
          "[&_.leaflet-tooltip]:bg-white/90 [&_.leaflet-tooltip]:text-zinc-900 [&_.leaflet-tooltip]:shadow-soft"
        )}
      >
        {/* subtle ops overlays (light) */}
        <div className="pointer-events-none absolute inset-0 z-[450] opacity-[0.10]">
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(16,185,129,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.55)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(16,185,129,0.14),transparent_55%)]" />
        </div>

        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          zoomControl={false}
          preferCanvas
          className={cn(
            "h-full w-full",
            // very light tonemapping (no dark “command” look)
            "[filter:contrast(1.02)_saturate(1.0)_brightness(1.02)]"
          )}
        >
          <MapAutoResize />
          <ZoomControl position="topright" />

          {/* Light basemap to match your app */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {points.map((p) => {
            const t = clamp(p.value / max, 0, 1);
            const radius = 5 + Math.sqrt(t) * 16;

            return (
              <CircleMarker
                key={p.id}
                center={[p.position.lat, p.position.lng]}
                radius={radius}
                pathOptions={{
                  color: "rgba(5,150,105,0.95)", // emerald-600-ish
                  weight: 1.5,
                  fillColor: "rgba(16,185,129,0.35)",
                  fillOpacity: 0.75,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.98}>
                  <div className="grid gap-0.5">
                    <div className="text-xs font-semibold">{p.label}</div>
                    <div className="text-[11px] text-zinc-700">value: {p.value}</div>
                    {p.meta ? (
                      <div className="text-[11px] text-zinc-600">{p.meta}</div>
                    ) : null}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2 backdrop-blur shadow-soft">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            intensity
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60 ring-1 ring-emerald-400/50" />
            <span className="text-[11px] text-zinc-700">higher = larger radius</span>
          </div>
        </div>
      </div>
    </div>
  );
}