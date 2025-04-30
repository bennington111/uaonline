// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     3.10
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.0.0';
    const mod_id = 'uaflix';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'UAFlix',
        description: 'Перегляд з сайту UAFlix (uafix.net)',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    const button_html = `
    <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span>UAFlix</span>
    </div>`;

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const btn = $(Lampa.Lang.translate(button_html));

            btn.on('hover:enter', function () {
                loadOnline(e.data.movie);
            });

            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук UAFlix: ${title}`);

        const query = encodeURIComponent(title);
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${query}`;
        const proxyUrl = 'https://corsproxy.io/?';

        try {
            const response = await fetch(proxyUrl + encodeURIComponent(searchUrl));
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const resultLink = doc.querySelector('.sres-wrap');

            if (resultLink) {
                const href = resultLink.href;
                console.log('[uaflix] Знайдено:', href);
                Lampa.Platform.open(href);
            } else {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
            }
        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
        }
    }
})();
