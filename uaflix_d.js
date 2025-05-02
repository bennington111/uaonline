// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.0
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

// Плагін для Lampa (uafix.net)
class UAFixPlugin {
    constructor() {
        this.name = "UAFix Online";
        this.version = "1.0";
        this.icon = "https://uafix.net/favicon.ico";
        this.domains = ["uafix.net"];
    }

    // Ініціалізація плагіна
    init() {
        lampa.plugins.register(this.name, {
            name: this.name,
            version: this.version,
            icon: this.icon,
            online: {
                search: (query) => this.search(query),
                parse: (url) => this.parsePage(url)
            }
        });
    }

    // Пошук на uafix.net
    async search(query) {
        try {
            const response = await fetch(`https://uafix.net/search?q=${encodeURIComponent(query)}`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const results = [];
            doc.querySelectorAll('.film-list .film-item').forEach(item => {
                results.push({
                    title: item.querySelector('.film-title').textContent.trim(),
                    url: item.querySelector('a').href,
                    poster: item.querySelector('img')?.src
                });
            });

            return results;
        } catch (e) {
            console.error("UAFix search error:", e);
            return [];
        }
    }

    // Парсинг сторінки з відео
    async parsePage(url) {
        try {
            const html = await fetch(url).then(res => res.text());
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Знаходимо iframe/відео
            const iframe = doc.querySelector('.player iframe');
            const videoUrl = iframe ? iframe.src : doc.querySelector('video source')?.src;

            if (!videoUrl) throw new Error("Video not found");

            return [{
                url: videoUrl,
                quality: "720p", // Автовизначення можна додати
                type: videoUrl.includes('.m3u8') ? 'hls' : 'direct'
            }];
        } catch (e) {
            console.error("UAFix parse error:", e);
            return [];
        }
    }

    // Додаємо кнопку (як у online_mod.js)
    createButton() {
        const button = document.createElement('div');
        button.className = 'full-start__button selector view--uaflix';
        button.innerHTML = `
            <div class="full-start__button selector__ico">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
            </div>
            <div class="full-start__button selector__name">Дивитися на UAFix</div>
        `;
        button.onclick = () => this.openPlayer();
        return button;
    }

    openPlayer() {
        const videoData = lampa.currentVideo; // Отримуємо дані поточного відео
        lampa.player.load({
            url: `plugin://uaflix_mod/parse?url=${encodeURIComponent(videoData.url)}`,
            title: videoData.title
        });
    }
}

// Автоматична ініціалізація при завантаженні
if (typeof lampa !== 'undefined') {
    const plugin = new UAFixPlugin();
    plugin.init();

    // Додаємо кнопку до інтерфейсу
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('.full-start__buttons');
        if (container) container.appendChild(plugin.createButton());
    });
}
