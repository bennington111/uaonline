// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.3
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
        version: '3.3',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'view--uaflix_plugin'
    };

    // Функція очікування завантаження Lampa
    function waitForLampa() {
        return new Promise(resolve => {
            if (window.Lampa && window.Lampa.Plugin && window.Lampa.Listener) {
                return resolve();
            }

            const checkInterval = setInterval(() => {
                if (window.Lampa && window.Lampa.Plugin && window.Lampa.Listener) {
                    clearInterval(checkInterval);
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

            // Тимчасовий приклад результатів
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

    // Додавання кнопки через Listener.follow
    async function setupPlugin() {
        try {
            await waitForLampa();
            
            // Реєстрація плагіна
            Lampa.Plugin.register(CONFIG.name, new UaflixPlugin());

            // HTML кнопки
            const button = `
                <div class="full-start__button selector ${CONFIG.buttonClass}" data-subtitle="${CONFIG.title} ${CONFIG.version}">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z" fill="currentColor"/>
                    </svg>
                    <span>${CONFIG.title}</span>
                </div>
            `;

            // Додаємо кнопку при завантаженні сторінки
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'complite') {
                    const btn = Lampa.Template.js(button);
                    btn.on('hover:enter', function() {
                        Lampa.Plugin.exec(CONFIG.name, e.data.movie, document.querySelector('.full-start__content'));
                    });
                    
                    // Додаємо кнопку після торрент-кнопки або іншого джерела
                    const target = e.object.activity.render().find('.view--torrent, .view--online_mod');
                    if (target.length) {
                        target.after(btn);
                    } else {
                        e.object.activity.render().find('.full-start__buttons').append(btn);
                    }
                }
            });

            console.log(`${CONFIG.name} v${CONFIG.version} successfully initialized`);
        } catch (error) {
            console.error(`Помилка ініціалізації ${CONFIG.name}:`, error);
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        setupPlugin();
    } else {
        window.addEventListener('load', setupPlugin);
    }
})();
