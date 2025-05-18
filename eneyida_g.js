// ==UserScript==
// @name        Eneyida
// @namespace   eneyida
// @version     1.1
// @description Плагін для перегляду фільмів з eneyida.tv з отриманням прямого посилання на відео
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.0.0';
    const mod_id = 'eneyida';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida',
        description: 'Перегляд з сайту eneyida.tv',
        type: 'video',
        component: 'online',
        proxy: true
    };

    // Реєстрація плагіна в Lampa
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    // Додаємо кнопку після повного завантаження сторінки
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            const button_html = `
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    async function getVideoUrl(filmPageUrl) {
        const proxy = 'https://cors.apn.monster/';

        // Крок 1: Отримуємо HTML сторінки фільму eneyida.tv
        const filmResp = await fetch(proxy + filmPageUrl);
        const filmHtml = await filmResp.text();

        // Витягуємо iframe з hdvbua.pro
        const iframeMatch = filmHtml.match(/https?:\/\/hdvbua\.pro\/embed\/\d+/);
        if (!iframeMatch) throw new Error('Iframe hdvbua.pro не знайдено');
        const embedUrl = iframeMatch[0];

        // Крок 2: Отримуємо HTML сторінки плеєра hdvbua.pro
        const embedResp = await fetch(proxy + embedUrl);
        const embedHtml = await embedResp.text();

        // Витягуємо пряме посилання на m3u8
        const m3u8Match = embedHtml.match(/https?:\/\/s\d+\.hdvbua\.pro\/[^'"]+\.m3u8/);
        if (!m3u8Match) throw new Error('Пряме посилання m3u8 не знайдено');

        return m3u8Match[0];
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук Eneyida: ${title}`);

        try {
            // Викликаємо функцію, яка отримує прямий URL відео
            const videoUrl = await getVideoUrl(movie.pageUrl);
            console.log('[Eneyida] Знайдено пряме посилання на відео:', videoUrl);

            // Запускаємо відео у плеєрі Lampa з типом hls
            Lampa.Player.play({
                url: videoUrl,
                title: `Eneyida: ${title}`,
                type: 'hls'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Не вдалося отримати відео');
        }
    }
})();
