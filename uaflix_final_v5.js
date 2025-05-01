// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     2.8
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const plugin = 'uaflix';
    const version = '1.0.0';

    Lampa.Plugin.create(plugin, version, 'UAFlix', function () {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            let btn = $(`<div class="full-start__button selector view--${plugin}" data-subtitle="Uaflix">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`);

            btn.on('hover:enter', function () {
                let title = e.data.title || e.data.name || '';
                if (!title) {
                    Lampa.Noty.show('Назва не знайдена');
                    return;
                }

                Lampa.Noty.show('Пошук на UAFlix...');

                searchUAFlix(title).then(url => {
                    if (!url) {
                        Lampa.Noty.show('Не знайдено');
                        return;
                    }

                    getStream(url).then(link => {
                        if (link) {
                            Lampa.Player.play(link, title);
                        } else {
                            Lampa.Noty.show('Не вдалося отримати відео');
                        }
                    });
                });
            });

            const container = e.object.activity.render().find('.view--torrent');
            if (container.length) container.after(btn);
        });

        async function searchUAFlix(query) {
            const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    do: 'search',
                    subaction: 'search',
                    story: query
                })
            });

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const link = doc.querySelector('.sres-wrap a');
            return link ? 'https://uafix.net' + link.getAttribute('href') : null;
        }

        async function getStream(url) {
            const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(url));
            const html = await res.text();
            const match = html.match(/<source\s+src="([^"]+\.m3u8)"/);
            return match ? match[1] : null;
        }
    });
})();

