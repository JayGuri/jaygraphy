const fs = require('fs');
const path = require('path');

async function test() {
    const imagePath = path.join(process.cwd(), 'public', 'photos', '00201ff8-a59d-4f4e-9be2-867a8de49343-IMG_9824.jpg');

    if (!fs.existsSync(imagePath)) {
        console.error('Test image not found:', imagePath);
        return;
    }

    const blob = new Blob([fs.readFileSync(imagePath)]);
    const formData = new FormData();
    formData.append('file', blob, 'test.jpg');

    try {
        const res = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            console.error('Status:', res.status);
            console.error('Text:', await res.text());
            return;
        }

        const data = await res.json();
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
