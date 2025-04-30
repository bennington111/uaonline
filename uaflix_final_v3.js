// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     3.9
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Storage) return;

    const plugin_name = 'uaflix';

    function log(msg) {
        console.log(`[${plugin_name}]`, msg);
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалось отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук UAFlix: ${title}`);

        const query = encodeURIComponent(title);
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${query}`;

        try {
            const response = await fetch(searchUrl);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const resultLink = doc.querySelector('.short-title a');

            if (resultLink) {
                const href = resultLink.href;
                log('Знайдено фільм: ' + href);

                // 🟡 Тут ти можеш парсити сторінку href далі і витягнути стріми
                // Але для прикладу — просто відкриваємо сторінку в браузері
                Lampa.Platform.open(href);
            } else {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
            }
        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
        }
    }

    function addButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite' || !e.data || !e.data.movie) return;

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
