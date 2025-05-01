// ==UserScript==
// @name        UAFlix
// @namespace   uaflix
// @version     1.0.0
// @description Перегляд з сайту UAFlix (uafix.net)
// @match       *://*/*
// @grant       none
// @run-at      document-end
// ==/UserScript==

(function () {
    const mod_id = 'uaflix';
    const mod_version = '1.0.0';

    const manifest = {
        id: mod_id,
        version: mod_version,
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
            const movie = e.data.movie;
            const btn = $(button_html);

            btn.on('hover:enter', async function () {
                const title = movie.title;
                if (!title) return;

                Lampa.Noty.show('Пошук на UAFlix...');
                console.log('[UAFlix] Пошук для:', title);

                try {
                    const url = await searchOnUAFlix(title);
                    if (!url) {
                        Lampa.Noty.show('Фільм не знайдено на UAFlix');
                        console.warn('[UAFlix] Нічого не знайдено');
                        return;
                    }

                    console.log('[UAFlix] Знайдено URL:', url);

                    const m3u8 = await getPlayerLink(url);
                    if (m3u8) {
                        console.log('[UAFlix] M3U8:', m3u8);
                        Lampa.Player.play(m3u8, title);
                    } else {
                        Lampa.Noty.show('Не вдалося отримати посилання на плеєр');
                        console.warn('[UAFlix] M3U8 не знайдено');
                    }
                } catch (err) {
                    console.error('[UAFlix] Помилка:', err);
                    Lampa.Noty.show('Помилка при пошуку на UAFlix');
                }
            });

            const container = e.object.activity.render().find('.full-start__buttons');
            if (container.find('.view--uaflix').length === 0) {
                container.append(btn);
            }
        }
    });

    async function searchOnUAFlix(query) {
        const proxy = 'https://api.allorigins.win/raw?url=';
        const url = proxy + encodeURIComponent('https://uafix.net/index.php?do=search');

        const formData = new URLSearchParams();
        formData.append('do', 'search');
        formData.append('subaction', 'search');
        formData.append('story', query);

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const html = document.createElement('div');
        html.innerHTML = await res.text();

        const result = html.querySelector('.shortstory a, .search-item a');
        if (!result) return null;

        const href = result.getAttribute('href');
        return href.startsWith('http') ? href : 'https://uafix.net' + href;
    }

    async function getPlayerLink(filmUrl) {
        const proxy = 'https://api.allorigins.win/raw?url=';
        const corsUrl = proxy + encodeURIComponent(filmUrl);
        const res = await fetch(corsUrl);
        const text = await res.text();

        const match = text.match(/<video[^>]+src="([^"]+\.m3u8)"/);
        if (match) return match[1];

        return null;
    }
})();
