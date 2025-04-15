(function () {
    function log(text) {
        console.log('%c[UA Kino]', 'color: orange', text);
    }

    log('Плагін завантажено');

    Lampa.Module.add({
        component: 'online',
        name: 'uakino',
        type: 'video',
        onSearch: function (query, call) {
            log('onSearch (ігнорується)');
            call([]);
        },
        onDetails: function (item, call) {
            log('onDetails', item);

            // Приклад — просто повертаємо один фейковий лінк
            call([{
                title: 'Переглянути на UAKino',
                file: 'https://uakino.me/',
                quality: 'HD',
                subtitle: '',
                voice: 'UAKino',
                url: 'https://uakino.me/',
                player: true
            }]);
        }
    });

    Lampa.Player.addSource({
        title: 'Онлайн UAKino',
        module: 'uakino',
        name: 'UAKino',
        supported: ['movie', 'tv'],
        onClick: function (item, data) {
            log('Натиснуто кнопку для', item);
        }
    });
})();
