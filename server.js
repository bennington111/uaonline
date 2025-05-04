const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;  // Отримуємо URL через параметр
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        console.log(`UAFlix: Sending request to ${targetUrl}`);
        
        // Виконуємо запит на сторінку
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,uk;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        console.log("UAFlix: Response received from the target site.");

        // Логуємо частину HTML
        const $ = cheerio.load(response.data);
        console.log("UAFlix: Parsing HTML with cheerio.");

        // Шукаємо iframe або відео URL
        const iframe = $('iframe');
        const video = $('video');
        
        let videoUrl = null;
        
        // Якщо iframe знайдений, отримуємо його src
        if (iframe.length > 0) {
            console.log('UAFlix: Found iframe with video src');
            videoUrl = iframe.attr('src');
        }
        // Якщо відео знайдено, отримуємо його src
        if (video.length > 0 && !videoUrl) {
            console.log('UAFlix: Found video element with src');
            videoUrl = video.attr('src');
        }

        if (videoUrl) {
            console.log(`UAFlix: Video URL found: ${videoUrl}`);
            res.json({ videoUrl });
        } else {
            console.log("UAFlix: Video URL not found");
            res.status(404).json({ error: 'Video URL not found' });
        }
    } catch (error) {
        console.error('UAFlix: Error fetching the resource:', error.message);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// Запускаємо сервер на порту 3000
app.listen(port, () => {
    console.log(`CORS proxy server is running on http://localhost:${port}`);
});
