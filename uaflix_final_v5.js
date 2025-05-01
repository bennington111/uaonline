// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     2.7
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const version = '1.0.0';
    const plugin = 'uaflix';

    Lampa.Plugin.create(plugin, version, 'Uaflix', function () {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            const btn = $(`<div class="full-start__button selector view--${plugin}" data-subtitle="Uaflix ${version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`);

            btn.on('hover:enter', function () {
                const title = e.data.title || e.data.name || '';
                if (!title) return;

                Lampa.Noty.show('Пошук на UAFlix...');

                searchOnUAFlix(title).then(url => {
                    if (!url) {
                        Lampa.Noty.show('Нічого не знайдено на UAFlix');
                        return;
                    }

                    getPlayerLink(url).then(link => {
                        if (link) {
                            Lampa.Player.play(link, title);
                        } else {
                            Lampa.Noty.show('Не вдалося отримати відео');
                        }
                    });
                }).catch(err => {
                    console.error('UAFlix Error:', err);
                    Lampa.Noty.show('Помилка при пошуку на UAFlix');
                });
            });

            const container = e.object.activity.render().find('.view--torrent');
            if (container.length) container.after(btn);
        });

        async function searchOnUAFlix(query) {
            const url = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search');
            const formData = new URLSearchParams();
            formData.append('do', 'search');
            formData.append('subaction', 'search');
            formData.append('story', query);

            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const text = await res.text();
            const html = document.createElement('div');
            html.innerHTML = text;

            const link = html.querySelector('.sres-wrap a');
            if (!link) return null;

            const href = link.getAttribute('href');
            return href.startsWith('http') ? href : 'https://uafix.net' + href;
        }

        async function getPlayerLink(filmUrl) {
            const corsUrl = 'https://corsproxy.io/?' + encodeURIComponent(filmUrl);
            const res = await fetch(corsUrl);
            const text = await res.text();

            const match = text.match(/<video[^>]+src="([^"]+\.m3u8)"/);
            return match ? match[1] : null;
        }
    });
})();

