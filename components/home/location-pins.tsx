const pins = [
  { label: "Niagara Falls", coords: "43.0792, -79.0781" },
  { label: "Bruce Peninsula", coords: "45.2451, -81.5232" },
  { label: "Toronto Waterfront", coords: "43.6423, -79.3874" },
  { label: "Old Montreal", coords: "45.5568, -73.5597" },
  { label: "Quebec City", coords: "46.8133, -71.2025" },
  { label: "Kerala Hills", coords: "10.0323, 76.8667" },
  { label: "Goa Coasts", coords: "15.5843, 73.7375" },
  { label: "Bhuj", coords: "23.2659, 69.6797" },
  { label: "Etobicoke", coords: "43.6309, -79.4715" },
];

export function LocationPins() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 rounded-full bg-primary" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pins</p>
            <h3 className="text-lg font-semibold text-foreground">Where the frames were shot</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pins.map((p) => (
            <a
              key={p.label}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.label)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full border border-border bg-card/70 text-sm text-foreground hover:border-primary hover:text-primary transition"
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

