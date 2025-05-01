(function () {
    // Додаємо плагін до Lampa
    Lampa.Plugin.register('uaflix', {
        title: 'Uaflix',
        version: '1.0',
        description: 'Плагін для перегляду фільмів з uafix.net',
        author: {
            name: 'Bennington111',
            site: 'https://bennington111.github.io/'
        },
        type: 'video',
        init: function () {
            // Слухаємо подію відкриття повної інформації про фільм
            Lampa.Listener.follow('full', function (e) {
                // Додаємо джерело "Uaflix" до списку джерел
                e.object.appendSource({
                    title: 'Uaflix',
                    component: 'uaflix',
                    url: e.movie.url // або інший спосіб отримання URL
                });
            });

            // Реєструємо компонент "uaflix"
            Lampa.Component.add('uaflix', {
                create: function () {
                    // Тут реалізується логіка отримання та відображення відео
                    // Наприклад, можна використати Lampa.Player для відтворення відео
                    Lampa.Player.play({
                        url: 'https://example.com/video.m3u8', // замінити на реальний URL
                        title: 'Uaflix Video',
                        poster: 'https://example.com/poster.jpg' // замінити на реальний постер
                    });
                }
            });
        }
    });
})();
