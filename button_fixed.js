(function () {
    function log(msg) {
        console.log('%c[UAOnline]', 'color: gold', msg);
    }

    log('Плагін завантажено');

    // Примусово додаємо порожній online-модуль, щоб зʼявилась секція
    Lampa.Module.add({
        component: 'online',
        name: 'uaonline_placeholder',
        type: 'video',
        onSearch: function (query, call) {
            call([]);
        },
        onDetails: function (url, call) {
            call([]);
        }
    });

    function addSourceButton() {
        const source = {
            title: 'Онлайн UA Online',
            module: 'uaonline',
            name: 'UA Online',
            supported: ['movie', 'tv'],
            onClick: function (item, data) {
                alert('Натиснуто UA Online для ' + item.name);
                // Тут буде код завантаження реальних джерел
            }
        };

        Lampa.Player.addSource(source);
        log('Кнопка додана');
    }

    // Очікуємо, коли додаток готовий
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            log('App ready');
            addSourceButton();
        }
    });
})();
