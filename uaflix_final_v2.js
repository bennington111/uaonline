// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     2.0
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
        version: '2.0',
        url: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        proxy: 'https://corsproxy.io/?' // Альтернативи: 'https://api.allorigins.win/raw?url=', 'https://cors-anywhere.herokuapp.com/'
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
                .then(films => this.renderFilms(films, element))
                .catch(error => this.renderError(error, element));
        }

        async search(query) {
            try {
                const searchUrl = `${config.url}/search?do=search&subaction=search&q=${encodeURIComponent(query)}`;
                const response = await fetch(`${config.proxy}${encodeURIComponent(searchUrl)}`);
                
                if (!response.ok) throw new Error('Помилка запиту до Uaflix');
                
                const html = await response.text();
                return this.parseHtml(html);
            } catch (error) {
                console.error('Uaflix search error:', error);
                throw error;
            }
        }

        parseHtml(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = doc.querySelectorAll('.short');

            return Array.from(items).map(item => {
                const link = item.querySelector('.short-link a');
                const img = item.querySelector('.short-img img');
                
                return {
                    title: item.querySelector('.short-title')?.textContent.trim() || 'Без назви',
                    url: link?.href ? this.normalizeUrl(link.href) : '',
                    poster: img?.src || '',
                    quality: item.querySelector('.short-quality')?.textContent.trim() || ''
                };
            }).filter(film => film.url);
        }

        normalizeUrl(url) {
            return url.startsWith('http') ? url : `${config.url}${url.startsWith('/') ? '' : '/'}${url}`;
        }

        renderLoading(element) {
            element.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на ${config.name}...</div>
                </div>
            `;
        }

        renderFilms(films, element) {
            element.innerHTML = films.length ? `
                <div class="online-plugin__items">
                    ${films.map(film => `
                        <div class="online-plugin__item" data-url="${film.url}">
                            <div class="online-plugin__item-poster">
                                <img src="${film.poster}" alt="${film.title}" onerror="this.src='https://via.placeholder.com/150x225'">
                            </div>
                            <div class="online-plugin__item-info">
                                <div class="online-plugin__item-title">${film.title}</div>
                                ${film.quality ? `<div class="online-plugin__item-quality">${film.quality}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : this.renderEmpty();
            
            this.addEventListeners(element);
        }

        renderError(error, element) {
            element.innerHTML = `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <div class="online-plugin__empty-title">Помилка завантаження</div>
                    <div class="online-plugin__empty-description">${error.message || 'Невідома помилка'}</div>
                </div>
            `;
        }

        renderEmpty() {
            return `
                <div class="online-plugin__empty">
                    <div class="online-plugin__empty-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <div class="online-plugin__empty-title">Нічого не знайдено</div>
                </div>
            `;
        }

        addEventListeners(element) {
            element.querySelectorAll('.online-plugin__item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    if (url) {
                        Lampa.Player.play({
                            title: item.querySelector('.online-plugin__item-title')?.textContent || config.name,
                            url: url,
                            external: true
                        });
                    }
                });
            });
        }
    }

    // Додавання кнопки в інтерфейс Lampa
    function addButtonToUI() {
        const buttonHtml = `
            <div class="full-start__button selector view--ua_flix" data-subtitle="${config.name} ${config.version}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                </svg>
                <span>${config.name}</span>
            </div>
        `;

        const addButton = () => {
            const buttonsContainer = document.querySelector('.selector__buttons, .full-start__buttons');
            if (buttonsContainer && !buttonsContainer.querySelector('.view--ua_flix')) {
                buttonsContainer.insertAdjacentHTML('beforeend', buttonHtml);
                
                const button = buttonsContainer.querySelector('.view--ua_flix');
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = Lampa.Storage.get('card');
                    if (card) {
                        Lampa.Plugin.exec(config.name, card);
                    }
                });
            }
        };

        if (window.Lampa) {
            addButton();
        } else {
            const checkLampa = setInterval(() => {
                if (window.Lampa) {
                    clearInterval(checkLampa);
                    addButton();
                }
            }, 500);
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!window.Lampa) {
            setTimeout(initPlugin, 1000);
            return;
        }

        Lampa.Plugin.register(config.name, new UaflixPlugin());
        addButtonToUI();
        console.log(`${config.name} plugin v${config.version} loaded`);
    }

    // Запуск
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('load', initPlugin);
    }
})();
