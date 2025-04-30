// ==UserScript==
// @name        Uaflix for Lampa
// @namespace   uaflix
// @version     3.4
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // Конфігурація
    const mod_name = "Uaflix";
    const mod_title = "Uaflix";
    const mod_version = "3.4";
    const mod_url = "https://uafix.net";
    const mod_icon = "https://uafix.net/favicon.ico";
    const mod_class = "view--uaflix_plugin";

    // Головний клас плагіна
    class UaflixPlugin {
        constructor() {
            this.name = mod_name;
            this.type = 'online';
            this.icon = mod_icon;
        }

        exec(item, container) {
            container.innerHTML = `
                <div class="online-plugin__loading">
                    <div class="online-plugin__loading-progress"></div>
                    <div class="online-plugin__loading-text">Пошук на ${mod_title}...</div>
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

    // Додавання кнопки (аналогічно до online_mod.js)
    function initPlugin() {
        // Чекаємо на завантаження Lampa
        if (!window.Lampa) {
            setTimeout(initPlugin, 100);
            return;
        }

        // Реєстрація плагіна
        Lampa.Plugin.register(mod_name, new UaflixPlugin());

        // HTML кнопки (адаптований з online_mod.js)
        var button = `
            <div class="full-start__button selector ${mod_class}" data-subtitle="${mod_title} ${mod_version}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z" fill="currentColor"/>
                </svg>
                <span>${mod_title}</span>
            </div>
        `;

        // Механізм додавання кнопки (як в online_mod.js)
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                var btn = Lampa.Template.js(button);
                
                btn.on('hover:enter', function() {
                    Lampa.Plugin.exec(mod_name, e.data.movie, document.querySelector('.full-start__content'));
                });
                
                // Додаємо кнопку після торрент-кнопки
                var torrentBtn = e.object.activity.render().find('.view--torrent');
                if (torrentBtn.length) {
                    torrentBtn.after(btn);
                } 
                // Або після іншого онлайн джерела
                else {
                    var onlineBtn = e.object.activity.render().find('.view--online_mod');
                    if (onlineBtn.length) {
                        onlineBtn.after(btn);
                    }
                    // Якщо нічого не знайшли - додаємо в кінець
                    else {
                        e.object.activity.render().find('.full-start__buttons').append(btn);
                    }
                }
            }
        });

        console.log(`${mod_title} v${mod_version} initialized`);
    }

    // Запуск ініціалізації
    if (document.readyState === 'complete') {
        initPlugin();
    } else {
        window.addEventListener('load', initPlugin);
    }
})();
