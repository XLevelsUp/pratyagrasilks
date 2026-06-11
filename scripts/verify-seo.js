const http = require('http');

// Get port or base URL from command line arguments (e.g. node scripts/verify-seo.js 3000)
const arg = process.argv[2] || '3000';
const baseUrl = arg.startsWith('http') ? arg : `http://localhost:${arg}`;

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log(`--- SEO Verification Started (Target: ${baseUrl}) ---`);

    // 1. Verify /collection
    try {
        const res = await fetchUrl(`${baseUrl}/collection`);
        console.log('\n[1] /collection page:');
        console.log('  Status:', res.status);
        
        const robotsMatch = res.body.match(/<meta[^>]*name=["']robots["'][^>]*>/i);
        console.log('  Robots Meta:', robotsMatch ? robotsMatch[0] : 'NOT FOUND');

        const h1Match = res.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        console.log('  Static H1:', h1Match ? h1Match[1].trim() : 'NOT FOUND');

        const descMatch = res.body.includes('Explore handwoven Kanjivaram, Muga, Tussar and Georgette silk sarees');
        console.log('  Static Description Present:', descMatch ? 'YES' : 'NO');
    } catch (e) {
        console.error('Error fetching /collection:', e.message);
    }

    // 2. Verify /silk/muga-silk
    try {
        const res = await fetchUrl(`${baseUrl}/silk/muga-silk`);
        console.log('\n[2] /silk/muga-silk page:');
        console.log('  Status:', res.status);
        const robotsMatch = res.body.match(/<meta[^>]*name=["']robots["'][^>]*>/i);
        console.log('  Robots Meta:', robotsMatch ? robotsMatch[0] : 'NOT FOUND');
    } catch (e) {
        console.error('Error fetching /silk/muga-silk:', e.message);
    }

    // 3. Verify /silk/georgette-silk
    try {
        const res = await fetchUrl(`${baseUrl}/silk/georgette-silk`);
        console.log('\n[3] /silk/georgette-silk page:');
        console.log('  Status:', res.status);
        const robotsMatch = res.body.match(/<meta[^>]*name=["']robots["'][^>]*>/i);
        console.log('  Robots Meta:', robotsMatch ? robotsMatch[0] : 'NOT FOUND');
    } catch (e) {
        console.error('Error fetching /silk/georgette-silk:', e.message);
    }

    // 4. Verify /sitemap.xml
    try {
        const res = await fetchUrl(`${baseUrl}/sitemap.xml`);
        console.log('\n[4] /sitemap.xml check:');
        console.log('  Status:', res.status);

        // Find collection priority
        const collectionIndex = res.body.indexOf('<loc>https://pratyagrasilks.com/collection</loc>');
        if (collectionIndex !== -1) {
            const chunk = res.body.substring(collectionIndex, collectionIndex + 300);
            const priorityMatch = chunk.match(/<priority>([\d.]+)<\/priority>/);
            console.log('  /collection priority in sitemap:', priorityMatch ? priorityMatch[1] : 'NOT FOUND');
        } else {
            console.log('  /collection NOT FOUND in sitemap');
        }

        // Find muga-silk priority
        const mugaIndex = res.body.indexOf('<loc>https://pratyagrasilks.com/silk/muga-silk</loc>');
        if (mugaIndex !== -1) {
            const chunk = res.body.substring(mugaIndex, mugaIndex + 300);
            const priorityMatch = chunk.match(/<priority>([\d.]+)<\/priority>/);
            console.log('  /silk/muga-silk priority in sitemap:', priorityMatch ? priorityMatch[1] : 'NOT FOUND');
        } else {
            console.log('  /silk/muga-silk NOT FOUND in sitemap');
        }

        // Find georgette-silk priority
        const georgetteIndex = res.body.indexOf('<loc>https://pratyagrasilks.com/silk/georgette-silk</loc>');
        if (georgetteIndex !== -1) {
            const chunk = res.body.substring(georgetteIndex, georgetteIndex + 300);
            const priorityMatch = chunk.match(/<priority>([\d.]+)<\/priority>/);
            console.log('  /silk/georgette-silk priority in sitemap:', priorityMatch ? priorityMatch[1] : 'NOT FOUND');
        } else {
            console.log('  /silk/georgette-silk NOT FOUND in sitemap');
        }
    } catch (e) {
        console.error('Error fetching /sitemap.xml:', e.message);
    }

    console.log('\n--- SEO Verification Finished ---');
    process.exit(0);
}

verify();
