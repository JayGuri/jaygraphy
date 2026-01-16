const trips = [
  { title: "Niagara Falls", subtitle: "Mist & long exposures", date: "Jul 2024" },
  { title: "Bruce Peninsula", subtitle: "Grotto blues & cliffs", date: "Jul 2024" },
  { title: "Montreal Nights", subtitle: "Street + botanical gardens", date: "Jul 2024" },
  { title: "Toronto Days", subtitle: "Waterfront & Don Valley", date: "Jul 2024" },
  { title: "Kerala Hills", subtitle: "Tea estates & fog", date: "Jun 2025" },
  { title: "Goa Coasts", subtitle: "Tropics & golden hour", date: "Jun 2025" },
];

export function TripTimeline() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Latest Trips</p>
            <h3 className="text-2xl font-bold text-foreground">Where Jaygraphy has been</h3>
          </div>
          <span className="text-xs text-muted-foreground">Chronology</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-border/80 hidden md:block" />
          <div className="space-y-4">
            {trips.map((trip, idx) => (
              <div key={trip.title} className="relative pl-0 md:pl-12">
                <div className="hidden md:block absolute left-3 top-2 w-3 h-3 rounded-full bg-primary shadow" />
                <div className="rounded-xl border border-border bg-card/80 p-4 hover:border-primary/50 transition">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                    <span>{trip.date}</span>
                    <span className="uppercase tracking-wide text-[11px] text-primary">Series</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">{trip.title}</h4>
                  <p className="text-sm text-muted-foreground">{trip.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

