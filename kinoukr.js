// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.5
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://kinoukr.com/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.0.0';
    const mod_id = 'kinoukr';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'Kinoukr',
        description: 'Перегляд з сайту Kinoukr',
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
            <div class="full-start__button selector view--kinoukr" data-subtitle="Kinoukr ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>Kinoukr</span>
            </div>`;
            const btn = $(button_html);
            // Додаємо кнопку до DOM
            $('.full-start__button').last().after(btn);

            // Додавання обробника події на натискання
            btn.on('hover:enter', function () {
                console.log('Kinoukr: Кнопка натиснута');
                loadOnline(movie);
            });
        }
    });

    // Функція для пошуку фільму та запуску відео
    async function loadOnline(movie) {
        console.log('Kinoukr: Функція loadOnline викликається');
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук Kinoukr: ${title}`);

        const query = encodeURIComponent(title);
        const searchUrl = `https://kinoukr.com/index.php?do=search&story=${query}`;
        const proxyUrlSearch = 'https://corsproxy.io/?'; // Для пошуку сторінки фільму
        const proxyUrlVideo = 'https://api.allorigins.win/get?url='; // Для парсингу HTML сторінки фільму

        try {
            // Спочатку шукаємо посилання на сторінку фільму через проксі
            const searchResponse = await fetch(proxyUrlSearch + encodeURIComponent(searchUrl));
            const searchHtml = await searchResponse.text();

            console.log('Kinoukr: Отримана HTML відповідь пошуку:', searchHtml);

            const searchParser = new DOMParser();
            const searchDoc = searchParser.parseFromString(searchHtml, 'text/html');

            // Логування для перевірки, що шукаємо правильний елемент
            console.log('Kinoukr: Пошук елементів на сторінці результатів пошуку...');

            // Шукаємо перший елемент з посиланням на сторінку фільму
            const resultLink = searchDoc.querySelector('a.mask.flex-col.ps-link');
            if (resultLink) {
                let filmPageUrl = resultLink.href;
                console.log('[Kinoukr] Знайдено посилання на фільм:', filmPageUrl);

                // Якщо посилання не містить .html, додаємо його
                if (!filmPageUrl.endsWith('.html')) {
                    filmPageUrl += '.html';
                }

                console.log('[Kinoukr] Оновлене посилання на фільм:', filmPageUrl);

                // Тепер отримуємо відео URL з сторінки фільму через AllOrigins
                const videoResponse = await fetch(proxyUrlVideo + encodeURIComponent(filmPageUrl));
                const videoHtml = await videoResponse.json();

                console.log('Kinoukr: Отримана HTML відповідь для відео:', videoHtml);

                const videoParser = new DOMParser();
                const videoDoc = videoParser.parseFromString(videoHtml.contents, 'text/html');

                // Шукаємо iframe і витягуємо URL з атрибута src
                const iframe = videoDoc.querySelector('iframe');
                const videoUrl = iframe ? iframe.src : null;

                if (videoUrl) {
                    console.log('[Kinoukr] Знайдено відео URL:', videoUrl);

                    // Відкриваємо відео в плеєрі Lampa
                    Lampa.Player.play({ url: videoUrl, title: `Kinoukr: ${title}` });
                } else {
                    Lampa.Noty.show('Не вдалося знайти відео');
                }
            } else {
                Lampa.Noty.show('Нічого не знайдено на Kinoukr');
            }
        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Помилка при пошуку на Kinoukr');
        }
    }
})();
