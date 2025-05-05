// ==UserScript==
// @version     1.3
// ==/UserScript==

(function () {
    const mod_version = '1.0.0';
    const mod_id = 'uaflix_test';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'UAFlix Test',
        description: 'Тестовий плагін для прямого відео',
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
            <div class="full-start__button selector view--uaflix-test" data-subtitle="UAFlix Test ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix Test</span>
            </div>`;
            const btn = $(button_html);
            // Додаємо кнопку до DOM
            $('.full-start__button').last().after(btn);

            // Додавання обробника події на натискання
            btn.on('hover:enter', function () {
                loadTestVideo();
            });
        }
    });

    // Функція для запуску тестового відео
    function loadTestVideo() {
        const videoUrl = 'https://videos.pexels.com/video-files/4019911/4019911-hd_1080_1920_24fps.mp4'; // Пряме посилання на відео

        // Перевірка URL для правильного запуску
        if (videoUrl) {
            console.log('[uaflix] Знайдено посилання на відео:', videoUrl);
            // Запускаємо відео в плеєрі Lampa через компонент 'online_mod'
            Lampa.Activity.push({
                url: videoUrl,
                title: 'UAFlix Test Video',
                component: 'online_mod',
                page: 1,
                // Можна додати додаткові параметри для плеєра, якщо потрібно
            });
        } else {
            Lampa.Noty.show('Не вдалося знайти відео');
        }
    }
})();
