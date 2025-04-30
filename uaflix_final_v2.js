// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.5
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація
    const config = {
        name: 'Uaflix',
        title: 'Uaflix',
        version: '3.5',
        host: 'https://uafix.net',
        icon: 'https://uafix.net/favicon.ico',
        buttonClass: 'view--uaflix_plugin'
    };

    // Надійне очікування Lampa
    function waitForLampa() {
        return new Promise(resolve => {
            const check = () => {
                if (window.Lampa && window.Lampa.Plugin && window.Lampa.Listener && window.Lampa.Template) {
                    resolve();
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
            this.name = config.name;
            this.type = 'online';
            this.icon = config.icon;
        }

        exec(item, container) {
            container.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на ${config.title}...</div>
                </div>
            `;

            // Тут буде реальний пошук фільмів
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
            // Чекаємо на повне завантаження Lampa
            await waitForLampa();
            console.log('Lampa повністю завантажена, ініціалізація плагіна...');

            // Реєстрація плагіна
            Lampa.Plugin.register(config.name, new UaflixPlugin());

            // HTML кнопки
            const button = `
                <div class="full-start__button selector ${config.buttonClass}" data-subtitle="${config.title} ${config.version}">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z" fill="currentColor"/>
                    </svg>
                    <span>${config.title}</span>
                </div>
            `;

            // Додавання кнопки через Listener.follow
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'complite') {
                    const btn = Lampa.Template.js(button);
                    btn.on('hover:enter', function() {
                        Lampa.Plugin.exec(config.name, e.data.movie, document.querySelector('.full-start__content'));
                    });

                    // Додаємо кнопку після останнього джерела
                    const buttonsContainer = e.object.activity.render().find('.full-start__buttons');
                    if (buttonsContainer.length) {
                        buttonsContainer.append(btn);
                    }
                }
            });

            console.log(`${config.title} v${config.version} успішно ініціалізовано`);
        } catch (error) {
            console.error('Помилка ініціалізації плагіна:', error);
        }
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
