# Jaygraphy

**Engineering & Photography** — A personal photography portfolio built with Next.js, featuring curated galleries, EXIF-aware uploads, AI-powered image analysis, and an interactive map of capture locations.

---

## Overview

Jaygraphy is a full-stack photography portfolio that showcases work across street, nature, city, portrait, and landscape. It includes:

- **Curated portfolio** — Filter by series/category, search, and lightbox with EXIF details
- **Upload pipeline** — Drag-and-drop uploads with automatic EXIF extraction, HEIC→JPEG conversion, and Sharp-based compression
- **AI analysis** — Optional image classification (category, tags, lighting, mood) for tagging
- **Map view** — Interactive map (Leaflet/3D) of photo locations using GPS from EXIF
- **Favorites** — Session-based favorites for quick browsing
- **Contact** — Simple contact form with API endpoint

The site is themed (dark/light/system), responsive, and uses Framer Motion and custom UI (Magic Bento, glass cards, animated background) for a polished experience.

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion, GSAP |
| **Maps / 3D** | Leaflet, Leaflet.markercluster, globe.gl, Cesium, Three.js (@react-three/fiber, @react-three/drei) |
| **Images** | Sharp, exifr, next/image with blur placeholders |
| **AI** | @xenova/transformers (image classification) |
| **Other** | next-themes, react-dropzone, heic-convert, uuid, lucide-react |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm**, **yarn**, **pnpm**, or **bun**

### Install & run

```bash
# Clone the repo (if not already)
git clone <repo-url>
cd photography-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app reads photos from `data/photos.json` and serves images from `public/photos/`. If `data/photos.json` is missing, it is created on first run.

### Build & production

```bash
npm run build
npm start
```

---

## Project Structure

```
photography-portfolio/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home (hero, bento, recently added, stories, map CTA, timeline)
│   ├── layout.tsx          # Root layout, theme, navbar, footer
│   ├── portfolio/          # Portfolio grid + filters
│   ├── map/                # Map view (photo locations)
│   ├── about/              # About / bio
│   ├── contact/            # Contact form
│   ├── upload/             # Photo upload (dropzone + EXIF)
│   ├── analyze/            # AI image analysis (category/tags)
│   ├── favorites/          # Session favorites
│   └── api/
│       ├── upload/         # POST: upload photo, EXIF, HEIC→JPEG, save to photos.json
│       ├── analyze/        # POST: classify image (category, tags, confidence)
│       ├── contact/        # POST: contact form handler
│       └── photos/[id]/    # GET: single photo by id
├── components/             # React components (home, portfolio, map, upload, layout, ui)
├── lib/                    # Core logic
│   ├── photo-storage.ts    # Read/write photos.json, ensure dirs, cache
│   ├── cdn.ts              # CDN URL building (optional env)
│   ├── series.ts           # Infer series from photo metadata
│   ├── title.ts            # Auto/clean titles
│   └── image-classifier.ts # AI classification
├── data/
│   └── photos.json         # Source of truth for all photos
├── public/
│   └── photos/             # Uploaded image files
└── types/
    └── photo.ts            # Photo type and form type
```

---

## Data Model

Each entry in `data/photos.json` follows the `Photo` type:

- **Identity:** `id`, `title`, `category`, optional `series`, `location`
- **Media:** `src` (path under `/photos/`), `width`, `height`, `blurDataURL`
- **Time:** `uploadedAt`, `takenAt`
- **EXIF:** `exif` (make, model, lens, focalLength, aperture, exposureTime, iso, gps, etc.)
- **Tags / AI:** `tags[]`, `metadata` (lighting, mood, composition), `confidence`

Uploads add new photos and append to `photos.json`; the app uses in-memory caching with a short TTL for reads.

---

## Environment Variables (optional)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CDN_BASE` | Base URL for image CDN (e.g. `https://cdn.example.com`). If set, photo `src` values are prefixed with this. |
| `NEXT_PUBLIC_CDN_PROXY` | Proxy URL for images (e.g. `https://wsrv.nl/?url=`). Used when no CDN base is set to proxy local images. |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for building proxy URLs. On Vercel, `VERCEL_URL` is used if this is not set. |

No env vars are required for local development; photos are served from `public/photos/` and relative paths.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

---

## Features in Brief

- **Home:** Hero, Magic Bento gallery, recently added strip, featured stories, location pins, trip timeline
- **Portfolio:** Masonry-style grid, filter by series/category, search by title, lightbox with EXIF and metadata
- **Map:** Pins from photo GPS (EXIF); clusters; optional 3D globe
- **Upload:** Multi-file dropzone, EXIF parsing, HEIC→JPEG, resize/compress (e.g. max 2400px, JPEG 85), blur placeholder generation
- **Analyze:** Drag-and-drop or file picker; sends image to `/api/analyze` and displays category, tags, confidence (for pre-upload tagging or experimentation)
- **Favorites:** Stored in session (e.g. localStorage); grid of favorited photos
- **Contact:** Client form POSTs to `/api/contact` (implement your own email/slack logic there)
- **Theming:** Dark / light / system via `next-themes`

---

## License

Private project. All rights reserved unless otherwise stated.

---

*Built by an engineering student who prefers shooting and shipping over just talking about it.*
