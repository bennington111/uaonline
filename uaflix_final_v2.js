// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     2.1
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація
    const config = {
        name: 'Uaflix',
        version: '2.1',
        url: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        proxy: 'https://corsproxy.io/?',
        buttonClass: 'view--uaflix-plugin' // Унікальний клас для кнопки
    };

    // Основний клас плагіна
    class UaflixPlugin {
        constructor() {
            this.name = config.name;
            this.type = 'online';
            this.icon = config.icon;
        }

        exec(item, element) {
            this.renderLoading(element);
            this.search(item.title)
                .then(films => this.renderResults(films, element))
                .catch(error => this.renderError(error, element));
        }

        async search(query) {
            try {
                const searchUrl = `${config.url}/search?q=${encodeURIComponent(query)}`;
                const response = await fetch(`${config.proxy}${encodeURIComponent(searchUrl)}`);
                
                if (!response.ok) throw new Error('Помилка завантаження');
                return this.parseResults(await response.text());
            } catch (error) {
                console.error('Uaflix error:', error);
                throw error;
            }
        }

        parseResults(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return Array.from(doc.querySelectorAll('.short')).map(item => ({
                title: item.querySelector('.short-title')?.textContent.trim() || 'Без назви',
                url: this.normalizeUrl(item.querySelector('.short-link a')?.href),
                poster: item.querySelector('.short-img img')?.src,
                quality: item.querySelector('.short-quality')?.textContent.trim() || ''
            })).filter(item => item.url);
        }

        normalizeUrl(url) {
            if (!url) return '';
            return url.startsWith('http') ? url : `${config.url}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        renderLoading(element) {
            element.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Шукаємо на ${config.name}...</div>
                </div>
            `;
        }

        renderResults(films, element) {
            element.innerHTML = films.length ? `
                <div class="online-plugin__items">
                    ${films.map(film => `
                        <div class="online-plugin__item" data-url="${film.url}">
                            <img src="${film.poster || 'https://via.placeholder.com/150x225'}" 
                                 alt="${film.title}" 
                                 onerror="this.src='https://via.placeholder.com/150x225'">
                            <div class="online-plugin__item-title">${film.title}</div>
                            ${film.quality ? `<div class="online-plugin__item-quality">${film.quality}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : this.renderEmpty();
            
            this.addItemListeners(element);
        }

        renderError(error, element) {
            element.innerHTML = `
                <div class="online-plugin__error">
                    <svg width="50" height="50" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div>Помилка: ${error.message || 'Невідома помилка'}</div>
                </div>
            `;
        }

        renderEmpty() {
            return `
                <div class="online-plugin__empty">
                    <svg width="50" height="50" viewBox="0 0 24 24">
                        <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>
                    </svg>
                    <div>Нічого не знайдено</div>
                </div>
            `;
        }

        addItemListeners(element) {
            element.querySelectorAll('.online-plugin__item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    if (url) Lampa.Player.play({
                        title: config.name,
                        url: url,
                        external: true
                    });
                });
            });
        }
    }

    // Додавання кнопки в UI Lampa
    function addButton() {
        const buttonHtml = `
            <div class="full-start__button selector ${config.buttonClass}" 
                 data-subtitle="${config.name} ${config.version}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                </svg>
                <span>${config.name}</span>
            </div>
        `;

        const tryAddButton = () => {
            const container = document.querySelector('.full-start__buttons, .selector__buttons');
            if (container && !container.querySelector(`.${config.buttonClass}`)) {
                container.insertAdjacentHTML('beforeend', buttonHtml);
                
                container.querySelector(`.${config.buttonClass}`).addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = Lampa.Storage.get('card');
                    if (card) Lampa.Plugin.exec(config.name, card);
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

    // Ініціалізація
    function init() {
        if (!window.Lampa) return setTimeout(init, 500);
        
        Lampa.Plugin.register(config.name, new UaflixPlugin());
        addButton();
        console.log(`${config.name} v${config.version} ready`);
    }

    // Запуск
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();
