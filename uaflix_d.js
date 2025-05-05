// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     2.0
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
        .online--uaflix .online__head { background: linear-gradient(90deg, rgba(0,75,130,0.8) 0%, rgba(0,120,200,0.8) 100%); }
        .online--uaflix .online__title:before { content: "UAFlix"; background: #0078c8; }
        .view--uaflix svg { color: #0078c8; }
    `;
    document.head.appendChild(style);

    // Обробник для сторінки online
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready' && e.data.component === 'online' && e.data.params.plugin === PLUGIN_ID) {
            initOnlinePage(e.data.params, e.data.object);
        }
    });

    function initOnlinePage(params, component) {
        component.html = `
            <div class="online__head">
                <div class="online__title">${params.title}</div>
            </div>
            <div class="online__content">
                <div class="online__loading">Пошук на UAFlix...</div>
            </div>
        `;

        searchMovies(params, component);
    }

    async function searchMovies(params, component) {
        try {
            const searchUrl = `${UAFLIX_DOMAIN}/index.php?do=search&subaction=search&story=${encodeURIComponent(params.search)}`;
            const html = await fetchWithProxy(searchUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const results = Array.from(doc.querySelectorAll('.sres-wrap')).map(item => {
                const link = item.querySelector('a');
                return {
                    title: link ? link.textContent.trim() : '',
                    url: link ? link.href : '',
                    poster: item.querySelector('img') ? item.querySelector('img').src : ''
                };
            }).filter(item => item.url);

            showResults(component, params, results);
        } catch (e) {
            console.error('[UAFlix] Помилка пошуку:', e);
            component.html.find('.online__loading').text('Помилка пошуку');
        }
    }

    function showResults(component, params, results) {
        let html = '';
        
        if (results.length > 0) {
            html = results.map(item => `
                <div class="online__item selector" data-url="${item.url}">
                    <div class="online__item-poster" style="background-image: url(${item.poster || ''})"></div>
                    <div class="online__item-title">${item.title}</div>
                </div>
            `).join('');
        } else {
            html = '<div class="online__empty">Нічого не знайдено</div>';
        }

        component.html.find('.online__content').html(html);
        component.html.find('.online__item').on('hover:enter', (e) => {
            const url = $(e.currentTarget).data('url');
            loadMoviePage(component, params, url);
        });
    }

    async function loadMoviePage(component, params, url) {
        component.html.find('.online__content').html('<div class="online__loading">Завантаження фільму...</div>');
        
        try {
            const html = await fetchWithProxy(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const iframe = doc.querySelector('iframe');
            if (iframe && iframe.src) {
                Lampa.Player.play({
                    url: iframe.src,
                    title: params.title,
                    type: 'movie',
                    plugin: PLUGIN_ID
                });
            } else {
                component.html.find('.online__loading').text('Відео не знайдено');
            }
        } catch (e) {
            console.error('[UAFlix] Помилка завантаження:', e);
            component.html.find('.online__loading').text('Помилка завантаження');
        }
    }

    async function fetchWithProxy(url) {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': UAFLIX_DOMAIN
            }
        });
        return await response.text();
    }

    // Додавання кнопки (як у вашому оригінальному коді)
    Lampa.Listener.follow('full', (e) => {
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
            
            button.on('hover:enter', () => {
                Lampa.Activity.push({
                    url: '',
                    title: movie.title,
                    component: 'online',
                    search: movie.title,
                    search_one: movie.original_title,
                    plugin: PLUGIN_ID,
                    movie: movie
                });
            });
        }
    });
})();
