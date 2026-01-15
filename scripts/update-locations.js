const fs = require('fs');
const path = require('path');

const photosPath = path.join(process.cwd(), 'data', 'photos.json');
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    let updatedCount = 0;
    console.log(`Processing ${photos.length} photos...`);

    for (const photo of photos) {
        // Check if photo has GPS data (re-process all to ensure detailed location and varied categories)
        if (photo.exif && photo.exif.gps) {

            console.log(`Updating location for: ${photo.title} (${photo.location})`);

            try {
                const { latitude, longitude } = photo.exif.gps;

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                    {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.address) {
                        const address = data.address;

                        // Extract detailed parts
                        const specific = address.road || address.pedestrian || address.suburb || address.neighbourhood || address.residential || address.park || address.tourism || address.amenity;
                        const city = address.city || address.town || address.village || address.city_district || address.county;
                        const country = address.country;

                        let newLocation = photo.location;
                        if (specific && city && country) {
                            newLocation = `${specific}, ${city}, ${country}`;
                        } else if (city && country) {
                            newLocation = `${city}, ${country}`;
                        } else if (country) {
                            newLocation = country;
                        }

                        let updated = false;
                        if (newLocation !== photo.location) {
                            photo.location = newLocation;
                            console.log(`  -> New Location: ${newLocation}`);
                            updated = true;
                        }

                        // Do not randomize categories – keep your intentional curation

                        if (updated) {
                            updatedCount++;
                        }
                    }
                } else {
                    console.warn(`  -> HTTP Error: ${response.status} ${response.statusText}`);
                    const text = await response.text();
                    console.log("  -> Response body:", text.substring(0, 100)); // Print start of body for debug
                }

                // Be nice to the API (1s delay)
                await sleep(1000);

            } catch (error) {
                console.error(`  -> Failed to update: ${error.message}`);
            }
        }
    }

    if (updatedCount > 0) {
        fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
        console.log(`\nWrite Complete! Successfully updated ${updatedCount} photos.`);
    } else {
        console.log("\nNo photos needed updating.");
    }
})();
