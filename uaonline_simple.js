(function () {
    function log(text) {
        console.log('%c[UA Kino]', 'color: orange', text);
    }

    log('Плагін завантажено');

    // Додаємо модуль online
    Lampa.Module.add({
        component: 'online',
        name: 'uakino',
        type: 'video',
        onSearch: function (query, call) {
            call([]);
        },
        onDetails: function (item, call) {
            call([{
                title: 'Переглянути на UA Kino',
                file: 'https://uakino.me/',
                quality: 'HD'
            }]);
        }
    });

    // Додаємо кнопку
    Lampa.Player.addSource({
        title: 'Онлайн UA Kino',
        module: 'uakino',
        name: 'UA Kino',
        supported: ['movie', 'tv']
    });
})();
