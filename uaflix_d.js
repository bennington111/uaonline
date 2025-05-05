// ==UserScript==
// @name UAFIX Online
// @version 1.0.6
// @author YourName
// @description Плагін для перегляду контенту з uafix.net
// @icon https://uafix.net/favicon.ico
// ==/UserScript==

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

    class UaflixPlugin {
        constructor() {
            this.name = 'UAFlix';
            this.id = PLUGIN_ID;
            this.type = 'online';
            this.version = PLUGIN_VERSION;
            this.cache = {};
        }

        init() {
            this.addStyles();
            Lampa.Player.listener.follow('app', (e) => {
                if (e.type == 'ready' && e.data.component == 'online') {
                    this.onReadyOnline(e.data.params);
                }
            });
        }

        addStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .online--uaflix .online__head { background: linear-gradient(90deg, rgba(0,75,130,0.8) 0%, rgba(0,120,200,0.8) 100%); }
                .online--uaflix .online__title:before { content: "UAFlix"; background: #0078c8; }
            `;
            document.head.appendChild(style);
        }

        onReadyOnline(params) {
            if (params.plugin == PLUGIN_ID) {
                this.create(params);
            }
        }

        create(params) {
            const component = params.object;
            
            component.html = `
                <div class="online__head">
                    <div class="online__title"></div>
                </div>
                <div class="online__content">
                    <div class="online__loading">Завантаження...</div>
                </div>
            `;

            component.start = () => {
                this.loadData(component, params);
            };

            component.start();
        }

        async loadData(component, params) {
            try {
                const searchUrl = `${UAFLIX_DOMAIN}/index.php?do=search&subaction=search&story=${encodeURIComponent(params.search)}`;
                const html = await this.fetchWithProxy(searchUrl);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const results = Array.from(doc.querySelectorAll('.sres-wrap')).map(item => {
                    const link = item.querySelector('a');
                    const title = link ? link.textContent.trim() : '';
                    const url = link ? link.href : '';
                    const poster = item.querySelector('img') ? item.querySelector('img').src : '';
                    
                    return { title, url, poster };
                }).filter(item => item.url);

                this.showResults(component, params, results);
            } catch (e) {
                console.error('[UAFlix] Помилка:', e);
                component.html.find('.online__loading').text('Помилка завантаження');
            }
        }

        showResults(component, params, results) {
            let html = '';
            
            if (results.length) {
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
                this.loadMovie(component, params, url);
            });
        }

        async loadMovie(component, params, url) {
            component.html.find('.online__content').html('<div class="online__loading">Завантаження фільму...</div>');
            
            try {
                const html = await this.fetchWithProxy(url);
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
                    component.html.find('.online__loading').text('Не вдалося знайти відео');
                }
            } catch (e) {
                console.error('[UAFlix] Помилка:', e);
                component.html.find('.online__loading').text('Помилка завантаження фільму');
            }
        }

        async fetchWithProxy(url) {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': UAFLIX_DOMAIN
                }
            });
            return await response.text();
        }
    }

    // Реєстрація плагіна
    Lampa.Plugin.register(new UaflixPlugin());

    // Додавання кнопки
    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complete') {
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
