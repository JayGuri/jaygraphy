import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { SupabasePhoto } from "../lib/supabase/types";

// Create our own Supabase admin client for the migration script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

console.log("Supabase URL:", JSON.stringify(supabaseUrl)); 

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

(async () => {
  const { error } = await supabaseAdmin.from("photos").select("id").limit(1);
  if (error) {
    console.error("Test DB query failed:", error);
    process.exit(1);
  } else {
    console.log("Test DB query OK");
  }
})();

async function migrate() {
  console.log("🚀 Starting migration to Supabase...\n");

  // Read old photos.json
  const photosPath = path.join(process.cwd(), "data", "photos.json");

  if (!fs.existsSync(photosPath)) {
    console.error("❌ data/photos.json not found");
    return;
  }

  const oldPhotos = JSON.parse(fs.readFileSync(photosPath, "utf-8"));
  console.log(`📁 Found ${oldPhotos.length} photos to migrate\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const [index, photo] of oldPhotos.entries()) {
    const num = index + 1;
    console.log(`\n[${num}/${oldPhotos.length}] Processing: ${photo.title}`);

    // Check if already in Supabase
    const { data: existing } = await supabaseAdmin
      .from("photos")
      .select("id")
      .eq("id", photo.id)
      .single();

    if (existing) {
      console.log("   ⏭️  Already in Supabase, skipping");
      skipCount++;
      continue;
    }

    // Read image file
    // photo.src is typically like "/photos/filename.jpg" – normalise to relative path
    const srcPath: string = photo.src || "";
    const relativeSrc =
      srcPath.startsWith("/") || srcPath.startsWith("\\")
        ? srcPath.replace(/^[/\\]+/, "")
        : srcPath;
    const filePath = path.join(process.cwd(), "public", relativeSrc);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${photo.src}`);
      failCount++;
      continue;
    }

    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(filePath);
      const filename = path.basename(relativeSrc);

      console.log(
        `   📤 Uploading ${filename} (${(
          fileBuffer.length /
          1024 /
          1024
        ).toFixed(2)} MB)...`
      );

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(filename, fileBuffer, {
          contentType: "image/jpeg",
          upsert: true, // Allow overwrite if exists
        });

      if (uploadError) {
        console.error("   ❌ Upload failed:", uploadError.message);
        failCount++;
        continue;
      }

      console.log(`   ✓ Uploaded to storage: ${uploadData.path}`);

      // Prepare database row
      const supabasePhoto: Partial<SupabasePhoto> = {
        id: photo.id,
        title: photo.title,
        display_title: photo.displayTitle || photo.title,
        category: photo.category || "other",
        series: photo.series,
        tags: photo.tags || [],
        storage_path: uploadData.path,
        width: photo.width || 0,
        height: photo.height || 0,
        blur_data_url: photo.blurDataURL,
        location: photo.location || "Unknown Location",
        coordinates: photo.coordinates,
        dms: photo.dms,
        exif: photo.exif || {},
        metadata: photo.metadata,
        confidence: photo.confidence,
        description: photo.description,
        behind_the_shot: photo.behindTheShot,
        exif_toggle_hidden: photo.exifToggleHidden || false,
        uploaded_at: photo.uploadedAt || new Date().toISOString(),
        taken_at: photo.takenAt,
      };

      // Insert into database
      const { error: dbError } = await supabaseAdmin
        .from("photos")
        .insert(supabasePhoto);

      if (dbError) {
        console.error("   ❌ Database insert failed:", dbError.message);
        failCount++;
        continue;
      }

      console.log("   ✓ Inserted into database");
      successCount++;
    } catch (error: any) {
      console.error("   ❌ Migration failed:", error.message);
      failCount++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Already existed (skipped): ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total processed: ${oldPhotos.length}`);
  console.log("=".repeat(60));

  if (successCount > 0) {
    console.log("\n🎉 Migration complete!");
    console.log("\n💡 Next steps:");
    console.log("   1. Visit http://localhost:3000/portfolio to see your photos");
    console.log("   2. Verify everything looks correct");
    console.log("   3. Keep data/photos.json as backup (rename to .backup)");
    console.log("   4. Keep public/photos/ as backup (move to backup folder)");
  }
}

migrate().catch((error) => {
  console.error("\n💥 Migration crashed:", error);
  process.exit(1);
});

