// ==UserScript==
// @name        Eneyida Playerjs m3u8 Parser
// @namespace   eneyida
// @version     1.6
// @description Плагін для eneyida.tv з пошуком m3u8 у Playerjs на hdvbua.pro
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.6';
    const mod_id = 'eneyida_playerjs_m3u8';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida Playerjs m3u8 Parser',
        description: 'Пошук прямого m3u8 з Playerjs на hdvbua.pro для eneyida.tv',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            console.log('[Eneyida Playerjs m3u8 Parser] movie object:', movie);

            const button_html = `
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida Playerjs m3u8 ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida Playerjs m3u8</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida Playerjs m3u8 Parser: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    async function searchM3u8(url, depth = 0) {
        if (depth > 3) throw new Error('Глибина пошуку перевищена');

        const proxy = 'https://cors.apn.monster/';

        console.log(`[Eneyida Playerjs m3u8 Parser] Запит сторінки: ${url} (глибина ${depth})`);

        const resp = await fetch(proxy + url);
        const html = await resp.text();

        console.log(`[Eneyida Playerjs m3u8 Parser] Отриманий HTML з ${url} (перші 2000 символів):\n`, html.substring(0, 2000));

        // Шукаємо пряме посилання в Playerjs
        const playerFileMatch = html.match(/file:\s*"([^"]+\.m3u8)"/);
        if (playerFileMatch) {
            console.log(`[Eneyida Playerjs m3u8 Parser] Знайдено пряме посилання file:`, playerFileMatch[1]);
            return playerFileMatch[1];
        }

        // Якщо не знайдено, шукаємо iframe і рекурсивно парсимо
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const iframe = doc.querySelector('iframe');
        if (iframe) {
            const iframeUrl = iframe.src || iframe.getAttribute('src');
            if (iframeUrl) {
                console.log(`[Eneyida Playerjs m3u8 Parser] Переходимо в iframe: ${iframeUrl}`);
                return await searchM3u8(iframeUrl, depth + 1);
            }
        }

        throw new Error('m3u8 посилання не знайдено');
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        let filmPageUrl = movie.pageUrl || movie.url || movie.link;

        if (filmPageUrl && !filmPageUrl.startsWith('http')) {
            filmPageUrl = 'https://eneyida.tv' + (filmPageUrl.startsWith('/') ? '' : '/') + filmPageUrl;
        }

        if (!filmPageUrl) {
            Lampa.Noty.show('Не вдалося отримати URL сторінки фільму');
            console.error('[Eneyida Playerjs m3u8 Parser] Немає URL у movie:', movie);
            return;
        }

        Lampa.Noty.show(`Пошук відео для: ${title}`);

        try {
            const videoUrl = await searchM3u8(filmPageUrl);
            console.log('[Eneyida Playerjs m3u8 Parser] Знайдено посилання на відео:', videoUrl);

            Lampa.Player.play({
                url: videoUrl,
                title: `Eneyida Playerjs m3u8: ${title}`,
                type: 'hls'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Не вдалося знайти відео для відтворення');
        }
    }
})();
