// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.1
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
        version: '3.1',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'uaflix-button'
    };

    // Очікування завантаження Lampa
    function waitForLampa() {
        return new Promise(resolve => {
            if (window.Lampa && window.Lampa.Plugin) {
                return resolve();
            }

            const timer = setInterval(() => {
                if (window.Lampa && window.Lampa.Plugin) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }

    // Головний клас плагіна
    class UaflixPlugin {
        constructor() {
            this.name = CONFIG.name;
            this.type = 'online';
            this.icon = CONFIG.icon;
        }

        exec(item, container) {
            container.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на ${CONFIG.title}...</div>
                </div>
            `;

            // Тут буде логіка пошуку фільмів
            setTimeout(() => {
                container.innerHTML = `
                    <div class="online-plugin__empty">
                        <div class="online-plugin__empty-icon">!</div>
                        <div class="online-plugin__empty-title">Функціонал в розробці</div>
                    </div>
                `;
            }, 1500);
        }
    }

    // Додавання кнопки в інтерфейс
    async function addButton() {
        await waitForLampa();
        
        // Реєстрація плагіна
        Lampa.Plugin.register(CONFIG.name, new UaflixPlugin());

        // Створення кнопки
        const buttonHtml = `
            <div class="selectbox-item selectbox-item--icon selector ${CONFIG.buttonClass}">
                <div class="selectbox-item__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                    </svg>
                </div>
                <div>
                    <div class="selectbox-item__title">${CONFIG.title}</div>
                    <div class="selectbox-item__subtitle">v${CONFIG.version}</div>
                </div>
            </div>
        `;

        // Пошук контейнера та додавання кнопки
        const addButtonToUI = () => {
            const container = document.querySelector('.selectbox__body .scroll__body');
            if (container && !container.querySelector(`.${CONFIG.buttonClass}`)) {
                container.insertAdjacentHTML('beforeend', buttonHtml);
                
                // Обробник кліку
                container.querySelector(`.${CONFIG.buttonClass}`).addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = Lampa.Storage.get('card');
                    if (card) {
                        Lampa.Plugin.exec(CONFIG.name, card, document.querySelector('.full-start__content'));
                    }
                });
            }
        };

        // Спробуємо додати кнопку відразу
        addButtonToUI();

        // Якщо контейнер ще не готовий, чекаємо
        if (!document.querySelector('.selectbox__body')) {
            const observer = new MutationObserver(() => {
                if (document.querySelector('.selectbox__body')) {
                    observer.disconnect();
                    addButtonToUI();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        addButton();
    } else {
        window.addEventListener('load', addButton);
    }
})();
