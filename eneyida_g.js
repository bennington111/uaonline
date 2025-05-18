// ==UserScript==
// @name        Eneyida Universal Logger
// @namespace   eneyida
// @version     1.3
// @description Плагін для eneyida.tv з логуванням отриманого HTML для діагностики
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.3';
    const mod_id = 'eneyida_universal_logger';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida Universal Logger',
        description: 'Плагін з логуванням HTML для пошуку m3u8 eneyida.tv',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            const button_html = `
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida Universal Logger ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida Universal Logger</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida Universal Logger: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    function findM3u8Links(html) {
        const regex = /https?:\/\/[^"'()\s]+\.m3u8[^"'()\s]*/g;
        return html.match(regex) || [];
    }

    async function searchM3u8(url, depth = 0) {
        if (depth > 3) throw new Error('Глибина пошуку перевищена');

        const proxy = 'https://cors.apn.monster/';

        console.log(`[Eneyida Universal Logger] Запит сторінки: ${url} (глибина ${depth})`);

        const resp = await fetch(proxy + url);
        const html = await resp.text();

        // Логування отриманого HTML (перші 2000 символів)
        console.log(`[Eneyida Universal Logger] Отриманий HTML з ${url}:\n`, html.substring(0, 2000));

        // Парсимо DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Шукаємо m3u8 у скриптах
        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const script of scripts) {
            const text = script.textContent;
            const m3u8Match = text.match(/https?:\/\/[^"'()\s]+\.m3u8[^"'()\s]*/);
            if (m3u8Match) {
                console.log(`[Eneyida Universal Logger] Знайдено m3u8 у script:`, m3u8Match[0]);
                return m3u8Match[0];
            }
        }

        // Шукаємо m3u8 у всьому HTML
        const m3u8MatchInHtml = html.match(/https?:\/\/[^"'()\s]+\.m3u8[^"'()\s]*/);
        if (m3u8MatchInHtml) {
            console.log(`[Eneyida Universal Logger] Знайдено m3u8 у HTML:`, m3u8MatchInHtml[0]);
            return m3u8MatchInHtml[0];
        }

        // Якщо не знайдено m3u8, шукаємо iframe і рекурсивно парсимо його
        const iframe = doc.querySelector('iframe');
        if (iframe) {
            const iframeUrl = iframe.src || iframe.getAttribute('src');
            if (iframeUrl) {
                console.log(`[Eneyida Universal Logger] Переходимо в iframe: ${iframeUrl}`);
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

        Lampa.Noty.show(`Пошук Eneyida Universal Logger: ${title}`);

        try {
            const videoUrl = await searchM3u8(movie.pageUrl);
            console.log('[Eneyida Universal Logger] Знайдено посилання на відео:', videoUrl);

            Lampa.Player.play({
                url: videoUrl,
                title: `Eneyida Universal Logger: ${title}`,
                type: 'hls'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Не вдалося знайти відео для відтворення');
        }
    }
})();
