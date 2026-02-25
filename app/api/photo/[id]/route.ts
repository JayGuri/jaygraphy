import { NextRequest, NextResponse } from "next/server";
import { getPhotoById } from "@/lib/supabase/photo-storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo || !photo.cdnSrc) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Redirect to the actual CDN URL
  return NextResponse.redirect(photo.cdnSrc);
}

