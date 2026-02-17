const sharp = require('sharp');

console.log('Sharp version:', sharp.versions.sharp);
console.log('Libvips version:', sharp.versions.vips);

try {
    sharp({
        create: {
            width: 10,
            height: 10,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
    })
        .png()
        .toBuffer()
        .then(data => {
            console.log('Sharp image creation successful, buffer length:', data.length);
        })
        .catch(err => {
            console.error('Sharp image creation failed:', err);
            process.exit(1);
        });
} catch (err) {
    console.error('Sharp initialization failed:', err);
    process.exit(1);
}
