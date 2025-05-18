// ==UserScript==
// @name        Eneyida Universal
// @namespace   eneyida
// @version     1.3
// @description Гнучкий плагін для перегляду фільмів з eneyida.tv з пошуком m3u8
// @author      Name
// @icon        https://eneyida.tv/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.1';
    const mod_id = 'eneyida_universal';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Eneyida Universal',
        description: 'Гнучкий плагін з пошуком m3u8 для eneyida.tv',
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
            <div class="full-start__button selector view--eneyida" data-subtitle="Eneyida Universal ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Eneyida Universal</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', function () {
                console.log('Eneyida Universal: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    // Функція для пошуку всіх m3u8 посилань в html
    function findM3u8Links(html) {
        const regex = /https?:\/\/[^"'\\\s]+\.m3u8/g;
        return html.match(regex) || [];
    }

    // Рекурсивна функція пошуку m3u8
    async function searchM3u8(url, depth = 0) {
        if (depth > 3) throw new Error('Глибина пошуку перевищена');

        const proxy = 'https://cors.apn.monster/';

        const resp = await fetch(proxy + url);
        const html = await resp.text();

        // Шукаємо прямі посилання на m3u8
        const m3u8s = findM3u8Links(html);
        if (m3u8s.length) {
            console.log(`[Eneyida Universal] Знайдено m3u8 на ${url}:`, m3u8s[0]);
            return m3u8s[0];
        }

        // Якщо немає m3u8, шукаємо iframe для подальшого парсингу
        const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
        if (iframeMatch) {
            const iframeUrl = iframeMatch[1];
            console.log(`[Eneyida Universal] Перехід до iframe для пошуку m3u8: ${iframeUrl}`);
            return await searchM3u8(iframeUrl, depth + 1);
        }

        throw new Error('m3u8 посилання не знайдено');
    }

    async function loadOnline(movie) {
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук Eneyida Universal: ${title}`);

        try {
            // Виконуємо рекурсивний пошук m3u8
            const videoUrl = await searchM3u8(movie.pageUrl);

            // Запускаємо відео у плеєрі Lampa
            Lampa.Player.play({
                url: videoUrl,
                title: `Eneyida Universal: ${title}`,
                type: 'hls'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Не вдалося знайти відео для відтворення');
        }
    }
})();
