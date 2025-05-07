// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.0
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
        proxy: false
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

        try {
            // Спочатку шукаємо посилання на сторінку фільму
            const searchResponse = await fetch(searchUrl);
            const searchHtml = await searchResponse.text();

            console.log('Kinoukr: Отримана HTML відповідь пошуку:', searchHtml);

            const searchParser = new DOMParser();
            const searchDoc = searchParser.parseFromString(searchHtml, 'text/html');

            // Шукаємо перший елемент з посиланням на сторінку фільму
            const resultLink = searchDoc.querySelector('a[href^="https://kinoukr.com/"]');

            if (resultLink) {
                const filmPageUrl = resultLink.href;
                console.log('[Kinoukr] Знайдено посилання на фільм:', filmPageUrl);

                // Тепер отримуємо відео URL без використання проксі
                const videoResponse = await fetch(filmPageUrl);
                const videoHtml = await videoResponse.text();

                console.log('Kinoukr: Отримана HTML відповідь для відео:', videoHtml);

                const videoParser = new DOMParser();
                const videoDoc = videoParser.parseFromString(videoHtml, 'text/html');

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
