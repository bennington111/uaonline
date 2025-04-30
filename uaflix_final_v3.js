// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     3.8
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Storage) return;

    const plugin_name = 'uaflix';

    function loadOnline(movie) {
        // 🔁 ТУТ МОЖНА ВСТАВИТИ ЛОГІКУ ПІДГРУЗКИ СТРІМІВ (поки просто alert)
        Lampa.Noty.show(`Завантаження стрімів для: ${movie.title}`);
    }

    function addButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite' || !e.data || !e.data.movie) return;

            // Перевірка, чи кнопка вже додана
            if (e.object.activity.render().find('.view--ua_flix').length) return;

            const button = $(`
                <div class="full-start__button selector view--ua_flix" data-subtitle="UAFlix">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                    </svg>
                    <span>UAFlix</span>
                </div>
            `);

            button.on('hover:enter', function () {
                loadOnline(e.data.movie);
            });

            // Вставляємо кнопку після блоку "Торренти"
            const target = e.object.activity.render().find('.view--torrent');
            if (target.length) target.after(button);
        });
    }

    function init() {
        if (window.Plugin && typeof window.Plugin.register === 'function') {
            window.Plugin.register(plugin_name, {
                init: () => {},
                run: () => {},
                stop: () => {}
            });
        }

        addButton();
    }

    init();
})();
