// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.1
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const mod_version = '1.1';
    const button_template = `
        <div class="full-start__button selector view--uaflix" data-subtitle="UAFlix ${mod_version}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                <path d="M2 2h20v20H2z"/>
            </svg>
            <span>UAFlix</span>
        </div>
    `;

    function log(...args) {
        console.log('[uaflix]', ...args);
    }

    function searchUaflix(movie) {
        Noty.show('Шукаємо на UAFlix...');

        const query = encodeURIComponent(movie.title);
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${query}`;

        fetch(searchUrl)
            .then(res => res.text())
            .then(async html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const resultLink = doc.querySelector('.sres-wrap a');

                if (!resultLink) {
                    Noty.show('Нічого не знайдено на UAFlix');
                    return;
                }

                const link = resultLink.href;
                log('Знайдено:', link);

                try {
                    const response = await fetch(link);
                    const filmHtml = await response.text();

                    console.log('[uaflix] HTML сторінки фільму:', filmHtml);

                    const iframeMatch = filmHtml.match(/<iframe[^>]+src="([^"]+)"[^>]*>/i);
                    if (!iframeMatch || !iframeMatch[1]) {
                        throw new Error('Плеєр не знайдено');
                    }

                    const iframeUrl = iframeMatch[1];
                    log('Посилання на плеєр:', iframeUrl);

                    Lampa.Player.play({
                        title: movie.title,
                        url: iframeUrl,
                        method: 'embed'
                    });

                    Noty.hide();
                } catch (e) {
                    console.error('[uaflix] Помилка:', e);
                    Noty.show('Помилка при пошуку на UAFlix');
                }
            })
            .catch(err => {
                console.error('[uaflix] fetch error', err);
                Noty.show('Помилка при підключенні до UAFlix');
            });
    }

    function addButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                const btn = $(Lampa.Lang.translate(button_template));

                btn.on('hover:enter', function () {
                    searchUaflix(e.data.movie);
                });

                e.object.activity.render().find('.view--torrent').after(btn);
            }
        });
    }

    addButton();
})();
