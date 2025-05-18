// ==UserScript==
// @name        Eneyida Multi-step Parser
// @namespace   eneyida
// @version     2.0
// @description Парсер для eneyida.tv: шукає iframe, потім шукає m3u8 на зовнішньому сайті і запускає Lampa плеєр
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '2.0';
    const mod_id = 'eneyida_multi_step';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida Multi-step Parser',
        description: 'Парсер для eneyida.tv з багатокроковим пошуком відео',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            console.log('[Eneyida Multi-step Parser] movie object:', movie);

            const button_html = `
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida Multi-step Parser ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida Multi-step Parser</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida Multi-step Parser: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    const proxy = 'https://cors.apn.monster/';

    // Крок 1: Отримуємо сторінку фільму, шукаємо iframe src
    async function getIframeSrc(filmPageUrl) {
        console.log('[Eneyida Multi-step Parser] Отримуємо сторінку фільму:', filmPageUrl);

        const resp = await fetch(proxy + filmPageUrl);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const iframe = doc.querySelector('iframe');
        if (!iframe) throw new Error('iframe не знайдено на сторінці фільму');

        const src = iframe.src || iframe.getAttribute('src');
        if (!src) throw new Error('src iframe не знайдено');

        console.log('[Eneyida Multi-step Parser] Знайдено iframe src:', src);
        return src;
    }

    // Крок 2: Отримуємо сторінку embed і шукаємо пряме посилання file: "..."
    async function getM3u8FromEmbed(embedUrl) {
        console.log('[Eneyida Multi-step Parser] Отримуємо сторінку embed:', embedUrl);

        const resp = await fetch(proxy + embedUrl);
        const html = await resp.text();

        const m3u8Match = html.match(/file:\s*"([^"]+\.m3u8)"/);
        if (!m3u8Match) throw new Error('m3u8 посилання не знайдено на сторінці embed');

        console.log('[Eneyida Multi-step Parser] Знайдено m3u8:', m3u8Match[1]);
        return m3u8Match[1];
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        let filmPageUrl = movie.pageUrl || movie.url || movie.link;
        if (!filmPageUrl) {
            Lampa.Noty.show('Не вдалося отримати URL сторінки фільму');
            console.error('[Eneyida Multi-step Parser] Немає URL у movie:', movie);
            return;
        }

        if (!filmPageUrl.startsWith('http')) {
            filmPageUrl = 'https://eneyida.tv' + (filmPageUrl.startsWith('/') ? '' : '/') + filmPageUrl;
        }

        try {
            // 1. Дістаємо iframe з сторінки фільму
            const iframeSrc = await getIframeSrc(filmPageUrl);

            // 2. З iframe-сторінки дістаємо пряме посилання на m3u8
            const m3u8Url = await getM3u8FromEmbed(iframeSrc);

            // 3. Запускаємо відео в Lampa
            Lampa.Player.play({
                url: m3u8Url,
                title: `Eneyida: ${title}`,
                type: 'hls'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Не вдалося знайти відео для відтворення');
        }
    }
})();
