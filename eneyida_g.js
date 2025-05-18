// ==UserScript==
// @name        Eneyida Full Search Parser
// @namespace   eneyida
// @version     3.0
// @description Плагін для eneyida.tv: пошук, парсинг iframe і запуск m3u8 у Lampa
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '3.0';
    const mod_id = 'eneyida_full_search_parser';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida Full Search Parser',
        description: 'Пошук на сайті, парсинг iframe і запуск m3u8 у Lampa',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    const proxy = 'https://cors.apn.monster/';

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            console.log('[Eneyida Full Search Parser] movie object:', movie);

            const button_html = `
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida Full Search Parser ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida Full Search Parser</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida Full Search Parser: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    // Крок 1: Пошук сторінки фільму за назвою
    async function searchFilmPage(title) {
        const searchUrl = `https://eneyida.tv/index.php?do=search&subaction=search&search_start=0&full_search=0&story=${encodeURIComponent(title)}`;
        console.log('[Eneyida Full Search Parser] Пошук фільму:', searchUrl);

        const resp = await fetch(proxy + searchUrl);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Шукаємо перше посилання на фільм
        // Припускаю, що посилання мають клас 'shortstory' або подібний — треба підкоригувати по сайту
        const firstLink = doc.querySelector('a[href$=".html"]');
        if (!firstLink) throw new Error('Посилання на фільм не знайдено в пошуку');

        let filmPageUrl = firstLink.href || firstLink.getAttribute('href');
        if (!filmPageUrl.startsWith('http')) {
            filmPageUrl = 'https://eneyida.tv' + (filmPageUrl.startsWith('/') ? '' : '/') + filmPageUrl;
        }

        console.log('[Eneyida Full Search Parser] Знайдено URL сторінки фільму:', filmPageUrl);
        return filmPageUrl;
    }

    // Крок 2: З сторінки фільму отримати iframe src
    async function getIframeSrc(filmPageUrl) {
        console.log('[Eneyida Full Search Parser] Отримуємо сторінку фільму:', filmPageUrl);

        const resp = await fetch(proxy + filmPageUrl);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const iframe = doc.querySelector('iframe');
        if (!iframe) throw new Error('iframe не знайдено на сторінці фільму');

        const src = iframe.src || iframe.getAttribute('src');
        if (!src) throw new Error('src iframe не знайдено');

        console.log('[Eneyida Full Search Parser] Знайдено iframe src:', src);
        return src;
    }

    // Крок 3: З iframe-сторінки витягнути посилання m3u8 з Playerjs
    async function getM3u8FromEmbed(embedUrl) {
        console.log('[Eneyida Full Search Parser] Отримуємо сторінку embed:', embedUrl);

        const resp = await fetch(proxy + embedUrl);
        const html = await resp.text();

        const m3u8Match = html.match(/file:\s*"([^"]+\.m3u8)"/);
        if (!m3u8Match) throw new Error('m3u8 посилання не знайдено на сторінці embed');

        console.log('[Eneyida Full Search Parser] Знайдено m3u8:', m3u8Match[1]);
        return m3u8Match[1];
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        try {
            // 1. Шукаємо сторінку фільму через пошук
            const filmPageUrl = await searchFilmPage(title);

            // 2. Отримуємо iframe src зі сторінки фільму
            const iframeSrc = await getIframeSrc(filmPageUrl);

            // 3. З iframe сторінки отримуємо пряме посилання на m3u8
            const m3u8Url = await getM3u8FromEmbed(iframeSrc);

            // 4. Запускаємо відео у плеєрі Lampa
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
