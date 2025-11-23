// embed_images.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Define your directories relative to the execution root (which is the runner root)
const RAW_DAYS_DIR = 'raw_src/raw_days';
const RAW_IMAGES_DIR = 'raw_src/raw_days/images'; // Assuming images are here


console.log('Starting image embedding...');

// Get all raw HTML files
const htmlFiles = fs.readdirSync(RAW_DAYS_DIR).filter(f => f.endsWith('.html'));

htmlFiles.forEach(fileName => {
    const filePath = path.join(RAW_DAYS_DIR, fileName);
    let htmlContent = fs.readFileSync(filePath, 'utf8');

    // Use JSDOM to safely parse and manipulate HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Find all <img> tags
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (!src) return;

        // 1. Resolve the path (assuming the raw HTML uses relative path like: ../images/1.JPG)
        // Adjust this path resolution based on how your raw HTML references the images!
        const imagePath = path.join(RAW_IMAGES_DIR, path.basename(src));

        if (!fs.existsSync(imagePath)) {
            console.warn(`[WARN] Image not found: ${imagePath} for ${fileName}. Skipping.`);
            return;
        }

        const mimeType = path.extname(imagePath).toLowerCase() === '.jpg' ? 'image/jpeg' : 'image/png';
        
        // 2. Read the image and convert to Base64
        const imageData = fs.readFileSync(imagePath);
        const base64Data = imageData.toString('base64');
        
        // 3. Create the Data URI
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        
        // 4. Replace the original src attribute
        img.setAttribute('src', dataUri);
        console.log(`[INFO] Embedded image in ${fileName}: ${imagePath}`);
    });

    // Write the modified HTML back to the file
    fs.writeFileSync(filePath, dom.serialize());
});

console.log('Image embedding complete.');