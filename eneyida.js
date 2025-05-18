// ==UserScript==
// @name        Eneyida
// @namespace   eneyida
// @version     1.0
// @description Плагін для перегляду фільмів з eneyida.tv
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

    async function loadOnline(movie) {
        console.log('Eneyida: Функція loadOnline викликається');
        const title = movie.title || movie.name;
        if (!title) {
            Lampa.Noty.show('Не вдалося отримати назву фільму');
            return;
        }

        Lampa.Noty.show(`Пошук Eneyida: ${title}`);

        const query = encodeURIComponent(title);
        const searchUrl = `https://eneyida.tv/index.php?do=search&subaction=search&search_start=0&full_search=0&story=${query}`;
        const proxyUrl = 'https://cors.apn.monster/';

        try {
            // Пошук сторінки фільму через проксі
            const searchResponse = await fetch(proxyUrl + searchUrl);
            const searchHtml = await searchResponse.text();

            console.log('Eneyida: Отримана HTML відповідь пошуку:', searchHtml);

            const searchParser = new DOMParser();
            const searchDoc = searchParser.parseFromString(searchHtml, 'text/html');

            // Шукаємо перше посилання на фільм
            const resultLink = searchDoc.querySelector('a[href$=".html"]');
            if (!resultLink) {
                Lampa.Noty.show('Нічого не знайдено на Eneyida');
                return;
            }

            const filmPageUrl = resultLink.href.startsWith('http')
                ? resultLink.href
                : 'https://eneyida.tv' + resultLink.getAttribute('href');

            console.log('[Eneyida] Знайдено посилання на фільм:', filmPageUrl);

            // Отримуємо сторінку фільму
            const videoResponse = await fetch(proxyUrl + filmPageUrl);
            const videoHtml = await videoResponse.text();

            console.log('Eneyida: Отримана HTML відповідь для відео:', videoHtml);

            const videoParser = new DOMParser();
            const videoDoc = videoParser.parseFromString(videoHtml, 'text/html');

            // Шукаємо iframe з відео
            const iframe = videoDoc.querySelector('iframe');
            if (!iframe) {
                Lampa.Noty.show('Не вдалося знайти відео на сторінці фільму');
                return;
            }

            const videoUrl = iframe.getAttribute('src');
            console.log('[Eneyida] Знайдено відео URL:', videoUrl);

            // Запускаємо відео через Lampa плеєр
            Lampa.Player.play({
                url: videoUrl,
                title: `Eneyida: ${title}`,
                type: 'embed'
            });

        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Помилка при пошуку на Eneyida');
        }
    }
})();
