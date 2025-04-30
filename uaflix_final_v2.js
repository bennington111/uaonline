// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     2.3
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація
    const CONFIG = {
        name: 'Uaflix',
        version: '2.3',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico'
    };

    // Головний клас плагіна
    class UaflixPlugin {
        constructor() {
            this.name = CONFIG.name;
            this.type = 'online';
            this.icon = CONFIG.icon;
        }

        exec(item, container) {
            this.showLoader(container);
            this.searchMovies(item.title)
                .then(movies => this.showMovies(movies, container))
                .catch(error => this.showError(error, container));
        }

        async searchMovies(query) {
            try {
                const url = `${CONFIG.host}/search?q=${encodeURIComponent(query)}`;
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
                
                if (!response.ok) throw new Error('Не вдалося завантажити дані');
                
                const html = await response.text();
                return this.parseMovies(html);
            } catch (error) {
                console.error('Помилка пошуку:', error);
                throw error;
            }
        }

        parseMovies(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = doc.querySelectorAll('.short');

            return Array.from(items).map(item => ({
                title: item.querySelector('.short-title')?.textContent.trim() || 'Без назви',
                url: this.normalizeUrl(item.querySelector('.short-link a')?.href),
                poster: item.querySelector('.short-img img')?.src,
                quality: item.querySelector('.short-quality')?.textContent.trim() || ''
            })).filter(movie => movie.url);
        }

        normalizeUrl(url) {
            if (!url) return '';
            return url.startsWith('http') ? url : `${CONFIG.host}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        showLoader(container) {
            container.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на ${CONFIG.name}...</div>
                </div>
            `;
        }

        showMovies(movies, container) {
            container.innerHTML = movies.length ? `
                <div class="online-plugin__items">
                    ${movies.map(movie => `
                        <div class="online-plugin__item" data-url="${movie.url}">
                            <img src="${movie.poster || 'https://via.placeholder.com/150x225'}" 
                                 alt="${movie.title}" 
                                 onerror="this.src='https://via.placeholder.com/150x225'">
                            <div class="online-plugin__item-title">${movie.title}</div>
                            ${movie.quality ? `<div class="online-plugin__item-quality">${movie.quality}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : this.showEmpty();
            
            this.addMovieListeners(container);
        }

        showError(error, container) {
            container.innerHTML = `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <div class="online-plugin__empty-title">Помилка: ${error.message || 'Невідома помилка'}</div>
                </div>
            `;
        }

        showEmpty() {
            return `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24">
                            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>
                        </svg>
                    </div>
                    <div class="online-plugin__empty-title">Нічого не знайдено</div>
                </div>
            `;
        }

        addMovieListeners(container) {
            container.querySelectorAll('.online-plugin__item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    if (url) {
                        Lampa.Player.play({
                            title: item.querySelector('.online-plugin__item-title')?.textContent || CONFIG.name,
                            url: url,
                            external: true
                        });
                    }
                });
            });
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!window.Lampa) return setTimeout(initPlugin, 500);
        
        // Реєстрація плагіна
        Lampa.Plugin.register(CONFIG.name, new UaflixPlugin());
        
        // Додавання кнопки через API Lampa
        Lampa.MenuManager.addProvider({
            name: CONFIG.name,
            icon: CONFIG.icon,
            component: (item) => {
                return {
                    template: `
                        <div class="online-plugin">
                            <div class="online-plugin__content"></div>
                        </div>
                    `,
                    created() {
                        Lampa.Plugin.exec(CONFIG.name, item, this.$el.querySelector('.online-plugin__content'));
                    }
                };
            }
        });
        
        console.log(`${CONFIG.name} v${CONFIG.version} ініціалізовано`);
    }

    // Запуск
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('load', initPlugin);
    }
})();
