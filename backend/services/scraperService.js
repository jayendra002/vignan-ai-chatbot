const axios = require('axios');
const cheerio = require('cheerio');
const CampusData = require('../models/CampusData');

const scrapeAndSave = async (url, category) => {
    try {
        console.log(`Starting scrape for: ${url}`);

        // 1. Fetch the HTML, but disguise ourselves as a real Google Chrome browser!
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        console.log("Successfully bypassed firewall and downloaded page!");

        const $ = cheerio.load(data);
        
        // 2. Clean the HTML
        $('script, style, nav, footer, header, noscript, iframe').remove();

        const title = $('title').text().trim() || $('h1').first().text().trim() || 'Campus Page';

        let extractedTextArray = [];
        
        // 3. Extract Meaningful Text
        $('h1, h2, h3, p, li').each((index, element) => {
            let text = $(element).text().replace(/\s+/g, ' ').trim();
            if (text.length > 20 && !extractedTextArray.includes(text)) {
                extractedTextArray.push(text);
            }
        });

        const finalContent = extractedTextArray.join('\n\n');

        if (!finalContent) {
            return { success: false, message: 'No meaningful text found on this page.' };
        }

        // 4. Save to Database
        const savedData = await CampusData.findOneAndUpdate(
            { sourceUrl: url },
            {
                title: title,
                content: finalContent,
                category: category,
                sourceUrl: url
            },
            { new: true, upsert: true } 
        );

        console.log(`Successfully saved data for: ${title}`);
        return { success: true, data: savedData };

    } catch (error) {
        // Better error logging so we know exactly what went wrong
        console.error(`Error scraping ${url}:`, error.message);
        if (error.response) {
            console.error(`Website responded with status code: ${error.response.status}`);
        }
        return { success: false, error: error.message };
    }
};

module.exports = { scrapeAndSave };