// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     2.2
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
        version: '2.2',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'uaflix-button', // Унікальний клас для кнопки
        selectors: {
            container: '.full-start__buttons, .selector__buttons', // Основні контейнери Lampa
            items: '.short', // Елементи фільмів на uafix.net
            title: '.short-title',
            link: '.short-link a',
            poster: '.short-img img',
            quality: '.short-quality'
        }
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
            const items = doc.querySelectorAll(CONFIG.selectors.items);

            return Array.from(items).map(item => ({
                title: item.querySelector(CONFIG.selectors.title)?.textContent.trim() || 'Без назви',
                url: this.normalizeUrl(item.querySelector(CONFIG.selectors.link)?.href),
                poster: item.querySelector(CONFIG.selectors.poster)?.src,
                quality: item.querySelector(CONFIG.selectors.quality)?.textContent.trim() || ''
            })).filter(movie => movie.url);
        }

        normalizeUrl(url) {
            if (!url) return '';
            return url.startsWith('http') ? url : `${CONFIG.host}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        showLoader(container) {
            container.innerHTML = `
                <div class="uaflix-loading">
                    <div class="loader"></div>
                    <div>Пошук на ${CONFIG.name}...</div>
                </div>
            `;
        }

        showMovies(movies, container) {
            container.innerHTML = movies.length ? `
                <div class="uaflix-results">
                    ${movies.map(movie => `
                        <div class="movie-card" data-url="${movie.url}">
                            <img src="${movie.poster || 'https://via.placeholder.com/150x225'}" 
                                 alt="${movie.title}" 
                                 onerror="this.src='https://via.placeholder.com/150x225'">
                            <div class="movie-info">
                                <div class="title">${movie.title}</div>
                                ${movie.quality ? `<div class="quality">${movie.quality}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : this.showEmpty();
            
            this.addMovieListeners(container);
        }

        showError(error, container) {
            container.innerHTML = `
                <div class="uaflix-error">
                    <div class="error-icon">!</div>
                    <div>${error.message || 'Сталася помилка'}</div>
                </div>
            `;
        }

        showEmpty() {
            return `
                <div class="uaflix-empty">
                    <div class="empty-icon">∅</div>
                    <div>Нічого не знайдено</div>
                </div>
            `;
        }

        addMovieListeners(container) {
            container.querySelectorAll('.movie-card').forEach(card => {
                card.addEventListener('click', () => {
                    const url = card.dataset.url;
                    if (url) {
                        Lampa.Player.play({
                            title: card.querySelector('.title')?.textContent || CONFIG.name,
                            url: url,
                            external: true
                        });
                    }
                });
            });
        }
    }

    // Додавання кнопки в інтерфейс
    function addUaflixButton() {
        const buttonHtml = `
            <div class="full-start__button selector ${CONFIG.buttonClass}" 
                 data-subtitle="${CONFIG.name} ${CONFIG.version}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                </svg>
                <span>${CONFIG.name}</span>
            </div>
        `;

        const tryAddButton = () => {
            const container = document.querySelector(CONFIG.selectors.container);
            if (container && !container.querySelector(`.${CONFIG.buttonClass}`)) {
                container.insertAdjacentHTML('beforeend', buttonHtml);
                
                container.querySelector(`.${CONFIG.buttonClass}`).addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = Lampa.Storage.get('card');
                    if (card) Lampa.Plugin.exec(CONFIG.name, card);
                });
            }
        };

        if (window.Lampa) {
            tryAddButton();
        } else {
            const waitForLampa = setInterval(() => {
                if (window.Lampa) {
                    clearInterval(waitForLampa);
                    tryAddButton();
                }
            }, 300);
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!window.Lampa) return setTimeout(initPlugin, 500);
        
        Lampa.Plugin.register(CONFIG.name, new UaflixPlugin());
        addUaflixButton();
        
        console.log(`${CONFIG.name} v${CONFIG.version} ініціалізовано`);
    }

    // Запуск
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('load', initPlugin);
    }
})();
