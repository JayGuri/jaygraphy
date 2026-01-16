import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export function MapCta() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/80 border border-border/70">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Map View</p>
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Shoots Across Canada & India
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Explore key locations: Bruce Peninsula, Niagara Falls, Toronto, Montreal, Kerala hills, and Goa coasts.
            </p>
          </div>
          <Link
            href="https://www.google.com/maps/search/?api=1&query=Niagara+Falls"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shimmer"
          >
            Open in Maps <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    </section>
  );
}

