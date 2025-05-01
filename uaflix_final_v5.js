// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     2.5
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

    function addButton() {
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
                    let title = e.data.movie.title;
                    if (!title) return;

                    Lampa.Noty.show('Пошук на UAFlix...');

                    searchOnUAFlix(title).then(url => {
                        if (!url) {
                            Lampa.Noty.show('Нічого не знайдено на UAFlix');
                            return;
                        }

                        getPlayerLink(url).then(m3u8 => {
                            if (m3u8) {
                                Lampa.Player.play(m3u8, title);
                            } else {
                                Lampa.Noty.show('Не вдалося отримати посилання на плеєр');
                            }
                        });
                    }).catch(err => {
                        console.error('[uaflix] Error:', err);
                        Lampa.Noty.show('Помилка при пошуку на UAFlix');
                    });
                });

                const interval = setInterval(() => {
                    const container = $('.full-start__buttons');
                    if (container.length) {
                        clearInterval(interval);
                        container.append(btn);
                    }
                }, 500);
            }
        });
    }

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
        if (match) return match[1];

        return null;
    }

    addButton();
})();
