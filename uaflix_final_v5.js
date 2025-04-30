// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.2
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    var manifest = {
        version: 'v6',
        name: 'UAFlix',
        description: 'Джерело відео з сайту uafix.net',
        author: 'bennington111',
        type: 'video',
        component: 'uaflix'
    };

    if (!window.Lampa) return;

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    const button = `
        <div class="full-start__button selector view--uaflix" data-subtitle="online uaflix ${manifest.version}">
            <svg viewBox="0 0 244 260" width="24" height="24">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0 
                    L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z 
                    M10,88 L2,50.2L47.8,80L10,88z" fill="currentColor"/>
            </svg>
            <span>UAFlix</span>
        </div>`;

    Lampa.Component.add('uaflix', {
        render: function () { },
        start: function () { }
    });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const btn = $(Lampa.Lang.translate(button));
            btn.on('hover:enter', function () {
                searchOnUAFlix(e.data.movie);
            });
            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });

    async function searchOnUAFlix(movie) {
        try {
            const query = movie.original_title || movie.title;
            const url = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${encodeURIComponent(query)}`;
            const html = await fetch(url).then(res => res.text());
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const result = doc.querySelector('.sres-wrap a');
            if (!result) {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
                return;
            }

            const filmUrl = result.href;
            console.log('[uaflix] Знайдено:', filmUrl);

            const filmHtml = await fetch(filmUrl).then(res => res.text());
            const filmDoc = parser.parseFromString(filmHtml, 'text/html');

            const videoTag = filmDoc.querySelector('video[src$=".m3u8"]');
            if (!videoTag) {
                Lampa.Noty.show('Плеєр не знайдено на UAFlix');
                return;
            }

            const m3u8 = videoTag.getAttribute('src');
            console.log('[uaflix] M3U8:', m3u8);

            Lampa.Player.play(m3u8);
            Lampa.Player.start();
        } catch (err) {
            console.error('[uaflix] Error:', err);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
        }
    }
})();

