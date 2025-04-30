// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.2
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        name: 'Uaflix',
        title: 'Uaflix',
        version: '3.2',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'view--uaflix_plugin'
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
                    <div class="online-plugin__loading-text">Пошук на ${CONFIG.title}...</div>
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
                    <div class="online-plugin__empty-icon">!</div>
                    <div class="online-plugin__empty-title">${error.message || 'Помилка завантаження'}</div>
                </div>
            `;
        }

        showEmpty() {
            return `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">∅</div>
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
                            title: item.querySelector('.online-plugin__item-title')?.textContent || CONFIG.title,
                            url: url,
                            external: true
                        });
                    }
                });
            });
        }
    }

    // Додавання кнопки через Listener.follow (як у робочому прикладі)
    function addButton() {
        const button = `
            <div class="full-start__button selector ${CONFIG.buttonClass}" data-subtitle="${CONFIG.title} ${CONFIG.version}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z" fill="currentColor"/>
                </svg>
                <span>${CONFIG.title}</span>
            </div>
        `;

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                const btn = Lampa.Template.js(button);
                btn.on('hover:enter', function() {
                    Lampa.Plugin.exec(CONFIG.name, e.data.movie, document.querySelector('.full-start__content'));
                });
                
                // Додаємо кнопку після торрент-кнопки або іншого елемента
                const target = e.object.activity.render().find('.view--torrent, .view--online_mod');
                if (target.length) {
                    target.after(btn);
                } else {
                    e.object.activity.render().find('.full-start__buttons').append(btn);
                }
            }
        });
    }

    // Ініціалізація
    function init() {
        if (!window.Lampa) return setTimeout(init, 100);
        
        // Реєстрація плагіна
        Lampa.Plugin.register(CONFIG.name, new UaflixPlugin());
        
        // Додавання кнопки
        addButton();
        
        console.log(`${CONFIG.name} v${CONFIG.version} initialized`);
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
