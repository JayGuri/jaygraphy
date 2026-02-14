import { getPhotoById, savePhoto } from "@/lib/photo-storage";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await getPhotoById(id);
  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  let body: { coordinates?: { lat: number; lng: number }; location?: string };
  try {
    body = await _request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { coordinates, location } = body;
  if (!coordinates || typeof coordinates.lat !== "number" || typeof coordinates.lng !== "number") {
    return NextResponse.json(
      { error: "Body must include coordinates: { lat: number, lng: number }" },
      { status: 400 }
    );
  }

  let resolvedLocation = location ?? photo.location;
  if (location == null || location === "Unknown Location") {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=10`,
        {
          headers: {
            "User-Agent": "Jaygraphy/1.0 (photography portfolio)",
          },
        }
      );
      if (res.ok) {
        const data = (await res.json()) as { address?: Record<string, string> };
        const addr = data?.address;
        if (addr) {
          const specific = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.park || addr.tourism;
          const city = addr.city || addr.town || addr.village || addr.county;
          const country = addr.country;
          if (specific && city && country) resolvedLocation = `${specific}, ${city}, ${country}`;
          else if (city && country) resolvedLocation = `${city}, ${country}`;
          else if (country) resolvedLocation = country;
          else resolvedLocation = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
        } else {
          resolvedLocation = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
        }
      } else {
        resolvedLocation = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
      }
    } catch {
      resolvedLocation = `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
    }
  }

  const updated = {
    ...photo,
    coordinates: { lat: coordinates.lat, lng: coordinates.lng },
    location: resolvedLocation,
    exif: {
      ...photo.exif,
      gps: {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        ...(photo.exif?.gps?.altitude != null && { altitude: photo.exif.gps.altitude }),
      },
    },
  };

  await savePhoto(updated);
  return NextResponse.json({ photo: updated });
}
