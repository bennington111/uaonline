// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     4.8
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
        version: '4.8',
        url: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'view--uaflix_plugin'
    };

    // Надійне очікування елементів
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - start >= timeout) {
                    reject(new Error(`Element ${selector} not found`));
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
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

    // Ініціалізація плагіна
    async function init() {
        try {
            // Чекаємо на завантаження Lampa
            await new Promise(resolve => {
                const checkLampa = () => {
                    if (window.lampa && window.lampa.plugins) {
                        resolve();
                    } else {
                        setTimeout(checkLampa, 100);
                    }
                };
                checkLampa();
            });

            // Реєстрація плагіна
            lampa.plugins.Uaflix = {
                name: CONFIG.name,
                component: UaflixComponent
            };

            // Чекаємо на контейнер кнопок
            const container = await waitForElement('.full-start__buttons');
            
            // Додаємо кнопку
            const button = `
                <div class="full-start__button selector ${CONFIG.buttonClass}" data-subtitle="${CONFIG.title} ${CONFIG.version}">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z" fill="currentColor"/>
                    </svg>
                    <span>${CONFIG.title}</span>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', button);
            
            // Обробник кліку
            container.querySelector(`.${CONFIG.buttonClass}`).addEventListener('click', (e) => {
                e.preventDefault();
                const card = lampa.getCurrentCard();
                if (card) {
                    lampa.plugins.fullStartHide();
                    lampa.plugins.exec(CONFIG.name, card);
                }
            });

            console.log(`${CONFIG.title} v${CONFIG.version} successfully initialized`);
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // Дублюючий компонент для сумісності
    class UaflixComponent extends UaflixPlugin {}
})();
