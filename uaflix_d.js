// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     2.1
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    const PLUGIN_ID = 'uaflix';
    const PLUGIN_VERSION = '2.0';
    const UAFLIX_DOMAIN = 'https://uafix.net';
    const CORS_PROXY = 'https://corsproxy.io/?';

    // Реєстрація плагіна (як у вашому оригінальному коді)
    const manifest = {
        version: PLUGIN_VERSION,
        id: PLUGIN_ID,
        name: 'UAFlix',
        description: 'Перегляд з сайту UAFlix (uafix.net)',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    // Додавання стилів
    const style = document.createElement('style');
    style.textContent = `
        .view--uaflix svg { color: #0078c8; }
    `;
    document.head.appendChild(style);

    // Додавання кнопки (як у вашому оригінальному коді)
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            const button = $(`
                <div class="full-start__button selector view--uaflix" data-subtitle="UAFlix ${PLUGIN_VERSION}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                        <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                        M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                        M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                    </svg>
                    <span>UAFlix</span>
                </div>
            `);
            
            $('.full-start__button').last().after(button);
            
            button.on('hover:enter', function() {
                loadOnline(movie);
            });
        }
    });

    // Основна функція для завантаження фільму
    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук UAFlix: ${title}`);

        try {
            const searchUrl = `${UAFLIX_DOMAIN}/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
            const html = await fetchWithProxy(searchUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const resultLink = doc.querySelector('.sres-wrap a');
            
            if (resultLink) {
                const href = resultLink.href;
                console.log('[UAFlix] Знайдено сторінку фільму:', href);

                // Завантажуємо сторінку фільму
                const filmHtml = await fetchWithProxy(href);
                const filmDoc = parser.parseFromString(filmHtml, 'text/html');
                
                // Шукаємо iframe з відео
                const iframe = filmDoc.querySelector('iframe');
                if (iframe && iframe.src) {
                    Lampa.Player.play({
                        url: iframe.src,
                        title: title,
                        type: 'movie'
                    });
                } else {
                    Lampa.Noty.show('Не вдалося знайти відео на сторінці');
                }
            } else {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
            }
        } catch (e) {
            console.error('[UAFlix] Помилка:', e);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
        }
    }

    // Функція для виконання запитів через CORS-проксі
    async function fetchWithProxy(url) {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': UAFLIX_DOMAIN
            }
        });
        return await response.text();
    }
})();
