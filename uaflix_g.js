// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.1
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
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

    // Реєстрація плагіна в Lampa
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    // Додаємо кнопку після повного завантаження сторінки
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            const button_html = `
            <div class="full-start__button selector view--uaflix" data-subtitle="UAFlix ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`;
            const btn = $(button_html);
            // Додаємо кнопку до DOM
            $('.full-start__button').last().after(btn);

            // Додавання обробника події на натискання
            btn.on('hover:enter', function () {
                console.log('UAFlix: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    // Функція для пошуку фільму та запуску відео
    async function loadOnline(movie) {
        console.log('UAFlix: Функція loadOnline викликається');
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук UAFlix: ${title}`);

        const query = encodeURIComponent(title);
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${query}`;
        const proxyUrlSearch = 'https://corsproxy.io/?'; // Для пошуку сторінки фільму
        const proxyUrlVideo = 'https://api.allorigins.win/get?url='; // Локальне проксі для отримання відео

        try {
            // Спочатку шукаємо посилання на сторінку фільму через проксі
            const searchResponse = await fetch(proxyUrlSearch + encodeURIComponent(searchUrl));
            const searchHtml = await searchResponse.text();
            console.log('UAFlix: Отримана HTML відповідь пошуку:', searchHtml);

            const searchParser = new DOMParser();
            const searchDoc = searchParser.parseFromString(searchHtml, 'text/html');
            const resultLink = searchDoc.querySelector('a[href^="https://uafix.net/films/"]');

            if (resultLink) {
                const filmPageUrl = resultLink.href;
                console.log('[uaflix] Знайдено посилання на фільм:', filmPageUrl);

                // Тепер отримуємо відео URL через локальне проксі
                const videoResponse = await fetch(proxyUrlVideo + encodeURIComponent(filmPageUrl));
                const videoHtml = await videoResponse.text();
                console.log('UAFlix: Отримана HTML відповідь для відео:', videoHtml);

                const videoParser = new DOMParser();
                const videoDoc = videoParser.parseFromString(videoHtml, 'text/html');

                // Перехоплюємо запити для отримання відео через m3u8
                const originalFetch = window.fetch;
                window.fetch = function (url, options) {
                    if (url.includes('.m3u8')) {
                        console.log('[uaflix] Перехоплено запит на m3u8: ' + url);
                        // Виводимо посилання на екран або передаємо в плеєр
                        Lampa.Player.play({ url: url, title: `UAFlix: ${title}` });
                    }
                    return originalFetch.apply(this, arguments);
                };

                // Після перехоплення посилання відтворюємо відео
                const videoUrl = JSON.parse(videoHtml).videoUrl;

                if (videoUrl) {
                    console.log('[uaflix] Знайдено відео URL:', videoUrl);
                } else {
                    Lampa.Noty.show('Не вдалося знайти відео');
                }
            } else {
                Lampa.Noty.show('Нічого не знайдено на UAFlix');
            }
        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Помилка при пошуку на UAFlix');
        }
    }
})();
