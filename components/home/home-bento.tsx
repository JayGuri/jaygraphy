import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { MapPin, CalendarClock, Camera, Zap, Layers } from "lucide-react";

export function HomeBento() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 grid gap-4 lg:grid-cols-4 auto-rows-[1fr]">
        <GlassCard className="p-6 bg-card/85 border border-border/70 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Camera className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Portfolio</p>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">New sets from Niagara & Bruce</h3>
          <p className="text-sm text-muted-foreground mb-4">Water, cliffs, long exposures, and soft blue hours.</p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shimmer"
          >
            View Gallery →
          </Link>
        </GlassCard>

        <GlassCard className="p-6 bg-card/85 border border-border/70">
          <div className="flex items-center gap-3 mb-2 text-cyan-400">
            <Layers className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Series</p>
          </div>
          <h4 className="text-lg font-semibold text-foreground">Series filter</h4>
          <p className="text-sm text-muted-foreground">Use the “Series” filter on the portfolio to jump to Niagara, Bruce, Montreal, Toronto, Goa, or Kerala.</p>
        </GlassCard>

        <GlassCard className="p-6 bg-card/85 border border-border/70">
          <div className="flex items-center gap-3 mb-2 text-amber-400">
            <CalendarClock className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Timeline</p>
          </div>
          <h4 className="text-lg font-semibold text-foreground">Trip chronology</h4>
          <p className="text-sm text-muted-foreground">Scroll down for the Latest Trips timeline—see where and when the sets were shot.</p>
        </GlassCard>

        <GlassCard className="p-6 bg-card/85 border border-border/70">
          <div className="flex items-center gap-3 mb-2 text-emerald-400">
            <MapPin className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Map Pins</p>
          </div>
          <h4 className="text-lg font-semibold text-foreground">Open locations</h4>
          <p className="text-sm text-muted-foreground">Quick pins for Niagara, Bruce, Toronto, Montreal, Quebec, Kerala, and Goa.</p>
        </GlassCard>

        <GlassCard className="p-6 bg-card/85 border border-border/70">
          <div className="flex items-center gap-3 mb-2 text-pink-400">
            <Zap className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Lightbox actions</p>
          </div>
          <h4 className="text-lg font-semibold text-foreground">Share & download</h4>
          <p className="text-sm text-muted-foreground">In the lightbox: fullscreen (F), download, and copy link to share shots instantly.</p>
        </GlassCard>
      </div>
    </section>
  );
}

