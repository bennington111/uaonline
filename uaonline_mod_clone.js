(function () {
    function log(text) {
        console.log('%c[UA Kino]', 'color: orange', text);
    }

    log('Плагін завантажено');

    // Додаємо online-модуль
    Lampa.Module.add({
        component: 'online',
        name: 'uaonline_mod',
        type: 'video',
        onSearch: function (query, call) {
            call([]);
        },
        onDetails: function (item, call) {
            call([{
                title: 'Переглянути на uakino',
                file: 'https://uakino.me/',
                quality: 'HD',
            }]);
        }
    });

    // Додаємо кнопку
    Lampa.Player.addSource({
        title: 'Онлайн UA Kino',
        module: 'uaonline_mod',
        name: 'UA Kino',
        supported: ['movie', 'tv']
    });
})();
